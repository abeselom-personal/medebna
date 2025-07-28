// services/room.service.js
import mongoose from 'mongoose'
import * as DiscountService from './discount.service.js'
import Room from '../model/room/room.model.js'

export const createRoom = async (data) => {
    const { discounts, ...roomData } = data;
    const room = new Room(roomData);
    await room.save();

    if (discounts && discounts.length) {
        await DiscountService.createDiscountRulesForTarget(room._id, 'Room', discounts);
    }

    return room;
};
export const createMultipleRooms = async (rooms, createdBy) => {
    const prepared = rooms.map(r => ({ ...r, createdBy }))
    return Room.insertMany(prepared)
}

const addFavoritesAndDiscountAggregation = (userId = null, type = "Room") => {
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
                    { $match: { $expr: { $and: match } } }
                ],
                as: 'favorites'
            }
        },
        {
            $addFields: {
                favoritesCount: { $size: '$favorites' },
                isFavorite: { $gt: [{ $size: '$favorites' }, 0] }
            }
        },
        {
            $lookup: {
                from: 'discountrules',
                let: { itemId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$target', '$$itemId'] },
                                    { $eq: ['$targetType', type] },
                                    { $eq: ['$enabled', true] },
                                ]
                            }
                        }
                    },
                    {
                        $addFields: {
                            conditions: {
                                $map: {
                                    input: '$conditions',
                                    as: 'condition',
                                    in: {
                                        key: '$$condition.key',
                                        operator: '$$condition.operator',
                                        value: {
                                            $cond: {
                                                if: { $eq: [{ $type: '$$condition.value' }, 'string'] },
                                                then: { $toDouble: '$$condition.value' },
                                                else: '$$condition.value'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            discountPercent: 1,
                            maxDiscount: 1,
                            conditions: 1,
                            validFrom: 1,
                            validTo: 1
                        }
                    }
                ],
                as: 'discounts'
            }
        },
    ]
}

export const getAllRooms = async (filter = {}, limit = 100, skip = 0) => {
    return Room.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        ...addFavoritesAndDiscountAggregation()
    ])
}

export const getRoomById = async (id, userId = null) => {
    const result = await Room.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        ...DiscountService.addFavoritesAggregation(userId),
        {
            $lookup: {
                from: 'discountrules',
                let: { roomId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$target', '$$roomId'] },
                                    { $eq: ['$targetType', 'Room'] },
                                    { $eq: ['$enabled', true] },
                                    { $lte: ['$validFrom', new Date()] },
                                    { $gte: ['$validTo', new Date()] }
                                ]
                            }
                        }
                    }
                ],
                as: 'discounts'
            }
        },
        {
            $lookup: {
                from: 'businesses',
                localField: 'businessId',
                foreignField: '_id',
                as: 'business'
            }
        },
        { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } }
    ]);

    if (!result.length) throw new Error('Room not found');
    return result[0];
};
export const updateRoom = async (id, updates) => {

    const room = await Room.findByIdAndUpdate(id, updates, { new: true })

    if (!room) throw new Error('Room not found')
    return room
}

export const updateRoomAvailability = async (id, delta) => {
    const room = await Room.findById(id);
    if (!room) throw new Error('Room not found');

    const increment = Number(delta);
    if (isNaN(increment)) throw new Error('Invalid increment value');

    const newCapacity = room.currentCapacity + increment;
    if (newCapacity < 0 || newCapacity > room.maxCapacity) return room;

    room.currentCapacity = newCapacity;
    await room.save();
    return room;
};

export const deleteRoom = async (id) => {
    const room = await Room.findByIdAndDelete(id)
    if (!room) throw new Error('Room not found or already deleted')
    return room
}

export const getRoomsByUser = async (userId) => {
    return Room.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
        { $sort: { createdAt: -1 } },
        ...addFavoritesAndDiscountAggregation(userId)
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
        ...addFavoritesAndDiscountAggregation()
    ])
}

export const isRoomAvailable = async (roomId, from, to) => {
    const room = await Room.findById(roomId);
    if (!room) throw new Error('Room not found');

    const checkIn = new Date(from);
    const checkOut = new Date(to);

    return (
        checkIn >= room.availability.from &&
        checkOut <= room.availability.to
    );
};
