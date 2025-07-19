import express from 'express'

import authRouter from '../routes/auth.route.js'
import publicRouter from '../routes/public/index.js'
import businessRouter from '../routes/business.route.js'
import paymentRouter from '../routes/payment.route.js'
import eventRouter from '../routes/event.route.js'
import roomRouter from '../routes/room.route.js'

const router = express.Router()


router.use('/auth', authRouter)
router.use('/public', publicRouter)
router.use('/business', businessRouter)
router.use('/payment', paymentRouter)
router.use('/rooms', roomRouter)
router.use('/events', eventRouter)

//router.use('/api', paymentRouter)
//router.use('/hotel', hotelRouter)
//router.use('/car', carRouter)
//router.use('/event', eventRouter)
//router.use('/car-owner', carProfileRouter)
//router.use('/event-owner', eventProfileRouter)
//router.use('/hotel-owner', hotelProfileRouter)
//router.use('/cart', cartRouter)
//router.use('/account', accountRouter)

export default router
