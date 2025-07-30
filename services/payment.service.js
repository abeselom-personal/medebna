// services/payment.service.js
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import mongoose from 'mongoose';
import config from '../config/config.js';
import Payment from '../model/payment/payment.model.js';
import Booking from '../model/booking/booking.model.js';
import Business from '../model/business/business.model.js';

export const initPayment = async ({
    email,
    first_name,
    last_name,
    phone_number,
    metadata = {}
}) => {
    // Validate required fields
    if (!email || !first_name || !last_name || !phone_number) {
        throw new Error('Missing required customer fields');
    }

    // Get booking IDs from metadata
    const bookingIds = Array.isArray(metadata.bookingId)
        ? metadata.bookingId
        : [metadata.bookingId].filter(Boolean);

    if (bookingIds.length === 0) {
        throw new Error('At least one booking ID is required');
    }

    // Fetch bookings and calculate total
    const bookings = await Booking.find({ _id: { $in: bookingIds } });
    if (bookings.length !== bookingIds.length) {
        throw new Error('Some bookings not found');
    }

    // Validate all bookings are for the same type (Room/Event)
    const kinds = [...new Set(bookings.map(b => b.kind))];
    if (kinds.length > 1) {
        throw new Error('All bookings must be of the same type (Room or Event)');
    }
    const bookingKind = kinds[0];

    // Validate currency consistency
    const currencies = [...new Set(bookings.map(b => b.unitPrice.currency))];
    if (currencies.length > 1) {
        throw new Error('All bookings must use the same currency');
    }

    const amount = bookings.reduce((sum, b) => sum + b.finalCost, 0);
    const currency = currencies[0];

    // Get business from first booking
    const firstBooking = bookings[0];
    const item = await mongoose.model(bookingKind).findById(firstBooking.item)
        .populate('businessId');

    if (!item?.businessId) {
        throw new Error('Could not determine business for payment');
    }

    const business = item.businessId;
    const tx_ref = `medebna-${uuid()}`;
    const reference = `pay-${Date.now()}`;

    // Create Chapa payload
    const payload = {
        amount,
        currency,
        email,
        first_name,
        last_name,
        phone_number,
        tx_ref,
        return_url: `${config.returnUrl}/${bookingIds[0]}`,
        callback_url: `${config.callbackUrl}/${tx_ref}`,
        meta: {
            bookingIds,
            paymentType: metadata.paymentType || 'room_booking',
            businessId: business._id
        },
        customization: {
            title: 'Medebna Booking',
            description: `Payment for ${bookingKind.toLowerCase()} booking`
        }
    };

    // Add subaccount if configured
    if (business.paymentSettings?.subAccount?.id) {
        payload.subaccounts = [{ id: business.paymentSettings.subAccount.id }];
    }

    // Initialize payment with Chapa
    let chapaResponse;
    try {
        chapaResponse = await axios.post(
            'https://api.chapa.co/v1/transaction/initialize',
            payload,
            { headers: { Authorization: `Bearer ${config.chapa.secretKey}` } }
        );
    } catch (error) {
        console.log(error)
        throw new Error(`Payment initialization failed: ${error.response?.data?.message || error.message}`);
    }

    // Create payment record that matches your schema
    const payment = await Payment.create({
        tx_ref,
        reference: 'pending', // Will be updated by webhook
        status: 'pending',
        amount,
        currency,
        email,
        phone_number,
        business: business._id,
        bookings: bookingIds, // Store array of booking IDs
        paidFor: {
            item: firstBooking.item,
            kind: bookingKind
        },
        rawInitialization: chapaResponse.data
    });

    // Update bookings with payment reference
    await Booking.updateMany(
        { _id: { $in: bookingIds } },
        { $set: { paymentTxRef: tx_ref, status: 'payment_pending' } }
    );

    return {
        checkoutUrl: chapaResponse.data.data.checkout_url,
        tx_ref,
        paymentId: payment._id
    };
};

export const verifyPayment = async (tx_ref) => {
    // Verify with Chapa
    let verification;
    try {
        verification = await axios.get(
            `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
            { headers: { Authorization: `Bearer ${config.chapa.secretKey}` } }
        );
    } catch (error) {
        throw new Error(`Payment verification failed: ${error.response?.data?.message || error.message}`);
    }

    const paymentData = verification.data.data;
    if (!paymentData || paymentData.status !== 'success') {
        throw new Error('Payment not successful');
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
        { tx_ref },
        {
            status: 'completed',
            reference: paymentData.reference || `chapa-${paymentData.tx_ref}`,
            raw: paymentData,
            completedAt: new Date()
        },
        { new: true }
    );

    // Update bookings
    if (payment?.paidFor?.item) {
        await Booking.updateMany(
            { paymentTxRef: tx_ref },
            { $set: { status: 'confirmed', payment: payment._id } }
        );
    }

    return {
        success: true,
        paymentId: payment._id,
        amount: payment.amount,
        currency: payment.currency
    };
};

// Helper to get payment status
export const getPaymentStatus = async (tx_ref) => {
    return Payment.findOne({ tx_ref }).lean();
};

const safeParseJSON = (str) => {
    try {
        return JSON.parse(str)
    } catch {
        return {}
    }
}

export const createSubaccount = async ({
    business_name,
    account_name,
    bank_code,
    account_number,
    split_value = 0.2,
    split_type = 'percentage',
}) => {
    const existing = await Business.findOne({
        'paymentSettings.subAccount.account_number': account_number,
        'paymentSettings.subAccount.bank_code': bank_code
    })

    if (existing?.paymentSettings?.subAccount?.id) {
        return existing.paymentSettings.subAccount.id
    }

    const payload = {
        business_name,
        account_name,
        bank_code,
        account_number,
        split_value,
        split_type
    }

    const headers = {
        Authorization: `Bearer ${config.chapa.secretKey}`,
        'Content-Type': 'application/json'
    }

    try {
        const res = await axios.post('https://api.chapa.co/v1/subaccount', payload, { headers })
        return res.data.data.subaccount_id
    } catch (err) {
        if (err.response?.data?.message?.includes('This subaccount does exist')) {
            const found = await Business.findOne({
                'paymentSettings.subAccount.account_number': account_number,
                'paymentSettings.subAccount.bank_code': bank_code
            })
            if (found?.paymentSettings?.subAccount?.id) {
                return found.paymentSettings.subAccount.id
            }
            return null
        }
        throw new Error(err.response?.data?.message || 'Failed to create subaccount')
    }
}

export const deleteSubaccount = async (id) => {
    const headers = {
        Authorization: `Bearer ${config.chapa.secretKey}`,
        'Content-Type': 'application/json'
    };
    try {
        await axios.delete(`https://api.chapa.co/v1/subaccount/${id}`, { headers });
    }
    catch (error) {
        return null
    }
};
