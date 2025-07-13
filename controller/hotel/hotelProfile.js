import HotelProfile from "../../model/hotel/hotelOwnerProfile.js";
import mongoose from "mongoose";

export const addHotelOwnerProfile = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newHotelProfile = new HotelProfile({
            ...req.body,
            createdBy: req.user.id
        });

        await newHotelProfile.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(newHotelProfile);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: error.message });
    }
};

export const updateHotelOwnerProfile = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const hotelProfile = await HotelProfile.findById(id).session(session);

        if (!hotelProfile) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "HotelProfile not found" });
        }

        if (hotelProfile.createdBy.toString() !== req.user.id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "You do not have permission to edit this hotelProfile" });
        }

        if (updateData.rating) hotelProfile.rating = updateData.rating;
        if (updateData.address) hotelProfile.address = updateData.address;
        if (updateData.zipcode) hotelProfile.zipcode = updateData.zipcode;
        if (updateData.city) hotelProfile.city = updateData.city;
        if (updateData.companyImage) hotelProfile.companyImage = updateData.companyImage;
        if (updateData.description) hotelProfile.description = updateData.description;

        if (updateData.facilities) {
            hotelProfile.facilities = {
                ...hotelProfile.facilities.toObject(),
                ...updateData.facilities
            };
        }

        if (updateData.houseRules) {
            hotelProfile.houseRules = {
                ...hotelProfile.houseRules.toObject(),
                ...updateData.houseRules
            };
        }

        await hotelProfile.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Hotel Profile updated successfully", hotelProfile });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: "Server error", error });
    }
};

// export const deleteHotelOwnerProfile = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const hotelProfile = await HotelProfile.findById(id);
//     if (!hotelProfile) {
//       return res.status(404).json({ message: "HotelProfile not found" });
//     }
//     if (hotelProfile.createdBy.toString() !== req.user.id.toString()) {
//       return res.status(403).json({ message: "You do not have permission to delete this hotelProfile" });
//     }
//     await hotelProfile.remove();
//     res.status(200).json({ message: "HotelProfile deleted successfully", hotelProfile });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// export const getAllHotels = async (req, res) => {
//   try {
//     const hotels = await Hotel.find({ createdBy: req.user.id });
//     res.status(200).json({
//       status: "success",
//       results: hotels.length,
//       data: { hotels }
//     });
//   } catch (err) {
//     res.status(400).json({ status: "fail", message: err.message });
//   }
// };

export const getHotelOwnerDetailsById = async (req, res) => {
    try {
        const hotelProfile = await HotelProfile.findOne({ createdBy: req.params.id });
        if (!hotelProfile) {
            return res.status(404).json({
                status: "fail",
                message: "No hotel owner found with that ID"
            });
        }
        res.status(200).json({
            status: "success",
            data: { hotelProfile }
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message
        });
    }
};
