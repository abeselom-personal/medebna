import express from 'express'

import authRouter from '../routes/auth.route.js'
import publicRouter from '../routes/public/index.js'
import businessRouter from '../routes/business.route.js'
import paymentRouter from '../routes/payment.route.js'
import eventRouter from '../routes/event.route.js'
import roomRouter from '../routes/room.route.js'
import favoriteRouter from '../routes/favorite.route.js'
import bookingRouter from '../routes/booking.route.js'
import financialRouter from '../routes/booking.route.js'

const router = express.Router()


/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Authentication registering and logout
 */
router.use('/auth', authRouter)

/**
 * @swagger
 * tags:
 *   - name: Public
 *     description: Public routes that do not require authentication
 */
router.use('/public', publicRouter)

/**
 * @swagger
 * tags:
 *   - name: Business
 *     description: Manage business profiles and data
 */
router.use('/business', businessRouter)

/**
 * @swagger
 * tags:
 *   - name: Payment
 *     description: Payment processing and transactions
 */
router.use('/payment', paymentRouter)

/**
 * @swagger
 * tags:
 *   - name: Room
 *     description: Room listing and management
 */
router.use('/rooms', roomRouter)

/**
 * @swagger
 * tags:
 *   - name: Event
 *     description: Event creation and management
 */
router.use('/events', eventRouter)

/**
 * @swagger
 * tags:
 *   - name: Favorite
 *     description: Favorite and unfavorite functionality
 */
router.use('/favorites', favoriteRouter)

/**
 * @swagger
 * tags:
 *   - name: Booking
 *     description: Booking creation, history, and cancellation
 */
router.use('/bookings', bookingRouter)

/**
 * @swagger
 * tags:
 *   - name: Financial
 *     description: Financial reports
 */
router.use('/financial', financialRouter)
export default router
