import * as stripeService from "../../services/paymentService.js";

const createStripePaymentIntent = async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await stripeService.createPaymentIntent(amount);
        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    createStripePaymentIntent,
};
