import { Router } from 'express'
import roomRoutes from './room.route.js'
import eventRoutes from './event.route.js'
import searchRoutes from './search.route.js'

const router = Router()

router.use('/rooms', roomRoutes)
router.use('/events', eventRoutes)
router.use('/search', searchRoutes)

export default router
