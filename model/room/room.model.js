import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
    title: String,
    description: String,
    images: [String],
    price: Number,
    location: String,
    availability: {
        from: Date,
        to: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

export default mongoose.model('Room', roomSchema)
