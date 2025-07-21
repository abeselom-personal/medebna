import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'kind' },
    kind: { type: String, required: true, enum: ['Room', 'Event'] },
    createdAt: { type: Date, default: Date.now }
})
export default mongoose.model('Favorite', favoriteSchema)

