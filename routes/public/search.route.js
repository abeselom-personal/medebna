import { Router } from 'express'
import { search } from '../../controller/public/search.controller.js'
import { validateSearchQuery } from '../../middleware/validate.js'

const router = Router()

/**
 * @swagger
 * /api/public/search:
 *   get:
 *     summary: Search rooms and events
 *     description: Search rooms and events by location and date. Returns matching results based on query.
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: where
 *         required: true
 *         schema: { type: string }
 *         description: Location (city, address, etc.)
 *       - in: query
 *         name: when
 *         required: true
 *         schema: { type: string, format: date }
 *         description: Date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rooms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Room'
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
router.get('/search', validateSearchQuery, search)

export default router
