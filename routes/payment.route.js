import { Router } from 'express'
import * as paymentController from '../controller/payment/payment.controller.js'
import { validateInit } from '../middleware/validate.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = Router()
router.use(verifyJWT)

/**
 * @route POST /api/payment/init
 * @desc  Initialize payment (returns checkout URL)
 */
router.post('/init', validateInit, paymentController.init)

/**
 * @route GET /api/payment/verify/:tx_ref
 * @desc  Verify transaction result
 */
router.get('/verify/:tx_ref', paymentController.verify)

export default router
