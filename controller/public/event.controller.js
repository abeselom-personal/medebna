import { getAllEventsService, getEventByIdService } from '../../services/public/public.service.js'
import { EventDTO, PaginatedDTO } from '../../dtos/public.dto.js'
import mongoose from 'mongoose'

export const getAllEvents = async (req, res) => {
    const page = +req.query.page || 1
    const limit = +req.query.limit || 10
    const [events, total] = await getAllEventsService({ page, limit })
    res.status(200).json(PaginatedDTO(events.map(EventDTO), page, limit, total))
}

export const getEventById = async (req, res) => {

    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid room ID format' })
    }
    const event = await getEventByIdService(id)
    if (!event) return res.status(404).json({ message: 'Event not found' })
    res.status(200).json(EventDTO(event))
}
