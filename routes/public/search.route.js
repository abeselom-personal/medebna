import { Router } from 'express'
import { search } from '../../controller/public/search.controller.js'
import { validateSearchQuery } from '../../middleware/validate.js'

const router = Router()

/**
 * @swagger
 * /api/public/search:
 *   get:
 *     summary: Search rooms or events with flexible filters
 *     description: >
 *       Search available rooms or events using location, dates, price range, room type, and facilities.
 *       Location matching is approximate (fuzzy). Defaults to searching rooms unless `source=events` is passed.
 *     tags:
 *       - Public
 *     parameters:
 *       - in: query
 *         name: source
 *         required: false
 *         schema:
 *           type: string
 *           enum: [rooms, events]
 *           default: rooms
 *         description: Select whether to search "rooms" or "events".
 *       - in: query
 *         name: where
 *         required: true
 *         schema:
 *           type: string
 *         description: Approximate location to search (city, address, etc.)
 *       - in: query
 *         name: when
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Specific date (YYYY-MM-DD) to check availability or event date. Optional if using dateFrom/dateTo.
 *       - in: query
 *         name: dateFrom
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for room availability (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for room availability (YYYY-MM-DD)
 *       - in: query
 *         name: priceMin
 *         required: false
 *         schema:
 *           type: number
 *         description: Minimum price per night (only for room search)
 *       - in: query
 *         name: priceMax
 *         required: false
 *         schema:
 *           type: number
 *         description: Maximum price per night (only for room search)
 *       - in: query
 *         name: roomType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [single, double, shared, suite]
 *         description: Type of room (only for room search)
 *       - in: query
 *         name: facilities
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated facilities like "Wi-Fi,private bathroom" (only for room search)
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Filtered result set of rooms or events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rooms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 *                   description: Returned if source=rooms or default
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                   description: Returned if source=events
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       400:
 *         description: Invalid or missing query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/', validateSearchQuery, search)

export default router
