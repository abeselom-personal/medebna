import mongoose from "mongoose";
import Account from "../../model/account/accountModel.js";
import request from "request";

export const addAccount = async (req, res) => {
    const { userId, accountName, accountNumber, bankCode, business_name } = req.body;

    if (!userId || !accountName || !accountNumber || !bankCode || !business_name) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const chapaOptions = {
            method: 'POST',
            url: 'https://api.chapa.co/v1/subaccount',
            headers: {
                'Authorization': `Bearer ${process.env.CHAPA_PRIVATE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                business_name,
                account_name: accountName,
                bank_code: bankCode,
                account_number: accountNumber,
                split_value: 1,
                split_type: 'percentage'
            })
        };

        const chapaResponse = await new Promise((resolve, reject) => {
            request(chapaOptions, (error, response, body) => {
                if (error) return reject(error);
                resolve(JSON.parse(body));
            });
        });

        if (chapaResponse.status !== 'success') {
            throw new Error('Failed to create Chapa subaccount');
        }

        const newAccount = new Account({
            userId,
            accountName,
            accountNumber,
            bankCode,
            chapaSubaccountId: chapaResponse.data.subaccount_id
        });

        await newAccount.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ message: 'System Account added successfully', account: newAccount });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const fetchBankList = async (req, res) => {
    try {
        const options = {
            method: 'GET',
            url: 'https://api.chapa.co/v1/banks',
            headers: {
                'Authorization': `Bearer ${process.env.CHAPA_PRIVATE_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await new Promise((resolve, reject) => {
            request(options, (error, _, body) => {
                if (error) return reject(error);
                resolve(JSON.parse(body));
            });
        });

        if (response.status === 'failed') {
            throw new Error('Failed to fetch bank list');
        }

        res.status(200).json({ banks: response.data });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getAccountDetailsById = async (req, res) => {
    try {
        const account = await Account.find({ userId: req.params.id });
        if (!account || account.length === 0) {
            return res.status(404).json({ status: 'fail', message: 'No account found with that ID' });
        }
        res.status(200).json({ status: 'success', data: { account } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
};
