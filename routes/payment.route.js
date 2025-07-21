import { Router } from 'express'
import * as paymentController from '../controller/payment/payment.controller.js'
import { validateInit } from '../middleware/validate.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = Router()

/**
 * @swagger
 * /payment/init:
 *   post:
 *     summary: Initialize a payment
 *     description: >
 *       Creates a new payment session via Chapa and returns a checkout URL. 
 *       Requires authentication and valid payload including user and payment info.
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - amount
 *               - currency
 *               - email
 *               - first_name
 *               - last_name
 *               - phone_number
 *             properties:
 *               businessId:
 *                 type: string
 *                 example: "64d3f6c5bbdd3b004894d201"
 *               amount:
 *                 type: number
 *                 example: 500
 *               currency:
 *                 type: string
 *                 example: "ETB"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               phone_number:
 *                 type: string
 *                 example: "0911122233"
 *               metadata:
 *                 type: object
 *                 example:
 *                   bookingId: "66ff21ed884ecad6dc1e965a"
 *                   paymentType: "room_booking"
 *     responses:
 *       200:
 *         description: Checkout URL and tx_ref returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 checkout_url:
 *                   type: string
 *                   example: "https://checkout.chapa.co/tx_ref123"
 *                 tx_ref:
 *                   type: string
 *                   example: "room_booking-uuid-162918382"
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 */

router.post('/init', verifyJWT, validateInit, paymentController.init)
/**
 * @swagger
 * /payment/verify/{tx_ref}:
 *   get:
 *     summary: Verify a transaction
 *     description: >
 *       Verifies payment status using Chapa transaction reference (tx_ref).
 *       Confirms the status and updates internal records like Room/Event/Booking.
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: tx_ref
 *         required: true
 *         schema:
 *           type: string
 *         description: Chapa transaction reference (tx_ref)
 *         example: room_booking-fd0982-1629238123
 *     responses:
 *       200:
 *         description: Transaction verified and updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 status: "success"
 *                 tx_ref: "room_booking-fd0982-1629238123"
 *                 reference: "CHAPA_REF_001"
 *                 amount: 500
 *                 currency: "ETB"
 *                 customer:
 *                   email: "john@example.com"
 *                   phone_number: "0911122233"
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */

router.get('/verify/:tx_ref', paymentController.verify)
export default router
