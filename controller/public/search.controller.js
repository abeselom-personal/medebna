
import { searchService } from '../../services/public/public.service.js'
import { RoomDTO, EventDTO } from '../../dtos/public.dto.js'

export const search = async (req, res) => {
    const { where, when } = req.query
    const { rooms, events } = await searchService({ where, when })

    res.status(200).json({
        rooms: rooms.map(RoomDTO),
        events: events.map(EventDTO)
    })
}
