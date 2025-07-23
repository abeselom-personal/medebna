import { Router } from 'express'
import * as controller from '../controller/dashboard/dashboard.controller.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Business performance dashboards
 */

/**
 * @swagger
 * /api/dashboard/vendor:
 *   get:
 *     summary: Get vendor dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         schema:
 *           type: string
 *         description: ID of the business to view dashboard for
 *     responses:
 *       200:
 *         description: Vendor dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 business:
 *                   $ref: '#/components/schemas/Business'
 *                 stats:
 *                   type: object
 *                   properties:
 *                     bookings:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: number
 *                         confirmed:
 *                           type: number
 *                         cancelled:
 *                           type: number
 *                     revenue:
 *                       type: number
 *                     rooms:
 *                       type: number
 *                     events:
 *                       type: number
 *                 upcomingBookings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 recentPayments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 businesses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *       400:
 *         description: Error retrieving dashboard data
 */
router.get('/vendor', verifyJWT, controller.getVendorDashboard)

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     businesses:
 *                       type: object
 *                       properties:
 *                         hotel:
 *                           type: number
 *                         venue:
 *                           type: number
 *                     users:
 *                       type: object
 *                       properties:
 *                         customer:
 *                           type: number
 *                         vendor:
 *                           type: number
 *                         admin:
 *                           type: number
 *                     bookings:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: number
 *                         confirmed:
 *                           type: number
 *                         cancelled:
 *                           type: number
 *                     revenue:
 *                       type: number
 *                 recentActivities:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Error retrieving dashboard data
 */
router.get('/admin', verifyJWT, controller.getAdminDashboard)

export default router
