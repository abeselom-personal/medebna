import { connections } from 'mongoose';
import * as checkoutService from '../../services/checkout.service.js';
import * as paymentService from '../../services/payment.service.js';
import * as userService from '../../services/user.service.js';
import bookingModel from '../../model/booking/booking.model.js';

export const initCheckout = async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const userId = req.user.id;

        const user = await userService.findUserById(userId);
        console.log(user)
        // Validate cart and create bookings
        const { cart, bookings } = await checkoutService.validateCartAndCreateBookings(cartId, user);
        const flatBookings = bookings.flat();
        // Prepare payment initialization
        const paymentData = {
            email: user.email,
            first_name: user.firstName || '',
            last_name: user.lastName || '',
            phone_number: user.phone || '',
            metadata: {
                bookingId: flatBookings.map(b => b._id),
                paymentType: 'cart_checkout'
            }
        };

        // Initialize payment
        const paymentResult = await paymentService.initPayment(paymentData);

        res.status(200).json({
            message: 'Checkout initialized',
            paymentInfo: paymentResult,
            bookings
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const completeCheckout = async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const { tx_ref } = req.body;

        // Verify payment and update bookings
        const paymentResult = await checkoutService.completeCheckout(cartId, tx_ref);

        res.status(200).json({
            message: 'Checkout completed successfully',
            payment: paymentResult
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
