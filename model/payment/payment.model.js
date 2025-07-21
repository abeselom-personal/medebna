import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    tx_ref: { type: String, required: true, unique: true },
    reference: { type: String, required: true },
    status: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    paidFor: {
        item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'paidFor.kind' },
        kind: { type: String, required: true, enum: ['Room', 'Event'] }
    },
    raw: { type: Object },
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Payment', paymentSchema)
