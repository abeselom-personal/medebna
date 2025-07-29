import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, minlength: 10 },
    images: [{
        url: { type: String, required: true },
        blurhash: { type: String, required: true }
    }],
    numberOfAdults: { type: Number, required: true, min: 1 },
    numberOfChildren: { type: Number, required: true, min: 0 },
    floorLevel: {
        type: [Number], // e.g. [1] or [1,2] for rooms spanning multiple floors
        validate: v => Array.isArray(v) && v.length > 0
    },
    price: {
        type: [{
            currency: { type: String, required: true },
            amount: { type: Number, required: true, min: 0 }
        }],
        validate: v => Array.isArray(v) && v.length > 0
    },
    maxCapacity: { type: Number, required: true, min: 1 },
    currentCapacity: { type: Number, default: 0, min: 0 },
    location: { type: String, trim: true },
    availability: {
        from: { type: Date, required: true },
        to: {
            type: Date,
            required: false,
            validate: {
                validator: function(value) {
                    if (!value) return true
                    return value > this.from
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
roomSchema.pre('save', function(next) {
    if (this.currentCapacity > this.maxCapacity) {
        next(new Error('Current capacity cannot exceed maximum capacity'))
    } else {
        next()
    }
})

roomSchema.statics.checkAvailabilityAndIncrement = async function(roomId) {
    const room = await this.findOne({ _id: roomId })

    if (!room) throw new Error('Room not found')

    const now = new Date()
    if (room.availability.from > now || room.availability.to < now)
        throw new Error('Room is not available')

    if (room.currentCapacity >= room.maxCapacity)
        throw new Error('Room is full')

    room.currentCapacity += 1
    await room.save()

    return room
}

roomSchema.virtual('discounts', {
    ref: 'DiscountRule',
    localField: '_id',
    foreignField: 'target',
    justOne: false,
    options: {
        match: {
            targetType: 'Room',
            enabled: true,
            validFrom: { $lte: new Date() },
            validTo: { $gte: new Date() }
        }
    }
})

roomSchema.set('toObject', { virtuals: true })
roomSchema.set('toJSON', { virtuals: true })
export default mongoose.model('Room', roomSchema)
