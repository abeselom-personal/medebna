import mongoose, { Schema, Types } from "mongoose"

const cartItemSchema = new Schema({
    productId: { type: Types.ObjectId, required: true },
    productType: { type: String, enum: ['hotel', 'car', 'event'], required: true },
    status: { type: String, enum: ['reserved'], default: 'reserved' },
    roomId: { type: Types.ObjectId, ref: "Room" },
    eventTypeId: { type: String, trim: true },
    numberOfTickets: {
        type: Number,
        min: 1,
    },
    carTypeId: { type: Types.ObjectId, ref: "CarType" },
    carSpecificityId: { type: Types.ObjectId, ref: "CarSpec" },
    expiresAt: { type: Date, required: true },
})

cartItemSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const cartSchema = new Schema({
    sessionId: { type: String, required: true, trim: true },
    items: [cartItemSchema],
}, { timestamps: true })

export default mongoose.model('Cart', cartSchema)



