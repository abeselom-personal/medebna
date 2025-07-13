import Car from "../../model/car/carModel.js";
import mongoose from "mongoose";

export const addCar = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newCar = new Car({
            ...req.body,
            createdBy: req.user.id
        });
        await newCar.save({ session });

        await session.commitTransaction();
        session.endSession();
        res.status(201).json(newCar);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: error.message });
    }
};

export const updateCarData = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const car = await Car.findById(id).session(session);
        if (!car) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Car not found' });
        }

        if (car.createdBy.toString() !== req.user.id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: 'You do not have permission to edit this car' });
        }

        if (updates.cars) {
            const existingCars = car.cars.map(carType => carType._id.toString());
            updates.cars.forEach(carType => {
                if (existingCars.includes(carType._id)) {
                    const existingCar = car.cars.find(r => r._id.toString() === carType._id);
                    if (existingCar) {
                        existingCar.type = carType.type || existingCar.type;
                        existingCar.price = carType.price || existingCar.price;
                        existingCar.description = carType.description || existingCar.description;

                        if (carType.carSpecificity) {
                            existingCar.carSpecificity.numberOfCars = carType.carSpecificity.numberOfCars || existingCar.carSpecificity.numberOfCars;
                            existingCar.carSpecificity.color = carType.carSpecificity.color || existingCar.carSpecificity.color;
                            existingCar.carSpecificity.image = carType.carSpecificity.image || existingCar.carSpecificity.image;
                            existingCar.carSpecificity.status = carType.carSpecificity.status || existingCar.carSpecificity.status;
                        }
                    }
                }
            });
        }

        if (updates.carDetails) {
            car.carDetails = { ...car.carDetails.toObject(), ...updates.carDetails };
        }

        await car.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: 'Car updated successfully', car });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const deleteCar = async (req, res) => {
    const { id } = req.params;

    try {
        const car = await Car.findById(id);
        if (!car) return res.status(404).json({ message: 'Car not found' });
        if (car.createdBy.toString() !== req.user.id.toString())
            return res.status(403).json({ message: 'You do not have permission to delete this car' });

        await car.remove();
        res.status(200).json({ message: 'Car deleted successfully', car });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getAllCars = async (req, res) => {
    try {
        const cars = await Car.find({ createdBy: req.user.id });
        res.status(200).json({ status: 'success', results: cars.length, data: { cars } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};

export const getCarDetailsById = async (req, res) => {
    try {
        const car = await Car.find({ createdBy: req.params.id });
        if (!car) {
            return res.status(404).json({ status: 'fail', message: 'No car found with that ID' });
        }
        res.status(200).json({ status: 'success', data: { car } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
