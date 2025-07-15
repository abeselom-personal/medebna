import * as System from "../../model/system/systemModel.js";
import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { sendEmail } from "../../utils/email.js";
import { generateOTP } from "../../utils/otp.js";

export async function addOperator(req, res) {
    const { name, phone, email, type } = req.body;

    if (!name || !phone || !email || !type) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingOperator = await System.findOne({ email }).session(session);
        if (existingOperator) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({ message: 'Email already exists' });
        }
        const otp = generateOTP();

        const hashedPassword = bcrypt.hash(otp, 10);

        const newSystem = new System({
            name,
            phone,
            email,
            password: hashedPassword,
            type,
        });

        await newSystem.save({ session });

        try {
            await sendEmail(email, 'OTP for User Login', `Your OTP is: ${otp}`);
        } catch (error) {
            console.error(`Error sending OTP to ${email}: ${error.message}`);
            throw error;
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ message: 'System entity added successfully', operator: newSystem });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Server error', error });
    }
};


export async function updateOperator(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    try {

        const updatedSystem = await System.findByIdAndUpdate(id, updateData, { new: true });


        if (!updatedSystem) {
            return res.status(404).json({ message: 'System entity not found' });
        }

        res.status(200).json({ message: 'System entity updated successfully', system: updatedSystem });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export async function deleteOperator(req, res) {
    const { id } = req.params;

    try {
        const deletedSystem = await System.findByIdAndDelete(id);

        if (!deletedSystem) {
            return res.status(404).json({ message: 'System entity not found' });
        }

        res.status(200).json({ message: 'System entity deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


export async function getOperator(req, res) {
    const { id } = req.params;

    try {
        const operator = await System.findById(id).select('name phone email type');

        if (!operator) {
            return res.status(404).json({ message: 'Operator not found' });
        }

        res.status(200).json({ operator });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export async function getAllOperators(req, res) {
    try {
        const operators = await System.find({ type: { $ne: 'admin' } }).select('name phone email type');
        res.status(200).json({ operators });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
