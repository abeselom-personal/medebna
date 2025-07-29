import cron from 'node-cron'
import Booking from '../model/booking/booking.model.js'
import Room from '../model/room/room.model.js'

const EXPIRY_HOURS = parseInt(process.env.BOOKING_EXPIRY_HOURS || '5', 10)
const CRON_SCHEDULE = process.env.EXPIRED_BOOKING_CRON || '*/10 * * * *'

cron.schedule(CRON_SCHEDULE, async () => {
    const expired = await Booking.find({
        status: 'Pending',
        createdAt: { $lt: new Date(Date.now() - 1000 * 60 * 60 * EXPIRY_HOURS) }
    })

    for (const booking of expired) {
        if (booking.kind === 'Room') {
            await Room.findByIdAndUpdate(booking.item, { $inc: { currentCapacity: -1 } })
        }
        await booking.deleteOne()
    }
})
