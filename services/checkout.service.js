import Cart from '../model/cart/cart.model.js';
import * as bookingService from './booking.service.js';
import * as paymentService from './payment.service.js';

// Validate cart and create bookings
export const validateCartAndCreateBookings = async (cartId, user) => {
    const cart = await Cart.findById(cartId);

    if (!cart) throw new Error('Cart not found');
    if (cart.items.length === 0) throw new Error('Cart is empty');

    const bookings = [];

    // Process each item in cart
    for (const item of cart.items) {
        const bookingData = {
            item: item.item,
            kind: item.kind,
            userId: user._id,
            adults: item.adults,
            children: item.children,
            currency: item.currency,
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            eventDate: item.eventDate,
            discountPercent: item.discountPercent,
            appliedDiscount: item.appliedDiscount,
            baseCost: item.baseCost,
            finalCost: item.finalCost
        };
        // Create booking using existing service
        const booking = await bookingService.createBookingService(bookingData);
        bookings.push(booking);
    }

    return { cart, bookings };
};

// Complete checkout after payment
export const completeCheckout = async (cartId, tx_ref) => {
    // Verify payment
};
