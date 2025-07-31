import Cart from '../model/cart/cart.model.js';
import mongoose from 'mongoose';
import Room from '../model/room/room.model.js';
import Event from '../model/event/event.model.js';

// Helper function to calculate item cost
const calculateItemCost = (item, price) => {
    if (item.kind === 'Room') {
        const nights = Math.ceil(
            (new Date(item.checkOut) - new Date(item.checkIn)) / (1000 * 60 * 60 * 24)
        );
        return {
            baseCost: price.base * nights,
            finalCost: price.final * nights
        };
    } else {
        return {
            baseCost: price.base,
            finalCost: price.final
        };
    }
};

// Get or create cart for user
export const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = new Cart({
            user: userId,
            currency: 'ETB', // Default currency
            items: []
        });
        await cart.save();
    }

    return cart;
};

// Get cart by ID
export const getCartById = async (cartId) => {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');
    return cart;
};

// Add item to cart
export const addToCart = async (cartId, itemData) => {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');

    // Validate item data
    if (itemData.kind === 'Room' && (!itemData.checkIn || !itemData.checkOut)) {
        throw new Error('Check-in and check-out dates are required for rooms');
    }

    // Get item details
    let Model;
    if (itemData.kind === 'Room') Model = Room;
    else if (itemData.kind === 'Event') Model = Event;
    else throw new Error('Invalid item kind');

    const item = await Model.findById(itemData.item);
    if (!item) throw new Error('Item not found');

    // Find price in requested currency
    const priceObj = item.price.find(p => p.currency === cart.currency);
    if (!priceObj) {
        throw new Error(`Price not available in ${cart.currency}`);
    }

    // Create cart item
    const cartItem = {
        cartItemId: new mongoose.Types.ObjectId().toString(),
        ...itemData,
        unitPrice: {
            currency: cart.currency,
            base: priceObj.amount,
            final: priceObj.amount, // Initially no discount
            ruleId: null,
            discountLocked: false
        },
        discountPercent: 0,
        appliedDiscount: null
    };

    // Calculate costs
    const costs = calculateItemCost(cartItem, cartItem.unitPrice);
    cartItem.baseCost = costs.baseCost;
    cartItem.finalCost = costs.finalCost;

    // Add to cart
    cart.items.push(cartItem);

    // Recalculate totals
    cart.totalBaseCost += cartItem.baseCost;
    cart.totalFinalCost += cartItem.finalCost;

    await cart.save();
    return cart;
};

// Update cart item
export const updateCartItem = async (cartId, itemId, updates) => {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');

    const itemIndex = cart.items.findIndex(i => i.cartItemId === itemId);
    if (itemIndex === -1) throw new Error('Item not found in cart');

    const item = cart.items[itemIndex];

    // Apply updates
    Object.keys(updates).forEach(key => {
        if (['adults', 'children', 'checkIn', 'checkOut', 'eventDate'].includes(key)) {
            item[key] = updates[key];
        }
    });

    // Recalculate if needed
    if (updates.checkIn || updates.checkOut || updates.eventDate ||
        updates.adults || updates.children) {
        const costs = calculateItemCost(item, item.unitPrice);
        cart.totalBaseCost = cart.totalBaseCost - item.baseCost + costs.baseCost;
        cart.totalFinalCost = cart.totalFinalCost - item.finalCost + costs.finalCost;
        item.baseCost = costs.baseCost;
        item.finalCost = costs.finalCost;
    }

    cart.items[itemIndex] = item;
    await cart.save();
    return cart;
};

// Remove cart item
export const removeCartItem = async (cartId, itemId) => {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');

    const itemIndex = cart.items.findIndex(i => i.cartItemId === itemId);
    if (itemIndex === -1) throw new Error('Item not found in cart');

    const removedItem = cart.items.splice(itemIndex, 1)[0];

    // Recalculate totals
    cart.totalBaseCost -= removedItem.baseCost;
    cart.totalFinalCost -= removedItem.finalCost;

    await cart.save();
    return cart;
};
