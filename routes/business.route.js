// routes/business.routes.js
import express from 'express'
import * as businessController from '../controller/business/business.controller.js'
import verifyJWT from '../middleware/verifyJWT.js'
import upload from '../middleware/upload.js'
const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Business
 *   description: Business onboarding and management
 */
router.use(verifyJWT)

/**
 * @swagger
 * /api/business:
 *   post:
 *     summary: Create a new business
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [hotel, venue]
 *                 example: hotel
 *     responses:
 *       201:
 *         description: Business created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessResponse'
 */
router.post('/', businessController.createBusiness)

/**
 * @swagger
 * /api/business/my:
 *   get:
 *     summary: Get all businesses created by current user
 *     tags: [Business]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of businesses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BusinessResponse'
 */
router.get('/my', businessController.getMyBusinesses)

/**
 * @swagger
 * /api/business/{id}:
 *   get:
 *     summary: Get a single business by ID with step progress
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Business data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessResponse'
 */
router.get('/:id', businessController.getBusinessById)

/**
 * @swagger
 * /api/business/{id}:
 *   delete:
 *     summary: Delete a business
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deleted message
 */
router.delete('/:id', businessController.deleteBusiness)


/**
 * @swagger
 * /api/business/{id}/publish:
 *   post:
 *     summary: Publish a business after all steps are completed
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Published business
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessResponse'
 */
router.post('/:id/publish', businessController.publishBusiness)
/**
 * @swagger
 * /api/business/{id}/{step}:
 *   post:
 *     summary: Update a business onboarding step (basic, contacts, etc.)
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: step
 *         required: true
 *         schema:
 *           type: string
 *           enum: [basic, contacts, amenities, photos, rooms, legal, paymentSettings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StepUpdateDto'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Updated business
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessResponse'
 */
router.post(
    '/:id/:step',
    upload.fields([
        { name: 'images', maxCount: 10 },
        { name: 'additionalDocs', maxCount: 10 }
    ]),
    businessController.updateStep
)
/**
 * @swagger
 * /api/business/{id}/steps:
 *   get:
 *     summary: Get step completion status for a business
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Steps completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: boolean
 */

router.get('/:id/steps', businessController.getStepsStatus)
/**
 * @swagger
 * /api/business/{id}/rooms:
 *   get:
 *     summary: Get rooms for a business
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 $ref: '#/components/schemas/Room'
 */

router.get('/:id/rooms', businessController.getRooms)
/**
 * @swagger
 * /api/business/{id}/events:
 *   get:
 *     summary: Get events for a business
 *     tags: [Business]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */

router.get('/:id/events', businessController.getEvents)

export default router
