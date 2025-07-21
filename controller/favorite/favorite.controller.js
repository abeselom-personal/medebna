// controller/favorite.controller.js
import * as favoriteService from '../../services/favorite.service.js'
import { validateFavoriteDto } from '../../dtos/favorite.dto.js'

export const toggleFavorite = async (req, res, next) => {
    try {
        const { id } = req.params
        const { kind } = validateFavoriteDto(req.body)
        const result = await favoriteService.toggleFavorite(req.user.id, id, kind)
        res.json(result)
    } catch (err) {
        next(err)
    }
}

export const getFavorites = async (req, res, next) => {
    try {
        const kind = req.query.kind
        const favorites = await favoriteService.getFavorites(req.user.id, kind)
        res.json(favorites)
    } catch (err) {
        next(err)
    }
}
