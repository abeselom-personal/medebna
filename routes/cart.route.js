import { Router } from 'express';
import * as cartController from '../controller/cart/cart.controller.js';
import * as checkoutController from '../controller/cart/checkout.controller.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = Router();

// Cart management routes
router.post('/', verifyJWT, cartController.createOrGetCart);
router.get('/', verifyJWT, cartController.createOrGetCart);
router.get('/:cartId', verifyJWT, cartController.getCart);
router.post('/:cartId/item', verifyJWT, cartController.addToCart);
router.put('/:cartId/item/:itemId', verifyJWT, cartController.updateCartItem);
router.delete('/:cartId/item/:itemId', verifyJWT, cartController.removeCartItem);

// Checkout process
router.post('/:cartId/checkout', verifyJWT, checkoutController.initCheckout);
router.post('/:cartId/complete-checkout', verifyJWT, checkoutController.completeCheckout);

export default router;
