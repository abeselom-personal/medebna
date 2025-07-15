import { Router } from 'express'
import { getAllEvents, getEventById } from '../../controller/public/event.controller.js'
import { validateIdParam } from '../../middleware/validate.js'

const router = Router()

/**
 * @swagger
 * /api/public/events:
 *   get:
 *     summary: Get all listed events
 *     description: Returns paginated list of all available events. Can optionally include query parameters for pagination.
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Paginated list of events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEventResponse'
 */
router.get('/events', getAllEvents)

/**
 * @swagger
 * /api/public/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     description: Returns detailed information for a specific event by ID
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Event ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 */

router.get('/events/:id', validateIdParam, getEventById)

export default router
