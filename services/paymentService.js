import * as axios from "axios";

const CHAPA_BASE_URL = 'https://api.chapa.co/v1';

const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const createPayment = async (amount, return_url) => {
    try {
        const txRef = `tx-${Date.now()}-${generateRandomNumber(1000, 9999)}`; // Generate a unique transaction reference
        const response = await axios.post(
            `${CHAPA_BASE_URL}/transaction/initialize`,
            {
                amount,
                currency: 'ETB',
                tx_ref: txRef,
                callback_url: process.env.CALLBACK_URL,
                return_url: return_url

            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_PRIVATE_KEY}`,
                },
            }
        );


        return response.data;
    } catch (error) {
        console.error('Error creating payment:', error.response ? error.response.data : error.message);
        throw new Error('Payment creation failed');
    }
};

const verifyPayment = async (transactionId) => {
    try {
        const response = await axios.get(`${CHAPA_BASE_URL}/transaction/verify/${transactionId}`, {
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_PRIVATE_KEY}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error verifying payment:', error.response ? error.response.data : error.message);
        throw new Error('Payment verification failed');
    }
};

const createPaymentIntent = async (amount) => {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        const paymentIntent = await stripe.paymentIntents.create({
            // amount : amount * 100,
            amount,
            currency: "USD",
        });
        return paymentIntent;
    } catch (error) {
        throw error;
    }
};



export { createPayment, verifyPayment, createPaymentIntent };
