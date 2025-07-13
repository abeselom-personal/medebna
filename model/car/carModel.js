import * as mongoose from "mongoose";

const carDetailsSchema = new mongoose.Schema({
    details: { type: String, required: true },
    rentalInfo: { type: String, required: true },
    additionalInfo: { type: String }
});
const carSpecificity = new mongoose.Schema({
    numberOfCars: { type: Number, required: true },
    color: { type: String, required: true },
    status: { type: String, enum: ['available', 'booked', 'reserved'], required: true },
    image: { type: String, required: true },
});

const carTypeSchema = new mongoose.Schema({

    type: { type: String, required: true },
    price: { type: Number, required: true },
    carSpecificity: [carSpecificity],
    description: { type: String, required: true },


});

const carSchema = new mongoose.Schema({

    cars: [carTypeSchema],
    carDetails: carDetailsSchema,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'System', required: true }
});

const Car = mongoose.model('Car', carSchema);

export default Car;
