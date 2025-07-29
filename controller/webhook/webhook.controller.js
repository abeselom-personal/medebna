// controllers/webhook.controller.js
import crypto from 'crypto';
import Payment from '../../model/payment/payment.model.js'
import Booking from '../../model/booking/booking.model.js';

export const handleChapaWebhook = async (req, res) => {
    try {
        // 1. Verify the webhook origin
        const secret = process.env.CHAPA_WEBHOOK_SECRET;
        const signature = req.headers['chapa-signature'] || req.headers['x-chapa-signature'];

        if (!signature) {
            console.warn('No signature header found');
            return res.status(400).send('Invalid signature');
        }

        const hash = crypto.createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== signature) {
            console.warn('Invalid signature received');
            return res.status(400).send('Invalid signature');
        }

        // 2. Process the event
        const event = req.body;

        // Validate we have a payment event
        if (!event.event || !event.tx_ref) {
            return res.status(400).send('Invalid event data');
        }

        // 3. Find the payment record
        const payment = await Payment.findOne({ tx_ref: event.tx_ref });
        if (!payment) {
            console.warn(`Payment not found for tx_ref: ${event.tx_ref}`);
            return res.status(404).send('Payment not found');
        }

        // 4. Determine status based on webhook event
        let paymentStatus;
        let bookingStatus;
        let statusField;

        if (event.event.includes('success')) {
            paymentStatus = 'completed';
            bookingStatus = 'confirmed';
            statusField = 'completedAt';
        } else if (event.event.includes('failed') || event.event.includes('cancelled')) {
            paymentStatus = 'failed';
            bookingStatus = 'cancelled';
            statusField = 'failedAt';
        } else {
            console.warn(`Unhandled event type: ${event.event}`);
            return res.status(200).send('Event not handled');
        }

        // 5. Update payment record
        payment.status = paymentStatus;
        payment.reference = event.reference || payment.reference;
        payment.rawVerification = event;
        payment[statusField] = new Date();
        await payment.save();

        // 6. Update associated bookings if needed
        if (payment.bookings && payment.bookings.length > 0) {
            await Booking.updateMany(
                { _id: { $in: payment.bookings } },
                {
                    $set: {
                        status: bookingStatus,
                        ...(paymentStatus === 'completed' && { payment: payment._id })
                    }
                }
            );
        }

        // 7. Send success response
        res.status(200).send('Webhook processed successfully');

    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send('Internal server error');
    }
};
