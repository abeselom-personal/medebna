import * as mongoose from "mongoose";


const rentalRuleSchema = new mongoose.Schema({
    rentalDuration: { type: String, required: true },
    cancellationPolicy: { type: String, required: true },
    prepayment: { type: Boolean, required: true },
    noAgeRestriction: { type: Boolean, default: false },
    additionalInfo: { type: String },
    acceptedPaymentMethods: { type: String, required: true }
});
const profileSchema = new mongoose.Schema({
    address: { type: String, required: true },
    rating: { type: Number, required: true },
    zipCode: { type: String, required: true },
    city: { type: String, required: true },
    companyImage: { type: String, required: true },
    description: { type: String, required: true },
    rentalRules: rentalRuleSchema,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'System', required: true },

});

const Profile = mongoose.model('CarOwnerProfile', profileSchema);

export default Profile;
