import DiscountRule from '../model/discount/discountRule.model.js'
import Booking from '../model/booking/booking.model.js'
import Payment from '../model/payment/payment.model.js'
import Guest from '../model/guest/guest.model.js'
import Room from '../model/room/room.model.js'
import mongoose from 'mongoose'

const applyDiscount = async (itemId, kind, checkIn, checkOut) => {
    const now = new Date()
    const discounts = await DiscountRule.find({
        target: itemId,
        targetType: kind,
        enabled: true,
        validFrom: { $lte: now },
        validTo: { $gte: now }
    })

    if (!discounts.length) return { discount: 0, discountId: null }

    const stayDays = kind === 'Room' ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) : 0

    for (const d of discounts) {
        const valid = d.conditions.every(c => {
            if (c.key === 'daysBooked') {
                switch (c.operator) {
                    case '>=': return stayDays >= c.value
                    case '<=': return stayDays <= c.value
                    case '==': return stayDays === c.value
                    case '>': return stayDays > c.value
                    case '<': return stayDays < c.value
                    default: return false
                }
            }
            return true
        })
        if (valid) return { discount: d.discountPercent, discountId: d._id }
    }

    return { discount: 0, discountId: null }
}

const validateAndBookRoom = async (roomId, checkIn, checkOut) => {
    const room = await Room.findById(roomId)
    if (!room) throw new Error('Room not found')

    const now = new Date()
    if (checkIn < now || checkOut <= checkIn) throw new Error('Invalid booking dates')
    if (checkIn < room.availability.from || checkOut > room.availability.to) throw new Error('Room not available')
    if (room.currentCapacity >= room.maxCapacity) throw new Error('Room is fully booked')

    room.currentCapacity += 1
    await room.save()
    return room
}

export const createBookingService = async ({ item, kind, checkIn, checkOut, guest, userId }) => {
    let guestDoc = null
    if (!userId && guest) guestDoc = await Guest.create(guest)

    if (kind === 'Room') await validateAndBookRoom(item, checkIn, checkOut)

    const { discount, discountId } = await applyDiscount(item, kind, checkIn, checkOut)

    const booking = await Booking.create({
        item,
        kind,
        user: userId || undefined,
        guest: guestDoc?._id,
        checkIn: kind === 'Room' ? checkIn : undefined,
        checkOut: kind === 'Room' ? checkOut : undefined,
        eventDate: kind === 'Event' ? checkIn : undefined,
        status: 'Pending',
        discountPercent: discount,
        appliedDiscount: discountId ? new mongoose.Types.ObjectId(discountId) : null
    })

    return booking
}
export const getBookingsService = async () => {
    const bookings = await Booking.find().populate('guest')

    for (const booking of bookings) {
        if (booking.kind === 'Room') {
            await booking.populate({
                path: 'item',
                model: 'Room',
                populate: { path: 'businessId', model: 'Business' },
            })
        } else if (booking.kind === 'Event') {
            await booking.populate({
                path: 'item',
                model: 'Event',
                populate: { path: 'businessId', model: 'Business' },
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
    const booking = await Booking.find({ user: userId }).populate('guest')

    if (!booking) return null

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

    return booking


}


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
