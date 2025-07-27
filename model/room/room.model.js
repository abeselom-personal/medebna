import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, minlength: 10 },
    images: [{
        url: { type: String, required: true },
        blurhash: { type: String, required: true }
    }],
    price: {
        type: [{
            currency: { type: String, required: true },
            amount: { type: Number, required: true, min: 0 }
        }],
        validate: v => Array.isArray(v) && v.length > 0
    },
    location: { type: String, trim: true },
    availability: {
        from: { type: Date, required: true },
        to: {
            type: Date,
            required: true,
            validate: {
                validator: function(value) {
                    return !this.from || value > this.from
                },
                message: 'to date must be after from date'
            }
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    }
}, { timestamps: true })

roomSchema.pre('save', async function(next) {
    const Business = mongoose.model('Business')
    const exists = await Business.exists({ _id: this.businessId })
    if (!exists) return next(new Error('Invalid businessId'))
    next()
})

export default mongoose.model('Room', roomSchema)
