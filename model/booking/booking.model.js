import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'kind' },
    kind: { type: String, enum: ['Room', 'Event'], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest',
    },
    checkIn: Date,
    checkOut: Date,
    eventDate: Date,
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Pending',
    },
}, { timestamps: true })
// dynamic validation depending on kind
bookingSchema.pre('validate', function(next) {
    if (this.kind === 'Room') {
        if (!this.checkIn || !this.checkOut) {
            return next(new Error('Check-in and check-out are required for room bookings.'))
        }
    } else if (this.kind === 'Event') {
        if (!this.eventDate) {
            return next(new Error('Event date is required for event bookings.'))
        }
    }
    next()
})
bookingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 5, partialFilterExpression: { status: 'pending' } })
export default mongoose.model('Booking', bookingSchema)
