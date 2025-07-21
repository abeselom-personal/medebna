// guest/guest.model.js
import mongoose from 'mongoose'

const guestSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: false },
    dob: { type: Date, required: false }
}, { timestamps: true })

export default mongoose.model('Guest', guestSchema)
