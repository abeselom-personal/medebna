// routes/favorite.route.js
import { Router } from 'express'
import * as controller from '../controller/favorite/favorite.controller.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = Router()

router.post('/:id', verifyJWT, controller.toggleFavorite)
router.get('/', verifyJWT, controller.getFavorites)

export default router
