// routes/favorite.route.js
import { Router } from 'express'
import * as controller from '../controller/favorite/favorite.controller.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = Router()

/**
 * @swagger
 * tags:
 *   - name: Favorite
 *     description: |
 *       Manage user's favorite items, allowing users to add or remove rooms and events from their favorites.
 *       Each user can favorite either a room or an event, and toggle the favorite state per item.
 */

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Get user's favorites
 *     description: |
 *       Returns a list of favorited items for the authenticated user.
 *       You can filter the favorites by kind: either "Room" or "Event".
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kind
 *         schema:
 *           type: string
 *           enum: [Room, Event]
 *         required: false
 *         description: Filter by kind of favorite (Room or Event)
 *     responses:
 *       200:
 *         description: List of favorited items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/Room'
 *                   - $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 */
router.post('/:id', verifyJWT, controller.toggleFavorite)

/**
 * @swagger
 * /favorites/{id}:
 *   post:
 *     summary: Toggle favorite for a room or event
 *     description: |
 *       Add or remove a favorite for a room or event. 
 *       Requires the `kind` (either "Room" or "Event") in the request body.
 *       If the item is already favorited, it will be removed. Otherwise, it will be added.
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the item to toggle favorite for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - kind
 *             properties:
 *               kind:
 *                 type: string
 *                 enum: [Room, Event]
 *                 description: The kind of item being favorited
 *     responses:
 *       200:
 *         description: Toggle result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favorited:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/', verifyJWT, controller.getFavorites)

export default router
