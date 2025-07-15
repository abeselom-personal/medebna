
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

export const searchService = async ({ where, when }) => {
    const date = new Date(when)
    const rooms = await Room.find({ location: where, 'availability.from': { $lte: date }, 'availability.to': { $gte: date } })
    const events = await Event.find({ location: where, date })

    return { rooms, events }
}
