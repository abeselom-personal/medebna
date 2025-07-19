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
    startTime: Date,
    endTime: Date,
    price: Number,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    }
}, { timestamps: true })

export default mongoose.model('Event', eventSchema)
