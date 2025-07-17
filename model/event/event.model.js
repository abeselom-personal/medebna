import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
    name: String,
    description: String,
    images: [{
        url: String,
        blurhash: String
    }],
    location: String,
    date: Date,
    price: Number,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

export default mongoose.model('Event', eventSchema)
