import Hotel from "../../model/hotel/hotelModel.js";
import mongoose from "mongoose";

export const addHotel = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newHotel = new Hotel({
            ...req.body,
            createdBy: req.user.id
        });
        await newHotel.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(newHotel);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: error.message });
    }
};

export const updateHotel = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const hotel = await Hotel.findById(id).session(session);
        if (!hotel) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Hotel not found' });
        }

        if (hotel.createdBy.toString() !== req.user.id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: 'You do not have permission to edit this hotel' });
        }

        updateData.roomTypes?.forEach((updatedRoomType) => {
            const existingRoomType = hotel.roomTypes.find(rt => rt._id.toString() === updatedRoomType._id);
            if (existingRoomType) {
                Object.assign(existingRoomType, {
                    price: updatedRoomType.price || existingRoomType.price,
                    type: updatedRoomType.type || existingRoomType.type,
                    image: updatedRoomType.image || existingRoomType.image,
                    description: updatedRoomType.description || existingRoomType.description,
                    numberOfGuests: updatedRoomType.numberOfGuests || existingRoomType.numberOfGuests
                });

                const existingRoomIds = existingRoomType.rooms.map(r => r._id.toString());
                updatedRoomType.rooms?.forEach((updatedRoom) => {
                    if (existingRoomIds.includes(updatedRoom._id)) {
                        const existingRoom = existingRoomType.rooms.find(r => r._id.toString() === updatedRoom._id);
                        Object.assign(existingRoom, {
                            roomNumber: updatedRoom.roomNumber || existingRoom.roomNumber,
                            status: updatedRoom.status || existingRoom.status
                        });
                    }
                });
            }
        });

        await hotel.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: 'Hotel updated successfully', hotel });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteHotel = async (req, res) => {
    const { id } = req.params;

    try {
        const hotel = await Hotel.findById(id);
        if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
        if (hotel.createdBy.toString() !== req.user.id.toString())
            return res.status(403).json({ message: 'You do not have permission to delete this hotel' });

        await hotel.remove();
        res.status(200).json({ message: 'Hotel deleted successfully', hotel });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find();
        res.status(200).json({ status: 'success', results: hotels.length, data: { hotels } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

export const getHotelDetailsById = async (req, res) => {
    try {
        const hotel = await Hotel.find({ createdBy: req.params.id });
        if (!hotel) {
            return res.status(404).json({ status: 'fail', message: 'No hotel found with that ID' });
        }
        res.status(200).json({ status: 'success', data: { hotel } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
