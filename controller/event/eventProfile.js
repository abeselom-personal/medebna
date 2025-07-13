import EventProfile from "../../model/event/eventOwnerProfile.js";
import mongoose from "mongoose";

export const addEventProfile = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newEventProfile = new EventProfile({
            ...req.body,
            createdBy: req.user.id
        });

        await newEventProfile.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(newEventProfile);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: error.message });
    }
};

// export const deleteEventProfile = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const eventProfile = await EventProfile.findById(id);
//     if (!eventProfile) {
//       return res.status(404).json({ message: 'EventProfile not found' });
//     }
//     if (eventProfile.createdBy.toString() !== req.user.id.toString()) {
//       return res.status(403).json({ message: 'You do not have permission to delete this eventProfile' });
//     }
//     await eventProfile.remove();
//     res.status(200).json({ message: 'EventProfile deleted successfully', eventProfile });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

export const updateEventProfile = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const eventProfile = await EventProfile.findById(id).session(session);

        if (!eventProfile) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'EventProfile not found' });
        }

        if (eventProfile.createdBy.toString() !== req.user.id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: 'You do not have permission to edit this eventProfile' });
        }

        if (updates.rating) eventProfile.rating = updates.rating;
        if (updates.address) eventProfile.address = updates.address;
        if (updates.zipcode) eventProfile.zipcode = updates.zipcode;
        if (updates.city) eventProfile.city = updates.city;
        if (updates.companyImage) eventProfile.companyImage = updates.companyImage;
        if (updates.description) eventProfile.description = updates.description;

        if (updates.eventRules) {
            eventProfile.eventRules = {
                ...eventProfile.eventRules.toObject(),
                ...updates.eventRules
            };
        }

        await eventProfile.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Event Profile updated successfully', eventProfile });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// export const getAllEvents = async (req, res) => {
//   try {
//     const events = await Event.find({ createdBy: req.user.id });
//     res.status(200).json({
//       status: 'success',
//       results: events.length,
//       data: { events }
//     });
//   } catch (err) {
//     res.status(400).json({ status: 'fail', message: err.message });
//   }
// };

export const getEventOwnerDetailsById = async (req, res) => {
    try {
        const eventProfile = await EventProfile.findOne({ createdBy: req.params.id });
        if (!eventProfile) {
            return res.status(404).json({
                status: 'fail',
                message: 'No eventProfile found with that ID'
            });
        }
        res.status(200).json({
            status: 'success',
            data: { eventProfile }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
