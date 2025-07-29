// models/payment.model.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    tx_ref: { type: String, required: true, unique: true },
    reference: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    cancelledAt: { type: Date },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    paidFor: {
        item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'paidFor.kind' },
        kind: { type: String, required: true, enum: ['Room', 'Event'] }
    },
    rawInitialization: { type: Object },
    rawVerification: { type: Object },
    completedAt: { type: Date },
    failedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
