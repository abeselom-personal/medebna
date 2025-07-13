import * as express from "express";
const paymentRouter = express.Router();

import { createUserAndInitializePayment, confirmPayment, handlePaymentCallback } from "../controller/payment/chapaPaymentController.js";
import * as paymentController from "../controller/payment/stripePaymentController.js";

paymentRouter.post('/payment', createUserAndInitializePayment);
paymentRouter.get('/payment/verify/:referenceId', confirmPayment);
paymentRouter.post('/create-payment-intent', paymentController.createStripePaymentIntent);
paymentRouter.post('/payment/webhook', handlePaymentCallback);


export default paymentRouter;
