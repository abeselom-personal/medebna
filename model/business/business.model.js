// model/business/business.model.js
import mongoose from 'mongoose'

const StepFlags = {
    basic: { type: Boolean, default: false },
    contacts: { type: Boolean, default: false },
    amenities: { type: Boolean, default: false },
    photos: { type: Boolean, default: false },
    rooms: { type: Boolean, default: false },
    legal: { type: Boolean, default: false },
    paymentSettings: { type: Boolean, default: false },
}

const BusinessSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    address: {
        line: String,
        city: String,
        country: String,
        lat: Number,
        lng: Number
    },
    type: { type: String, enum: ['hotel', 'venue'], default: 'hotel', required: true },
    contact: {
        phone: String,
        emails: [String]
    },
    amenities: [String],
    photos: [String],
    legal: {
        licenseNumber: String,
        taxInfo: String,
        additionalDocs: [String]
    },
    paymentSettings: {
        currencies: [{ type: String }],
        details: mongoose.Schema.Types.Mixed
    },
    stepsCompleted: { type: StepFlags, default: () => ({}) },
    published: { type: Boolean, default: false },
}, { timestamps: true })

BusinessSchema.methods.completeStep = function(step) {
    if (this.stepsCompleted.hasOwnProperty(step)) {
        this.stepsCompleted[step] = true
        return this.save()
    }
}
export default mongoose.model('Business', BusinessSchema)
