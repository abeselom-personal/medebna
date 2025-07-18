import mongoose, { Schema } from "mongoose"

const UserSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true },
    password: {
        type: String,
        required: true
    },
    phone: { type: String, required: true, trim: true, unique: true },
    role: {
        type: String,
        enum: ["customer", "vendor", "admin"],
        default: "customer"
    },
    sessionId: String,
    productType: String,
    paymentMethod: { type: String, enum: ["chapa", "stripe"] },
    productId: String,
    eventTypeIds: [String],
    roomIds: [String],
    carIds: [String],
    refreshToken: { type: String, select: false },
}, { timestamps: true })

export default mongoose.model("User", UserSchema)
