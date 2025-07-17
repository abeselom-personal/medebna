import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
    title: String,
    description: String,
    images: [{
        url: String,
        blurhash: String
    }],
    price: [{
        currency: { type: String, required: true },
        amount: { type: Number, required: true }
    }],
    location: String,
    availability: {
        from: Date,
        to: Date
    },
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
export default mongoose.model('Room', roomSchema)
