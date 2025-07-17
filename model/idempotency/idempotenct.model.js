
import mongoose from 'mongoose'

const schema = new mongoose.Schema({
    key: { type: String, unique: true, required: true },
    tx_ref: String,
    response: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
})

schema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }) // auto-remove after 24h
export default mongoose.model('Idempotency', schema)
