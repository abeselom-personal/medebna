// routes/booking.route.js
import { Router } from 'express'
import * as controller from '../controller/booking/booking.controller.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = Router()


/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking (for logged-in or guest users)
 *     tags: [Booking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item
 *               - kind
 *             properties:
 *               item:
 *                 type: string
 *                 example: "64d8a8e2f1a2c6a9b2c4a1c3"
 *               kind:
 *                 type: string
 *                 enum: [Room, Event]
 *                 example: "Room"
 *               checkIn:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-20"
 *               checkOut:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-22"
 *               guest:
 *                 type: object
 *                 required:
 *                   - fullName
 *                   - email
 *                   - phone
 *                 properties:
 *                   fullName:
 *                     type: string
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     example: "john@example.com"
 *                   phone:
 *                     type: string
 *                     example: "0911123456"
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Validation error
 */
router.post('/', controller.createBooking)

router.get('/:id', controller.getBookingById)

router.get('/', verifyJWT, controller.getBookings)


export default router
