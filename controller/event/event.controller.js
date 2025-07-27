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
        // Parse the form data properly
        const parsedBody = Array.isArray(req.body) ? req.body[0] : req.body;

        // Reconstruct the nested objects properly
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
        };
        console.log(data)
        // Process tickets
        if (parsedBody['tickets[0].title']) {
            let ticketIndex = 0;
            while (parsedBody[`tickets[${ticketIndex}].title`]) {
                const ticket = {
                    title: parsedBody[`tickets[${ticketIndex}].title`],
                    types: []
                };

                let typeIndex = 0;
                while (parsedBody[`tickets[${ticketIndex}].types[${typeIndex}].name`]) {
                    const type = {
                        name: parsedBody[`tickets[${ticketIndex}].types[${typeIndex}].name`],
                        price: parseFloat(parsedBody[`tickets[${ticketIndex}].types[${typeIndex}].price`]),
                        benefits: parsedBody[`tickets[${ticketIndex}].types[${typeIndex}].benefits`] || '',
                        amenities: []
                    };

                    let amenityIndex = 0;
                    while (parsedBody[`tickets[${ticketIndex}].types[${typeIndex}].amenities[${amenityIndex}]`]) {
                        type.amenities.push(parsedBody[`tickets[${ticketIndex}].types[${typeIndex}].amenities[${amenityIndex}]`]);
                        amenityIndex++;
                    }

                    ticket.types.push(type);
                    typeIndex++;
                }

                data.tickets.push(ticket);
                ticketIndex++;
            }
        }

        // Add this before processing performers/sponsors
        const performerImages = req.files?.filter(f => f.fieldname.startsWith('performers['));
        const sponsorLogos = req.files?.filter(f => f.fieldname.startsWith('sponsors['));

        // Process performers
        if (parsedBody['performers[0].name']) {
            let performerIndex = 0;
            while (parsedBody[`performers[${performerIndex}].name`]) {
                const matched = performerImages.find(f => f.fieldname === `performers[${performerIndex}].image`);
                const processed = matched ? await processImages([matched], process.env.BASE_URL) : [];

                data.performers.push({
                    name: parsedBody[`performers[${performerIndex}].name`],
                    role: parsedBody[`performers[${performerIndex}].role`] || '',
                    image: processed[0]?.url || ''
                });
                performerIndex++;
            }
        }

        // Process sponsors
        if (parsedBody['sponsors[0].name']) {
            let sponsorIndex = 0;
            while (parsedBody[`sponsors[${sponsorIndex}].name`]) {
                const matched = sponsorLogos.find(f => f.fieldname === `sponsors[${sponsorIndex}].logo`);
                const processed = matched ? await processImages([matched], process.env.BASE_URL) : [];

                data.sponsors.push({
                    name: parsedBody[`sponsors[${sponsorIndex}].name`],
                    logo: processed[0]?.url || '',
                    website: parsedBody[`sponsors[${sponsorIndex}].website`] || ''
                });
                sponsorIndex++;
            }
        }

        // Process amenities
        if (parsedBody['amenities[0].name']) {
            let amenityIndex = 0;
            while (parsedBody[`amenities[${amenityIndex}].name`]) {
                data.amenities.push({
                    name: parsedBody[`amenities[${amenityIndex}].name`],
                    icon: parsedBody[`amenities[${amenityIndex}].icon`] || ''
                });
                amenityIndex++;
            }
        }

        // Validate and transform the data using DTO
        const eventData = eventCreateDto(data, req.user.id);

        if (req.files?.length) {
            eventData.images = await processImages(req.files, process.env.BASE_URL);
        }
        // Create event
        const event = await eventService.createEvent(eventData);

        // If tickets included, create tickets separately and attach
        if (eventData.tickets && eventData.tickets.length > 0) {
            await eventService.createTicketsForEvent(event._id, eventData.tickets);
        }

        // Populate tickets before response
        const populatedEvent = await eventService.getEventById(event._id);

        res.status(201).json(eventResponseDto(populatedEvent));
    } catch (err) {
        next(err);
    }
};
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
