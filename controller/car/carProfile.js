import Profile from "../../model/car/carCompanyProfile.js";
import mongoose from "mongoose";

export const addCarOwnerProfile = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newCarProfile = new Profile({
            ...req.body,
            createdBy: req.user.id
        });

        await newCarProfile.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(newCarProfile);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: error.message });
    }
};

export const updateCarOwnerData = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const carOwner = await Profile.findById(id).session(session);

        if (!carOwner) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'carOwner not found' });
        }

        if (carOwner.createdBy.toString() !== req.user.id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: 'You do not have permission to edit this profile' });
        }

        if (updates.rating) carOwner.rating = updates.rating;
        if (updates.address) carOwner.address = updates.address;
        if (updates.zipCode) carOwner.zipCode = updates.zipCode;
        if (updates.city) carOwner.city = updates.city;
        if (updates.companyImage) carOwner.companyImage = updates.companyImage;
        if (updates.description) carOwner.description = updates.description;

        if (updates.rentalRules) {
            carOwner.rentalRules = {
                ...carOwner.rentalRules.toObject(),
                ...updates.rentalRules
            };
        }

        await carOwner.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: 'Car owner profile updated successfully',
            carOwner
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// export const deleteCarOwner = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const carOwnerProfile = await Profile.findById(id);
//     if (!carOwnerProfile) {
//       return res.status(404).json({ message: 'carOwnerProfile not found' });
//     }
//     if (carOwnerProfile.createdBy.toString() !== req.user.id.toString()) {
//       return res.status(403).json({ message: 'You do not have permission to delete this carOwnerProfile' });
//     }
//     await carOwnerProfile.remove();
//     res.status(200).json({ message: 'carOwnerProfile deleted successfully', carOwnerProfile });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// export const getAllCarsOwners = async (req, res) => {
//   try {
//     const carsOwnerProfile = await Profile.find({ createdBy: req.user.id });
//     res.status(200).json({
//       status: 'success',
//       results: carsOwnerProfile.length,
//       data: { carsOwnerProfile }
//     });
//   } catch (err) {
//     res.status(400).json({ status: 'fail', message: err.message });
//   }
// };

export const getCarOwnerProfileDetailsById = async (req, res) => {
    try {
        const carOwnerProfile = await Profile.findOne({ createdBy: req.params.id });
        if (!carOwnerProfile) {
            return res.status(404).json({
                status: 'fail',
                message: 'No carOwnerProfile found with that ID'
            });
        }
        res.status(200).json({
            status: 'success',
            data: { carOwnerProfile }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
