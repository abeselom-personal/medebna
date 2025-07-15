import express from 'express'

import authRouter from '../routes/auth.route.js'
import publicRouter from '../routes/public/index.js'

// import operatorRouter from '../routes/operator.js'
// import paymentRouter from '../routes/payment.js'
// import hotelRouter from '../routes/hotel.js'
// import carRouter from '../routes/car.js'
// import eventRouter from '../routes/event.js'
// import carProfileRouter from '../routes/profile/carOwner.js'
// import eventProfileRouter from '../routes/profile/eventOwner.js'
// import hotelProfileRouter from '../routes/profile/hotelOwner.js'
// import accountRouter from '../routes/account.js'
// import cartRouter from '../routes/cart/cart.js'

const router = express.Router()

router.use('/auth', authRouter)
router.use('/api', publicRouter)

// router.use('/operator', operatorRouter)
// router.use('/api', paymentRouter)
// router.use('/hotel', hotelRouter)
// router.use('/car', carRouter)
// router.use('/event', eventRouter)
// router.use('/car-owner', carProfileRouter)
// router.use('/event-owner', eventProfileRouter)
// router.use('/hotel-owner', hotelProfileRouter)
// router.use('/cart', cartRouter)
// router.use('/account', accountRouter)

export default router
