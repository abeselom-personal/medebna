import Event from "../../model/event/eventModel.js";
import mongoose from "mongoose";

export const addEvent = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newEvent = new Event({
            ...req.body,
            createdBy: req.user.id
        });
        await newEvent.save({ session });

        await session.commitTransaction();
        session.endSession();
        res.status(201).json(newEvent);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: error.message });
    }
};

export const deleteEvent = async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findById(id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.createdBy.toString() !== req.user.id.toString())
            return res.status(403).json({ message: 'You do not have permission to delete this event' });

        await event.remove();
        res.status(200).json({ message: 'Event deleted successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateEvent = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const event = await Event.findById(id).session(session);
        if (!event) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.createdBy.toString() !== req.user.id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: 'You do not have permission to edit this event' });
        }

        if (updates.events) {
            event.events = { ...event.events.toObject(), ...updates.events };
        }

        if (updates.eventPrices) {
            const existingEvents = event.eventPrices.map(e => e._id.toString());
            updates.eventPrices.forEach(updatePrice => {
                if (existingEvents.includes(updatePrice._id)) {
                    const existingEvent = event.eventPrices.find(r => r._id.toString() === updatePrice._id);
                    existingEvent.type = updatePrice.type || existingEvent.type;
                    existingEvent.ticketAvailable = updatePrice.ticketAvailable || existingEvent.ticketAvailable;
                    existingEvent.price = updatePrice.price || existingEvent.price;
                }
            });
        }

        if (updates.eventDetails) {
            event.eventDetails = { ...event.eventDetails.toObject(), ...updates.eventDetails };
        }

        await event.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: 'Event updated successfully', event });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find({ createdBy: req.user.id });
        res.status(200).json({ status: 'success', results: events.length, data: { events } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

export const getEventDetailsById = async (req, res) => {
    try {
        const event = await Event.find({ createdBy: req.params.id });
        if (!event) {
            return res.status(404).json({ status: 'fail', message: 'No event found with that ID' });
        }
        res.status(200).json({ status: 'success', data: { event } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
