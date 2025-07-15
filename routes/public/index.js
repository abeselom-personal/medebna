import { Router } from 'express'
import roomRoutes from './room.route.js'
import eventRoutes from './event.route.js'
import searchRoutes from './search.route.js'

const router = Router()

router.use('/public', roomRoutes)
router.use('/public', eventRoutes)
router.use('/public', searchRoutes)

export default router
