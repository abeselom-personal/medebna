import * as eventService from '../../services/event.service.js'
import {
    eventCreateDto,
    eventUpdateDto,
    eventResponseDto
} from '../../dtos/event.dto.js'
import { processImages, deleteImages } from '../../services/imageUpload.service.js';

export const createEvent = async (req, res, next) => {
    try {
        const data = eventCreateDto(req.body, req.user.id);
        if (req.files && req.files.length > 0) {
            data.images = await processImages(req.files, process.env.BASE_URL);
        }
        const event = await eventService.createEvent(data);
        res.status(200).json(eventResponseDto(event));
    } catch (err) {
        next(err);
    }
};

export const listEvents = async (req, res, next) => {
    try {
        const events = await eventService.getEventsByUser(req.user.id)
        res.json(events.map(eventResponseDto))
    } catch (err) {
        next(err)
    }
}

export const getEvent = async (req, res, next) => {
    try {
        const event = await eventService.getEventById(req.params.id)
        res.json(eventResponseDto(event))
    } catch (err) {
        next(err)
    }
}


export const updateEvent = async (req, res, next) => {
    try {
        const form = req.body
        const updates = eventUpdateDto(form)

        // Normalize deleteImages into an array
        let deleteImgs = form.deleteImages || []
        if (typeof deleteImgs === 'string') {
            // single field → make it an array
            deleteImgs = [deleteImgs]
        }

        const newFiles = req.files || []

        const ev = await eventService.updateEvent(
            req.params.id,
            updates,
            deleteImgs,
            newFiles,
            req.user.id,
            process.env.BASE_URL
        )
        res.json(eventResponseDto(ev))
    } catch (err) {
        next(err)
    }
}

export const deleteEvent = async (req, res, next) => {
    try {
        await eventService.deleteEvent(req.params.id, req.user.id)
        res.json({ message: 'Event deleted' })
    } catch (err) {
        next(err)
    }
}
