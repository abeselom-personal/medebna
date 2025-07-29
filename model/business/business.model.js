// model/business/business.model.js
import mongoose from 'mongoose'

const StepFlags = {
    basic: { type: Boolean, default: false },
    contacts: { type: Boolean, default: false },
    amenities: { type: Boolean, default: false },
    images: { type: Boolean, default: false },
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
    rating: { type: Number, min: 1, max: 5 },
    contact: {
        phone: String,
        emails: [String]
    },
    amenities: [String],
    images: [{
        url: String,
        blurhash: String
    }],

    logo: {
        url: String,
        blurhash: String
    },
    legal: {
        licenseNumber: String,
        taxInfo: String,
        additionalDocs: [String]
    },
    paymentSettings: {
        currencies: [{ type: String }],
        details: mongoose.Schema.Types.Mixed,
        subAccount: {
            id: String, // chapa subaccount id
            account_name: String,
            business_name: String,
            bank_code: Number,
            account_number: String,
            split_type: { type: String, enum: ['flat', 'percentage'] },
            split_value: Number
        }
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
