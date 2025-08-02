// controllers/event.controller.js
import * as eventService from '../../services/event.service.js'
import {
    eventCreateDto,
    eventUpdateDto,
    eventResponseDto
} from '../../dtos/event.dto.js'
import { processImages, deleteImages } from '../../services/imageUpload.service.js'

export const createEvent = async (req, res, next) => {
    try {
        const parsedBody = Array.isArray(req.body) ? req.body[0] : req.body

        const data = {
            name: parsedBody.name,
            description: parsedBody.description,
            location: parsedBody.location,
            date: parsedBody.date,
            startTime: parsedBody.startTime,
            endTime: parsedBody.endTime,
            businessId: parsedBody.businessId,
            tickets: [],
            performers: [],
            sponsors: [],
            amenities: []
        }

        // Validate required fields
        if (!data.name || !data.location || !data.date || !data.startTime || !data.endTime || !data.businessId) {
            throw new Error('Missing required event fields')
        }

        // Validate time range
        const start = new Date(data.startTime)
        const end = new Date(data.endTime)
        if (start >= end) throw new Error('startTime must be before endTime')

        // Validate image upload
        if (!req.files?.length) {
            throw new Error('At least one event image is required')
        }

        // Handle image upload
        data.images = await processImages(req.files, process.env.BASE_URL)

        // Parse Tickets
        if (parsedBody['tickets[0].title']) {
            let ticketIndex = 0
            while (parsedBody[`tickets[${ticketIndex}].title`]) {
                const ticket = {
                    title: parsedBody[`tickets[${ticketIndex}].title`],
                    totalCapacity: parseInt(parsedBody[`tickets[${ticketIndex}].totalCapacity`] || 0),
                    types: []
                }

                let typeIndex = 0
                while (parsedBody[`tickets[${ticketIndex}].types[${typeIndex}].name`]) {
                    const type = {
                        name: parsedBody[`tickets[${ticketIndex}].types[${typeIndex}].name`],
                        price: parseFloat(parsedBody[`tickets[${ticketIndex}].types[${typeIndex}].price`]),
                        benefits: parsedBody[`tickets[${ticketIndex}].types[${typeIndex}].benefits`] || '',
                        amenities: []
                    }

                    let amenityIndex = 0
                    while (parsedBody[`tickets[${ticketIndex}].types[${typeIndex}].amenities[${amenityIndex}]`]) {
                        type.amenities.push(parsedBody[`tickets[${ticketIndex}].types[${typeIndex}].amenities[${amenityIndex}]`])
                        amenityIndex++
                    }

                    if (!type.name || isNaN(type.price)) throw new Error('Missing required ticket type info')
                    ticket.types.push(type)
                    typeIndex++
                }

                data.tickets.push(ticket)
                ticketIndex++
            }
        }

        // Handle performer images
        const performerImages = req.files?.filter(f => f.fieldname.startsWith('performers[')) || []
        if (parsedBody['performers[0].name']) {
            let performerIndex = 0
            while (parsedBody[`performers[${performerIndex}].name`]) {
                const matched = performerImages.find(f => f.fieldname === `performers[${performerIndex}].image`)
                const processed = matched ? await processImages([matched], process.env.BASE_URL) : []

                data.performers.push({
                    name: parsedBody[`performers[${performerIndex}].name`],
                    role: parsedBody[`performers[${performerIndex}].role`] || '',
                    image: processed[0]?.url || ''
                })
                performerIndex++
            }
        }

        // Handle sponsor logos
        const sponsorLogos = req.files?.filter(f => f.fieldname.startsWith('sponsors[')) || []
        if (parsedBody['sponsors[0].name']) {
            let sponsorIndex = 0
            while (parsedBody[`sponsors[${sponsorIndex}].name`]) {
                const matched = sponsorLogos.find(f => f.fieldname === `sponsors[${sponsorIndex}].logo`)
                const processed = matched ? await processImages([matched], process.env.BASE_URL) : []

                data.sponsors.push({
                    name: parsedBody[`sponsors[${sponsorIndex}].name`],
                    logo: processed[0]?.url || '',
                    website: parsedBody[`sponsors[${sponsorIndex}].website`] || ''
                })
                sponsorIndex++
            }
        }

        // Parse amenities
        if (parsedBody['amenities[0].name']) {
            let amenityIndex = 0
            while (parsedBody[`amenities[${amenityIndex}].name`]) {
                data.amenities.push({
                    name: parsedBody[`amenities[${amenityIndex}].name`],
                    icon: parsedBody[`amenities[${amenityIndex}].icon`] || ''
                })
                amenityIndex++
            }
        }

        // Validate & transform
        const eventData = eventCreateDto(data, req.user.id)

        // Create Event
        const event = await eventService.createEvent(eventData)

        // Create Tickets
        if (eventData.tickets?.length) {
            await eventService.createTicketsForEvent(event._id, eventData.tickets)
        }

        // Get populated result
        const populatedEvent = await eventService.getEventById(event._id)
        res.status(201).json(eventResponseDto(populatedEvent))
    } catch (err) {
        next(err)
    }
}
    ;
export const getEvent = async (req, res, next) => {
    try {
        const event = await eventService.getEventById(req.params.id)
        if (!event) return res.status(404).json({ message: 'Event not found' })
        res.json(eventResponseDto(event))
    } catch (err) {
        next(err)
    }
}

export const listEvents = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, location, date } = req.query
        const filters = {}
        if (location) filters.location = location
        if (date) filters.date = date

        const events = await eventService.listEvents(filters, {
            page: parseInt(page),
            limit: parseInt(limit),
        })

        events.data = events.data.map(eventResponseDto)
        res.json(events)
    } catch (err) {
        next(err)
    }
}

export const updateEvent = async (req, res, next) => {
    try {
        const updates = eventUpdateDto(req.body)

        let deleteImgs = req.body.deleteImages || []
        if (typeof deleteImgs === 'string') deleteImgs = [deleteImgs]

        if (deleteImgs.length) {
            await eventService.removeImages(req.params.id, deleteImgs)
            await deleteImages(deleteImgs, process.env.BASE_URL)
        }

        if (req.files?.length) {
            const newImages = await processImages(req.files, process.env.BASE_URL)
            if (!updates.images) updates.images = []
            updates.images.push(...newImages)
        }

        const updatedEvent = await eventService.updateEvent(req.params.id, updates)
        res.json(eventResponseDto(updatedEvent))
    } catch (err) {
        next(err)
    }
}

export const deleteEvent = async (req, res, next) => {
    try {
        const event = await eventService.getEventById(req.params.id)
        if (!event) return res.status(404).json({ message: 'Event not found' })

        if (event.images?.length) {
            const urls = event.images.map(i => i.url)
            await deleteImages(urls, process.env.BASE_URL)
        }

        await eventService.deleteEvent(req.params.id)
        res.json({ message: 'Event deleted' })
    } catch (err) {
        next(err)
    }
}
