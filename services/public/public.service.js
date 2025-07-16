
import Room from '../../model/room/room.model.js'
import Event from '../../model/event/event.model.js'

export const getAllRoomsService = async ({ page, limit }) => {
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
        Room.find().skip(skip).limit(limit),
        Room.countDocuments()
    ])
    return [items, total]
}

export const getAllEventsService = async ({ page, limit }) => {
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
        Event.find().skip(skip).limit(limit),
        Event.countDocuments()
    ])
    return [items, total]
}
export const getRoomByIdService = (id) => Room.findById(id)
export const getEventByIdService = (id) => Event.findById(id)

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
    limit = 10
}) => {
    const skip = (page - 1) * limit
    const isRoom = source === 'rooms'

    const query = {}

    if (where) {
        query.location = { $regex: new RegExp(where, 'i') }
    }

    if (isRoom) {
        if (priceMin || priceMax) {
            query.pricePerNight = {}
            if (priceMin) query.pricePerNight.$gte = Number(priceMin)
            if (priceMax) query.pricePerNight.$lte = Number(priceMax)
        }

        if (roomType) {
            query.type = roomType
        }

        if (facilities?.length) {
            query.facilities = { $all: facilities }
        }

        if (dateFrom && dateTo) {
            query['availability.from'] = { $lte: new Date(dateFrom) }
            query['availability.to'] = { $gte: new Date(dateTo) }
        } else if (when) {
            const date = new Date(when)
            query['availability.from'] = { $lte: date }
            query['availability.to'] = { $gte: date }
        }

        const [rooms, total] = await Promise.all([
            Room.find(query).skip(skip).limit(limit),
            Room.countDocuments(query)
        ])

        return { data: rooms, total }
    } else {
        if (when) query.date = new Date(when)

        const [events, total] = await Promise.all([
            Event.find(query).skip(skip).limit(limit),
            Event.countDocuments(query)
        ])

        return { data: events, total }
    }
}
