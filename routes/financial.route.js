// routes/financial.route.js
import { Router } from 'express'
import * as controller from '../controller/financial/financial.controller.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = Router()

router.get('/', verifyJWT, controller.getBookings)


export default router
