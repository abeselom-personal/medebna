import * as mongoose from "mongoose";
const { Schema } = mongoose;

const roomSchema = new Schema({
    roomNumber: { type: String, required: true },
    status: { type: String, enum: ['available', 'booked', 'reserved'], required: true }
});

const roomTypeSchema = new Schema({
    type: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    numberOfGuests: { type: Number, required: true },
    rooms: [roomSchema],
});

const hotelSchema = new Schema({

    roomTypes: [roomTypeSchema],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'System', required: true }, // Add this line
}, { timestamps: true });

export default mongoose.model('Hotel', hotelSchema);
