import express from 'express'
import * as eventController from '../controller/event/event.controller.js'
import verifyJWT from '../middleware/verifyJWT.js'
import { validateIdParam } from '../middleware/validate.js'
import upload from '../middleware/upload.js'

const router = express.Router()

router.use(verifyJWT)

/**
 * @swagger
 * tags:
 *   name: Event
 *   description: Event & ticket booking management
 */

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Event]
 *     security: [bearerAuth: []]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreateDto'
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/EventResponse'
 */
router.post('/', upload.array('images', 10), eventController.createEvent)

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: List all user's events
 *     tags: [Event]
 *     security: [bearerAuth: []]
 *     responses:
 *       200:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/EventResponse'
 */
router.get('/', eventController.listEvents)

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Event]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/EventResponse'
 */
router.get('/:id', validateIdParam, eventController.getEvent)

/**
 * @swagger
 * /api/events/{id}:
 *   patch:
 *     summary: Update an event
 *     tags: [Event]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventUpdateDto'
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/EventResponse'
 */
router.patch('/:id', validateIdParam, upload.array('images', 10), eventController.updateEvent)

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete event by ID
 *     tags: [Event]
 *     security: [bearerAuth: []]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.delete('/:id', validateIdParam, eventController.deleteEvent)

export default router
