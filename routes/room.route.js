// routes/room.routes.js
import express from 'express';
import * as roomController from '../controller/room/room.controller.js';
import verifyJWT from '../middleware/verifyJWT.js';
import { validateIdParam } from '../middleware/validate.js';
import upload from '../middleware/upload.js'

const router = express.Router();
router.use(verifyJWT);

/**
 * @swagger
 * tags:
 *   name: Room
 *   description: Room management
 */

/**
 * @swagger
 * /api/room:
 *   post:
 *     summary: Create a new room
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoomCreateDto'
 *     responses:
 *       200:
 *         description: Room created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoomResponse'
 */
router.post('/', upload.array('images', 10), roomController.createRoom);

/**
 * @swagger
 * /api/room/bulk:
 *   post:
 *     summary: Create multiple rooms
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rooms:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/RoomCreateDto'
 *     responses:
 *       200:
 *         description: Multiple rooms created
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RoomResponse'
 */
router.post('/bulk', roomController.createMultipleRooms);

/**
 * @swagger
 * /api/room:
 *   get:
 *     summary: Get all rooms for the authenticated user
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RoomResponse'
 */
router.get('/', roomController.listRooms);

/**
 * @swagger
 * /api/room/{id}:
 *   get:
 *     summary: Get a room by ID
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoomResponse'
 */
router.get('/:id', validateIdParam, roomController.getRoom);

/**
 * @swagger
 * /api/room/{id}:
 *   patch:
 *     summary: Update a room by ID
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoomUpdateDto'
 *     responses:
 *       200:
 *         description: Updated room details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoomResponse'
 */
router.patch('/:id', validateIdParam, roomController.updateRoom);

/**
 * @swagger
 * /api/room/{id}:
 *   delete:
 *     summary: Delete a room by ID
 *     tags: [Room]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room deleted confirmation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete('/:id', validateIdParam, roomController.deleteRoom);

export default router;
