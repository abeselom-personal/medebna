import * as mongoose from "mongoose";

const eventRuleSchema = new mongoose.Schema({
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    cancellationPolicy: { type: String, required: true },
    prepayment: { type: Boolean, required: true },
    noAgeRestriction: { type: Boolean, default: false },
    pets: { type: Boolean, default: false },
    additionalInfo: { type: String },
    acceptedPaymentMethods: { type: String, required: true }
});

const eventprofileSchema = new mongoose.Schema({
    address: { type: String, required: true },
    rating: { type: Number, required: true },
    zipCode: { type: String, required: true },
    city: { type: String, required: true },
    companyImage: { type: String, required: true },
    description: { type: String, required: true },
    eventRules: eventRuleSchema,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'System', required: true },
}, {
    timestamps: true


});

const EventProfile = mongoose.model('EventOwnerProfile', eventprofileSchema);

export default EventProfile;
