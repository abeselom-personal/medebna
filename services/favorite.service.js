// services/favorite.service.js
import Favorite from '../model/favorite/favorite.model.js'

export const toggleFavorite = async (userId, itemId, kind) => {
    const existing = await Favorite.findOne({ user: userId, item: itemId, kind })
    if (existing) {
        await Favorite.deleteOne({ _id: existing._id })
        return { favorited: false }
    }
    await Favorite.create({ user: userId, item: itemId, kind })
    return { favorited: true }
}

export const getFavorites = async (userId, kind) => {
    return Favorite.find({ user: userId, kind }).populate('item')
}
