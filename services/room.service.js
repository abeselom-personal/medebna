// services/room.service.js
import mongoose from 'mongoose'
import * as DiscountService from './discount.service.js'
import Room from '../model/room/room.model.js'

export const createRoom = async (data) => {
    const { discounts, ...roomData } = data
    console.log(roomData)
    const room = new Room(roomData)
    await room.save()

    if (discounts) {
        const discountDocs = await DiscountService.createDiscountRulesForTarget(room._id, 'Room', discounts)
        room.discounts = discountDocs.map(d => d._id)
        await room.save()
    }

    return room
}
export const createMultipleRooms = async (rooms, createdBy) => {
    const prepared = rooms.map(r => ({ ...r, createdBy }))
    return Room.insertMany(prepared)
}

const addFavoritesAggregation = (userId = null) => {
    const match = [
        { $eq: ['$item', '$$roomId'] },
        { $eq: ['$kind', 'Room'] }
    ]
    if (userId) match.push({ $eq: ['$user', new mongoose.Types.ObjectId(userId)] })

    return [
        {
            $lookup: {
                from: 'favorites',
                let: { roomId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $and: match }
                        }
                    }
                ],
                as: 'favorites'
            }
        },
        {
            $addFields: {
                favoritesCount: { $size: '$favorites' },
                isFavorite: { $gt: [{ $size: '$favorites' }, 0] }
            }
        }
    ]
}

export const getAllRooms = async (filter = {}, limit = 100, skip = 0) => {
    return Room.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        ...addFavoritesAggregation()
    ])
}

export const getRoomById = async (id) => {
    const result = await Room.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        ...addFavoritesAggregation()
        , {
            $lookup: {
                from: 'businesses',
                localField: 'businessId',
                foreignField: '_id',
                as: 'business'
            }
        },
        {
            $unwind: {
                path: '$business',
                preserveNullAndEmptyArrays: true
            }
        }
    ])
    if (!result.length) throw new Error('Room not found')
    return result[0]
}

export const updateRoom = async (id, updates) => {
    const room = await Room.findByIdAndUpdate(id, updates, { new: true })
    if (!room) throw new Error('Room not found')
    return room
}

export const deleteRoom = async (id) => {
    const room = await Room.findByIdAndDelete(id)
    if (!room) throw new Error('Room not found or already deleted')
    return room
}

export const getRoomsByUser = async (userId) => {
    return Room.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
        { $sort: { createdAt: -1 } },
        ...addFavoritesAggregation(userId)
    ])
}

export const searchRooms = async (query = {}) => {
    const filter = {}
    if (query.location) filter.location = new RegExp(query.location, 'i')
    if (query.title) filter.title = new RegExp(query.title, 'i')
    if (query.from && query.to) {
        filter['availability.from'] = { $lte: new Date(query.from) }
        filter['availability.to'] = { $gte: new Date(query.to) }
    }

    return Room.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        ...addFavoritesAggregation()
    ])
}

export const isRoomAvailable = async (roomId, from, to) => {
    const room = await Room.findById(roomId)
    if (!room) throw new Error('Room not found')
    return (
        new Date(from) >= room.availability.from &&
        new Date(to) <= room.availability.to
    )
}
