import express from 'express';
import * as roomDiscountController from '../controller/discount/discount.controller.js'

const router = express.Router();

router.post('/:roomId/discounts/:discountId', roomDiscountController.addDiscount);

router.delete('/:roomId/discounts/:discountId', roomDiscountController.removeDiscount);

router.post('/', roomDiscountController.createDiscountRule);

router.get('/', roomDiscountController.getDiscounts);

router.get('/calculate', roomDiscountController.getDiscountCalculation);

router.get('/:roomId/discounts', roomDiscountController.getRoomDiscounts);


export default router;
