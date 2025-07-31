import * as cartService from '../../services/cart.service.js';

export const createOrGetCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await cartService.getOrCreateCart(userId);
        res.status(200).json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const cart = await cartService.getCartById(cartId);
        res.status(200).json(cart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const cartId = req.params.cartId;
        const itemData = req.body;
        const cart = await cartService.addToCart(cartId, itemData);
        res.status(200).json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { cartId, itemId } = req.params;
        const updates = req.body;
        const cart = await cartService.updateCartItem(cartId, itemId, updates);
        res.status(200).json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const removeCartItem = async (req, res) => {
    try {
        const { cartId, itemId } = req.params;
        const cart = await cartService.removeCartItem(cartId, itemId);
        res.status(200).json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
