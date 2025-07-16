// services/room.service.js
import Room from '../model/room/room.model.js'

export const createRoom = async (data) => {
    const room = new Room(data)
    await room.save()
    return room
}

export const createMultipleRooms = async (rooms, createdBy) => {
    const prepared = rooms.map(r => ({ ...r, createdBy }))
    return Room.insertMany(prepared)
}

export const getAllRooms = async (filter = {}, limit = 100, skip = 0) => {
    return Room.find(filter).limit(limit).skip(skip).sort({ createdAt: -1 })
}

export const getRoomById = async (id) => {
    const room = await Room.findById(id)
    if (!room) throw new Error('Room not found')
    return room
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
    return Room.find({ createdBy: userId }).sort({ createdAt: -1 })
}

export const searchRooms = async (query = {}) => {
    const filter = {}
    if (query.location) filter.location = new RegExp(query.location, 'i')
    if (query.title) filter.title = new RegExp(query.title, 'i')
    if (query.from && query.to) {
        filter['availability.from'] = { $lte: new Date(query.from) }
        filter['availability.to'] = { $gte: new Date(query.to) }
    }
    return Room.find(filter).sort({ createdAt: -1 })
}

export const isRoomAvailable = async (roomId, from, to) => {
    const room = await Room.findById(roomId)
    if (!room) throw new Error('Room not found')
    return (
        new Date(from) >= room.availability.from &&
        new Date(to) <= room.availability.to
    )
}
