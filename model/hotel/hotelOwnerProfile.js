import * as mongoose from "mongoose";
const { Schema } = mongoose;

const facilitiesSchema = new Schema({
    popularFacilities: [String],
    roomAmenities: [String],
    outdoorFacilities: [String],
    kitchenFacilities: [String],
    mediaTech: [String],
    foodDrink: [String],
    transportFacilities: [String],
    receptionServices: [String],
    cleaningServices: [String],
    businessFacilities: [String],
    safetyFacilities: [String],
    generalFacilities: [String],
    accessibility: [String],
    wellnessFacilities: [String],
    languages: [String],
});
const houseRulesSchema = new Schema({
    checkIn: {
        time: { type: String, required: true },
        description: { type: String, required: true },
    },
    checkOut: {
        time: { type: String, required: true },
        description: { type: String, required: true },
    },
    cancellationPrepayment: { type: String, required: true },
    childrenAndBeds: { type: String, required: true },
    cribsAndExtraBedPolicies: { type: String, required: true },
    noAgeRestriction: { type: String, required: true },
    pets: { type: String, required: true },
    acceptedPaymentMethods: { type: String, required: true },
});
const hotelProfileSchema = new mongoose.Schema({
    address: { type: String, required: true },
    zipCode: { type: String, required: true },
    city: { type: String, required: true },
    companyImage: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, required: true },
    facilities: facilitiesSchema,
    houseRules: houseRulesSchema,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'System', required: true }, // Add this line
}, {
    timestamps: true

});

const HotelProfile = mongoose.model('HotelOwnerProfile', hotelProfileSchema);

export default HotelProfile;
