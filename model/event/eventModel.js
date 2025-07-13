import * as mongoose from "mongoose";

const eventTypeSchema = new mongoose.Schema({
    location: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
});

const eventPriceSchema = new mongoose.Schema({
    type: { type: String, required: true },
    ticketAvailable: { type: Number, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['available', 'booked', 'reserved'], required: true }
});




const eventDetailsSchema = new mongoose.Schema({
    details: { type: String, required: true },
    ticketInfo: { type: String, required: true },
    additionalInfo: { type: String },
    foodAndDrink: { type: String, required: true }
});




const eventSchema = new mongoose.Schema({
    events: eventTypeSchema,
    eventPrices: [eventPriceSchema],
    eventDetails: eventDetailsSchema,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'System', required: true },
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
