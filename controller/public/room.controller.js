import { getAllRoomsService, getRoomByIdService } from '../../services/public/public.service.js'
import { RoomDTO, PaginatedDTO } from '../../dtos/public.dto.js'
import mongoose from 'mongoose'

export const getAllRooms = async (req, res) => {
    const page = +req.query.page || 1
    const limit = +req.query.limit || 10
    const [rooms, total] = await getAllRoomsService({ page, limit })
    res.status(200).json(PaginatedDTO(rooms.map(RoomDTO), page, limit, total))
}

export const getRoomById = async (req, res) => {

    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid room ID format' })
    }

    const room = await getRoomByIdService(id)
    console.log(room)
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.status(200).json(RoomDTO(room))
}
