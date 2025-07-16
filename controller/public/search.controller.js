import { searchService } from '../../services/public/public.service.js'
import { RoomDTO, EventDTO } from '../../dtos/public.dto.js'

export const search = async (req, res) => {
    const {
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
    } = req.query

    const facilitiesArray = facilities
        ? facilities.split(',').map(f => f.trim())
        : []

    const { data, total } = await searchService({
        source,
        where,
        when,
        dateFrom,
        dateTo,
        priceMin,
        priceMax,
        roomType,
        facilities: facilitiesArray,
        page: Number(page),
        limit: Number(limit)
    })

    const formatted = source === 'rooms' ? data.map(RoomDTO) : data.map(EventDTO)

    res.status(200).json({
        [source]: formatted,
        total,
        page: Number(page),
        limit: Number(limit)
    })
}
