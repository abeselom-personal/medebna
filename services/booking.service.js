import Booking from '../model/booking/booking.model.js'
import Payment from '../model/payment/payment.model.js'
import Guest from '../model/guest/guest.model.js'


export const createBookingService = async ({ item, kind, checkIn, checkOut, guest, userId }) => {
    let guestDoc = null
    if (!userId && guest) {
        guestDoc = await Guest.create(guest)
    }

    const booking = await Booking.create({
        item,
        kind,
        user: userId || undefined,
        guest: guestDoc?._id,
        checkIn: kind === 'Room' ? checkIn : undefined,
        checkOut: kind === 'Room' ? checkOut : undefined,
        eventDate: kind === 'Event' ? checkIn : undefined,
        status: 'Pending',
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
    const booking = await Booking.find({ _id }).populate('guest')

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
