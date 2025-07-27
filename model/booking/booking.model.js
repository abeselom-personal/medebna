import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'kind' },
    kind: { type: String, enum: ['Room', 'Event'], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },

    // Add capacity info
    adults: { type: Number, min: 1, default: 1 },
    children: { type: Number, min: 0, default: 0 },

    checkIn: Date,
    checkOut: Date,
    eventDate: Date,

    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Pending',
    },
}, { timestamps: true })

bookingSchema.pre('validate', async function(next) {
    if (this.kind === 'Room') {
        if (!this.checkIn || !this.checkOut) {
            return next(new Error('Check-in and check-out are required for room bookings.'))
        }

        const Room = mongoose.model('Room')
        const room = await Room.findById(this.item)
        if (!room) return next(new Error('Room not found'))

        if (this.adults > room.maxAdults)
            return next(new Error('Adults exceed room max capacity'))
        if (this.children > room.maxChildren)
            return next(new Error('Children exceed room max capacity'))

        const Booking = mongoose.model('Booking')
        const overlappingCount = await Booking.countDocuments({
            item: this.item,
            kind: 'Room',
            status: { $in: ['Pending', 'Confirmed'] },
            _id: { $ne: this._id },
            $or: [
                { checkIn: { $lt: this.checkOut, $gte: this.checkIn } },
                { checkOut: { $gt: this.checkIn, $lte: this.checkOut } },
                { checkIn: { $lte: this.checkIn }, checkOut: { $gte: this.checkOut } }
            ]
        })

        if (overlappingCount >= room.totalUnits)
            return next(new Error('No rooms available for the selected dates'))
    } else if (this.kind === 'Event') {
        if (!this.eventDate) {
            return next(new Error('Event date is required for event bookings.'))
        }
    }
    next()
})

bookingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 5, partialFilterExpression: { status: 'Pending' } })

export default mongoose.model('Booking', bookingSchema)
