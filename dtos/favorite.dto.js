// dtos/favorite.dto.js
export const validateFavoriteDto = ({ itemId, kind }) => {
    if (!kind) throw new Error('kind is required')
    if (!['Room', 'Event'].includes(kind)) throw new Error('Invalid kind')
    return { kind }
}
