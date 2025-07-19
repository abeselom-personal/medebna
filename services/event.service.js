// services/event.service.js
import mongoose from 'mongoose'
import Event from '../model/event/event.model.js'
import * as imageService from './imageUpload.service.js'

export const createEvent = async (data) => {
    const event = new Event(data)
    return event.save()
}

export const getEventsByUser = (userId) => {
    return Event.find({ createdBy: userId }).sort({ date: 1 })
}

export const getEventById = async (id) => {
    const event = await Event.findById(id)
    if (!event) throw new Error('Event not found')
    return event
}

export const updateEvent = async (id, updates, deleteImgs = [], newFiles = [], userId, baseUrl) => {
    const session = await mongoose.startSession()
    let result

    await session.withTransaction(async () => {
        const event = await Event.findOne({ _id: id, createdBy: userId }).session(session)
        if (!event) throw new Error('Event not found or unauthorized')

        if (deleteImgs.length) {
            for (const img of deleteImgs) {
                if (!event.images.some(ei => ei.url === img)) {
                    throw new Error(`Cannot delete image not owned by event: ${img}`)
                }
            }
            event.images = event.images.filter(img => !deleteImgs.includes(img.url))
        }

        if (newFiles.length) {
            const newImgs = await imageService.processImages(newFiles, baseUrl)
            event.images.push(...newImgs)
        }

        Object.assign(event, updates)
        result = await event.save({ session })
    })

    session.endSession()

    if (deleteImgs.length) await imageService.deleteImages(deleteImgs, baseUrl)
    return result
}

export const deleteEvent = async (id, userId) => {
    const e = await Event.findOneAndDelete({ _id: id, createdBy: userId })
    if (!e) throw new Error('Not found or unauthorized')
    if (e.images?.length) {
        const urls = e.images.map(i => i.url)
        await imageService.deleteImages(urls, process.env.BASE_URL)
    }
}
