// routes/event.routes.js
import express from 'express'
import * as eventController from '../controller/event/event.controller.js'
import verifyJWT from '../middleware/verifyJWT.js'
import { checkRole } from '../middleware/verifyRoles.js'
import upload from '../middleware/upload.js'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the event
 *         name:
 *           type: string
 *           description: The name of the event
 *           example: Summer Music Festival
 *         description:
 *           type: string
 *           description: Detailed description of the event
 *           example: The biggest summer music festival in town
 *         location:
 *           type: string
 *           description: Venue location of the event
 *           example: Addis Ababa, Ethiopia
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the event (YYYY-MM-DD)
 *           example: 2025-08-15
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Start time of the event in ISO format
 *           example: 2025-08-15T16:00:00Z
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: End time of the event in ISO format
 *           example: 2025-08-15T23:00:00Z
 *         businessId:
 *           type: string
 *           description: ID of the business organizing the event
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EventImage'
 *         tickets:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Ticket'
 *         performers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Performer'
 *         sponsors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Sponsor'
 *         amenities:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Amenity'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when event was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when event was last updated
 * 
 *     EventImage:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           format: uri
 *           description: URL of the event image
 *         blurhash:
 *           type: string
 *           description: Blurhash string for image placeholder
 * 
 *     Ticket:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Name/type of the ticket
 *           example: VIP Tickets
 *         types:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TicketType'
 * 
 *     TicketType:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Currency or type name
 *           example: USD
 *         price:
 *           type: number
 *           description: Price amount
 *           example: 100
 *         benefits:
 *           type: string
 *           description: Benefits included with this ticket
 *           example: Priority Access
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           description: Amenities included with this ticket
 * 
 *     Performer:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the performer
 *           example: DJ Abebe
 *         role:
 *           type: string
 *           description: Role in the event
 *           example: Headliner
 *         image:
 *           type: string
 *           format: uri
 *           description: URL of performer's image
 * 
 *     Sponsor:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the sponsor
 *           example: Red Bull
 *         logo:
 *           type: string
 *           format: uri
 *           description: URL of sponsor's logo
 *         website:
 *           type: string
 *           format: uri
 *           description: Sponsor's website URL
 * 
 *     Amenity:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the amenity
 *           example: Wi-Fi
 *         icon:
 *           type: string
 *           description: Icon identifier for the amenity
 *           example: wifi-icon
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 *   parameters:
 *     eventId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: The event ID
 *     pageParam:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         default: 1
 *       description: Page number for pagination
 *     limitParam:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 10
 *       description: Number of items per page
 */

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     description: Create a new event with all required information. Vendor or admin role required.
 *     security:
 *       - bearerAuth: []
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - date
 *               - startTime
 *               - endTime
 *               - businessId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the event
 *                 example: Summer Music Festival
 *               description:
 *                 type: string
 *                 description: Detailed description of the event
 *               location:
 *                 type: string
 *                 description: Venue location
 *                 example: Addis Ababa, Ethiopia
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Event date (YYYY-MM-DD)
 *                 example: 2025-08-15
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Start time in ISO format
 *                 example: 2025-08-15T16:00:00Z
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: End time in ISO format
 *                 example: 2025-08-15T23:00:00Z
 *               businessId:
 *                 type: string
 *                 description: ID of the organizing business
 *                 example: 68831e4a48d3eedef87294ce
 *               tickets:
 *                 type: array
 *                 description: Array of ticket types
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       description: Ticket type title
 *                     types:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: Currency or type name
 *                           price:
 *                             type: number
 *                             description: Price amount
 *                           benefits:
 *                             type: string
 *                             description: Included benefits
 *                           amenities:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: Included amenities
 *               performers:
 *                 type: array
 *                 description: Array of performers
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Performer name
 *                     role:
 *                       type: string
 *                       description: Performer role
 *                     image:
 *                       type: string
 *                       description: Performer image URL
 *               sponsors:
 *                 type: array
 *                 description: Array of sponsors
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Sponsor name
 *                     logo:
 *                       type: string
 *                       description: Sponsor logo URL
 *                     website:
 *                       type: string
 *                       description: Sponsor website URL
 *               amenities:
 *                 type: array
 *                 description: Array of venue amenities
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Amenity name
 *                     icon:
 *                       type: string
 *                       description: Amenity icon identifier
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Event images (max 10)
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error description
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                       path:
 *                         type: array
 *                         items:
 *                           type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post(
    '/',
    verifyJWT,
    checkRole(['vendor', 'admin']),
    upload.fields([
        { name: 'images', maxCount: 10 },
        { name: 'performers[]', maxCount: 20 }, // For performer images
        { name: 'sponsors[]', maxCount: 20 }     // For sponsor logos
    ]),
    eventController.createEvent
)

/**
 * @swagger
 * /events:
 *   get:
 *     summary: List all events with pagination
 *     description: Retrieve a paginated list of events with optional filters. Accessible by all authenticated users.
 *     security:
 *       - bearerAuth: []
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location (case-insensitive partial match)
 *         example: Addis Ababa
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter events on or after this date (YYYY-MM-DD)
 *         example: 2025-08-01
 *     responses:
 *       200:
 *         description: Paginated list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of events
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     pages:
 *                       type: integer
 *                       description: Total number of pages
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get(
    '/',
    verifyJWT,
    checkRole(['customer', 'vendor', 'admin']),
    eventController.listEvents
)

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event details by ID
 *     description: Retrieve complete details for a specific event. Accessible by all authenticated users.
 *     security:
 *       - bearerAuth: []
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/eventId'
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.get(
    '/:id',
    verifyJWT,
    checkRole(['customer', 'vendor', 'admin']),
    eventController.getEvent
)

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an existing event
 *     description: Update event details. Vendor or admin role required. Can upload new images and specify existing ones to delete.
 *     security:
 *       - bearerAuth: []
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/eventId'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated event name
 *               description:
 *                 type: string
 *                 description: Updated event description
 *               location:
 *                 type: string
 *                 description: Updated event location
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Updated event date
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Updated start time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: Updated end time
 *               tickets:
 *                 type: array
 *                 description: Updated ticket types
 *                 items:
 *                   $ref: '#/components/schemas/Ticket'
 *               performers:
 *                 type: array
 *                 description: Updated performers
 *                 items:
 *                   $ref: '#/components/schemas/Performer'
 *               sponsors:
 *                 type: array
 *                 description: Updated sponsors
 *                 items:
 *                   $ref: '#/components/schemas/Sponsor'
 *               amenities:
 *                 type: array
 *                 description: Updated amenities
 *                 items:
 *                   $ref: '#/components/schemas/Amenity'
 *               deleteImages:
 *                 oneOf:
 *                   - type: string
 *                     description: Single image URL to delete
 *                   - type: array
 *                     items:
 *                       type: string
 *                     description: Array of image URLs to delete
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New images to upload (max 10)
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.put(
    '/:id',
    verifyJWT,
    checkRole(['vendor', 'admin']),
    upload.array('images', 10),
    eventController.updateEvent
)

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     description: Permanently delete an event and all associated data. Vendor or admin role required.
 *     security:
 *       - bearerAuth: []
 *     tags: [Events]
 *     parameters:
 *       - $ref: '#/components/parameters/eventId'
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Event deleted
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
router.delete(
    '/:id',
    verifyJWT,
    checkRole(['vendor', 'admin']),
    eventController.deleteEvent
)

export default router
