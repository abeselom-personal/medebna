import { Router } from 'express'
import { getAllRooms, getRoomById } from '../../controller/public/room.controller.js'
import { validateSearchQuery, validateIdParam } from '../../middleware/validate.js'

const router = Router()

/**
 * @swagger
 * /api/public/rooms:
 *   get:
 *     summary: Get all listed rooms
 *     description: Returns paginated list of all available rooms. Can optionally include query parameters for pagination.
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
 *         description: Paginated list of rooms
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedRoomResponse'
 */

router.get('/', getAllRooms)

/**
 * @swagger
 * /api/public/rooms/{id}:
 *   get:
 *     summary: Get room by ID
 *     description: Returns detailed information for a specific room by ID
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Room ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Room details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 */
router.get('/:id', validateIdParam, getRoomById)

export default router
