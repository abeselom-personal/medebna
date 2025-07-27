import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema({
    totalCapacity: { type: Number, required: true },
    available: { type: Number, required: true },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    holders: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'holders.kind'
        },
        kind: {
            type: String,
            enum: ['User', 'Guest'],
            required: true
        },
        quantity: { type: Number, default: 1 },
        purchasedAt: { type: Date, default: Date.now }

    }],
    discounts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DiscountRule'
    }],
}, { timestamps: true })

export default mongoose.model('Ticket', ticketSchema)

