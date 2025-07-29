import express from 'express';
import { body } from 'express-validator';
import * as roomDiscountController from '../controller/discount/discount.controller.js'

const router = express.Router();

router.post('/:roomId/discounts/:discountId', roomDiscountController.addDiscount);

router.delete('/:roomId/discounts/:discountId', roomDiscountController.removeDiscount);

router.get('/:roomId/discounts', roomDiscountController.getRoomDiscounts);

router.post('/', roomDiscountController.createDiscountRule);

// router.get('/', roomDiscountController.getDiscounts);

router.post('/calculate', [
    body('itemId').notEmpty().withMessage('Item ID is required'),
    body('checkIn').notEmpty().isISO8601().withMessage('Valid check-in date is required'),
    body('checkOut').notEmpty().isISO8601().withMessage('Valid check-out date is required'),
    body('adults').optional().isInt({ min: 1 }).default(1),
    body('children').optional().isInt({ min: 0 }).default(0),
    body('currency').optional().isString().default('ETB')
], roomDiscountController.getDiscountCalculation);



export default router;
