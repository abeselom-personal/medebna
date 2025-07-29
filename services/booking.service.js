import DiscountRule from '../model/discount/discountRule.model.js';
import Booking from '../model/booking/booking.model.js';
import Guest from '../model/guest/guest.model.js';
import User from '../model/user/user.model.js';
import Room from '../model/room/room.model.js';
import mongoose from 'mongoose';

const applyDiscount = async (itemId, kind, checkIn, checkOut) => {
    const now = new Date();
    const discounts = await DiscountRule.find({
        target: itemId,
        targetType: kind,
        enabled: true,
        validFrom: { $lte: now },
        validTo: { $gte: now }
    });

    if (!discounts.length) return { discount: 0, discountId: null };

    const stayDays = kind === 'Room'
        ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
        : 0;

    for (const d of discounts) {
        const valid = d.conditions.every(c => {
            if (c.key === 'daysBooked') {
                switch (c.operator) {
                    case '>=': return stayDays >= c.value;
                    case '<=': return stayDays <= c.value;
                    case '==': return stayDays === c.value;
                    case '>': return stayDays > c.value;
                    case '<': return stayDays < c.value;
                    default: return false;
                }
            }
            return true;
        });
        if (valid) return { discount: d.discountPercent, discountId: d._id };
    }

    return { discount: 0, discountId: null };
};

export const createBookingService = async ({
    item, kind, checkIn, checkOut, guest,
    userId, adults, children, currency = 'ETB' // Default to ETB if not specified
}) => {
    // Validate required fields
    if (!item || !kind) throw new Error('Item and kind are required');
    if (kind === 'Room' && (!checkIn || !checkOut)) {
        throw new Error('Check-in and check-out dates are required for room bookings');
    }

    // Create guest or user record
    let guestDoc = null;
    let userDoc = null;

    if (guest) {
        guestDoc = await Guest.create(guest);
    } else if (userId) {
        userDoc = await User.findById(userId);
        if (!userDoc) throw new Error('User not found');
    } else {
        throw new Error('No booking user defined');
    }

    // Get room details
    const room = await Room.findById(item);
    if (!room) throw new Error('Room not found');

    // Validate currency availability
    const priceObj = room.price.find(p => p.currency === currency);
    if (!priceObj) {
        throw new Error(`Price not available in ${currency}`);
    }

    // Validate dates
    const now = new Date();
    if (new Date(checkIn) < now || new Date(checkOut) <= new Date(checkIn)) {
        throw new Error('Invalid booking dates');
    }

    // Validate room availability
    if (room.availability.from > new Date(checkIn) || room.availability.to < new Date(checkOut)) {
        throw new Error('Room not available for selected dates');
    }

    // Calculate required rooms
    const roomCapacity = room.numberOfAdults + room.numberOfChildren;
    const totalGuests = (adults || 1) + ((children || 0) * 0.5);
    const roomsNeeded = Math.ceil(totalGuests / roomCapacity);

    // Get discount if available
    const { discount, discountId } = await applyDiscount(item, kind, checkIn, checkOut);
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const unitPrice = priceObj.amount;

    const bookings = [];
    let remainingAdults = adults || 1;
    let remainingChildren = children || 0;

    for (let i = 0; i < roomsNeeded; i++) {
        const roomAdults = Math.min(remainingAdults, room.numberOfAdults);
        const roomChildren = Math.min(remainingChildren, room.numberOfChildren);

        const baseCost = unitPrice * nights;
        const discountAmount = (baseCost * discount) / 100;
        const finalCost = baseCost - discountAmount;

        if (room.currentCapacity >= room.maxCapacity) {
            throw new Error('Room fully booked');
        }

        room.currentCapacity += 1;
        await room.save();

        const booking = await Booking.create({
            item,
            kind,
            user: guest ? undefined : userId,
            guest: guestDoc?._id,
            checkIn,
            checkOut,
            adults: roomAdults,
            children: roomChildren,
            status: 'Pending',
            discountPercent: discount,
            appliedDiscount: discountId,
            baseCost,
            finalCost,
            currency, // Store the selected currency
            unitPrice: {
                currency, // Same as booking currency
                base: unitPrice,
                final: unitPrice - (unitPrice * discount / 100),
                ruleId: discountId
            }
        });

        bookings.push(booking);
        remainingAdults -= roomAdults;
        remainingChildren -= roomChildren;
    }

    return bookings;
};
// booking fetch helpers
export const getBookingsService = async () => {
    const bookings = await Booking.find().populate('guest')
    for (const booking of bookings) {
        if (booking.kind === 'Room') {
            await booking.populate({
                path: 'item',
                model: 'Room',
                populate: { path: 'businessId', model: 'Business' }
            })
        } else if (booking.kind === 'Event') {
            await booking.populate({
                path: 'item',
                model: 'Event',
                populate: { path: 'businessId', model: 'Business' }
            })
        }
    }
    return bookings
}

export const getBookingsById = async (_id) => {
    const booking = await Booking.findOne({ _id }).populate('guest')
    if (!booking) return null

    const populateOptions = {
        path: 'item',
        populate: { path: 'businessId', model: 'Business' }
    }

    if (booking.kind === 'Room') populateOptions.model = 'Room'
    else if (booking.kind === 'Event') populateOptions.model = 'Event'

    await booking.populate(populateOptions)
    return booking
}

export const getBookingsByUserId = async (userId) => {
    const bookings = await Booking.find({ user: userId }).populate('guest')

    for (const booking of bookings) {
        if (booking.kind === 'Room') {
            await booking.populate({
                path: 'item',
                model: 'Room',
                populate: { path: 'businessId', model: 'Business' }
            })
        } else if (booking.kind === 'Event') {
            await booking.populate({
                path: 'item',
                model: 'Event',
                populate: { path: 'businessId', model: 'Business' }
            })
        }
    }

    return bookings
}

// tx linking
export const linkTxRefToBooking = async (bookingId, tx_ref) => {
    await Booking.findByIdAndUpdate(bookingId, { $set: { tx_ref } })
}

export const attachPaymentToBooking = async (tx_ref, bookingId, paymentId) => {
    const payment = await Payment.findOne({ tx_ref })
    if (!payment) throw new Error('Payment not found')

    const booking = await Booking.findOne({ _id: bookingId })
    if (!booking) throw new Error('Booking not found for this payment')

    booking.payment = paymentId
    booking.status = 'Confirmed'
    await booking.save()
    return booking
}

// legacy cost calculator
export async function calculateBookingCost(booking) {
    if (booking.kind !== 'Room') return { base: 0, final: 0 }

    const room = await Room.findById(booking.item)
    if (!room || !booking.checkIn || !booking.checkOut) throw new Error('Missing room or booking dates')

    const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))
    const adults = booking.adults ?? 1
    const children = booking.children ?? 0

    const priceObj = room.price.find(p => p.currency === 'ETB') || room.price[0]
    const unitPrice = priceObj.amount
    const base = nights * unitPrice * (adults + children * 0.5)

    let discount = 0
    let appliedDiscount = null

    const rules = await DiscountRule.find({
        kind: 'Room',
        item: booking.item,
        minNights: { $lte: nights }
    }).sort({ minNights: -1 })

    if (rules.length > 0) {
        discount = rules[0].discountPercent
        appliedDiscount = rules[0]._id
    }

    const final = base - (base * discount) / 100

    booking.discountPercent = discount
    booking.appliedDiscount = appliedDiscount
    return { base, final }
}

export const attachPaymentToMultipleBookings = async (tx_ref, bookingIds, paymentId) => {
    const payment = await Payment.findById(paymentId)
    if (!payment) throw new Error('Payment not found')

    const updates = await Promise.all(
        bookingIds.map(async bookingId => {
            const booking = await Booking.findOne({ _id: bookingId })
            if (!booking) return null

            booking.payment = paymentId
            booking.status = 'Confirmed'
            await booking.save()
            return booking
        })
    )

    return updates.filter(Boolean)
}
