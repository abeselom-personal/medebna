// services/public.service.js
import mongoose from 'mongoose';
import Room from '../../model/room/room.model.js';
import Event from '../../model/event/event.model.js';

const addFavoritesAndDiscounts = (userId = null, type) => {

    return [
        // Favorites lookup
        {
            $lookup: {
                from: 'favorites',
                let: { itemId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$item', '$$itemId'] },
                                    { $eq: ['$kind', type] },
                                    ...(userId ? [{ $eq: ['$user', new mongoose.Types.ObjectId(userId)] }] : [])
                                ]
                            }
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
        },
        // Discounts lookup with proper type conversion and date filtering
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
        // Business information
        {
            $lookup: {
                from: 'businesses',
                localField: 'businessId',
                foreignField: '_id',
                as: 'business'
            }
        },
        { $unwind: { path: '$business', preserveNullAndEmptyArrays: true } }
    ];
};

// Enhanced room service with proper discount handling
export const getAllRoomsService = async ({ page, limit, userId = null }) => {
    const skip = (page - 1) * limit;

    const aggregation = [
        { $match: {} },
        ...addFavoritesAndDiscounts(userId, 'Room'),
        { $skip: skip },
        { $limit: limit }
    ];

    const [items, total] = await Promise.all([
        Room.aggregate(aggregation),
        Room.countDocuments()
    ]);

    return [items, total];
};

// Enhanced search service with discount support
export const searchService = async ({
    source = 'rooms',
    where,
    when,
    dateFrom,
    dateTo,
    priceMin,
    priceMax,
    roomType,
    facilities,
    page = 1,
    limit = 10,
    userId = null
}) => {
    const skip = (page - 1) * limit;
    const isRoom = source === 'rooms';
    const model = isRoom ? Room : Event;
    const type = isRoom ? 'Room' : 'Event';

    const query = {};
    const now = new Date();

    // Build query based on parameters
    if (where) query.location = { $regex: where, $options: 'i' };

    if (isRoom) {
        if (priceMin || priceMax) {
            query['price.amount'] = {};
            if (priceMin) query['price.amount'].$gte = Number(priceMin);
            if (priceMax) query['price.amount'].$lte = Number(priceMax);
        }
        if (roomType) query.type = roomType;
        if (facilities?.length) query.facilities = { $all: facilities };

        // Date availability handling
        if (dateFrom && dateTo) {
            query['availability.from'] = { $lte: new Date(dateFrom) };
            query['availability.to'] = { $gte: new Date(dateTo) };
        } else if (when) {
            const date = new Date(when);
            query['availability.from'] = { $lte: date };
            query['availability.to'] = { $gte: date };
        }
    } else {
        if (when) query.date = new Date(when);
    }

    const aggregation = [
        { $match: query },
        ...addFavoritesAndDiscounts(userId, type),
        { $skip: skip },
        { $limit: limit }
    ];

    const [data, total] = await Promise.all([
        model.aggregate(aggregation),
        model.countDocuments(query)
    ]);

    return { data, total };
};
export const getAllEventsService = async ({ page, limit, userId = null }) => {
    const skip = (page - 1) * limit;

    const aggregation = [
        ...addFavoritesAndDiscounts(userId, 'Event'),
        { $skip: skip },
        { $limit: limit }
    ];

    const [items, total] = await Promise.all([
        Event.aggregate(aggregation),
        Event.countDocuments()
    ]);

    return [items, total];
};

