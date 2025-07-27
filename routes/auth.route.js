import express from 'express'
import * as authController from '../controller/auth/auth.controller.js'
import {
    registerSchema, registerResponseSchema,
    loginSchema, loginResponseSchema,
    refreshResponseSchema
} from '../dtos/auth.dto.js'
import { validateBody, validateResponse } from '../middleware/validate.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = express.Router()


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, vendor]
 *                 description: Optional. Defaults to 'customer'. Admin is not allowed.
 *     responses:
 *       200:
 *         description: Registered user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 */
router.post('/register', validateBody(registerSchema), validateResponse(registerResponseSchema), authController.register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login a user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', validateBody(loginSchema), validateResponse(loginResponseSchema), authController.login)

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     responses:
 *       200:
 *         description: New access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 */
router.post('/refresh', verifyJWT, validateResponse(refreshResponseSchema), authController.refresh)

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user
 *     responses:
 *       200:
 *         description: Current user info
 */
router.get('/me', verifyJWT, authController.me)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout user
 *     responses:
 *       204:
 *         description: No Content
 */
router.post('/logout', verifyJWT, authController.logout)

export default router
