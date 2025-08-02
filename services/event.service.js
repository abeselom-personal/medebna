import mongoose from 'mongoose'
import Event from '../model/event/event.model.js'

export const createEvent = async (payload) => {
    return await Event.create(payload)
}

export const getEventById = async (id) => {
    const [event] = await Event.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },
        {
            $lookup: {
                from: 'businesses',
                localField: 'businessId',
                foreignField: '_id',
                as: 'business'
            }
        },
        { $unwind: { path: "$business", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy'
            }
        },
        { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
    ])
    return event
}

export const listEvents = async (filters = {}, { page = 1, limit = 10 } = {}) => {
    const match = {}
    if (filters.location) match.location = { $regex: filters.location, $options: 'i' }
    if (filters.date) match.date = { $gte: new Date(filters.date) }

    const events = await Event.aggregate([
        { $match: match },
        { $sort: { date: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
            $lookup: {
                from: 'businesses',
                localField: 'businessId',
                foreignField: '_id',
                as: 'business'
            }
        },
        { $unwind: { path: "$business", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy'
            }
        },
        { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
    ])

    const total = await Event.countDocuments(match)

    return {
        data: events,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
        },
    }
}

export const updateEvent = async (id, payload) => {
    return await Event.findByIdAndUpdate(id, payload, { new: true })
}

export const deleteEvent = async (id) => {
    return await Event.findByIdAndDelete(id)
}

export const createTicketsForEvent = async (eventId, tickets) => {
    return await Event.findByIdAndUpdate(
        eventId,
        { $push: { tickets: { $each: tickets } } },
        { new: true }
    )
}

export const addTicketType = async (eventId, ticketType) => {
    return await Event.findByIdAndUpdate(
        eventId,
        { $push: { tickets: ticketType } },
        { new: true }
    )
}

export const updateTicketType = async (eventId, ticketId, update) => {
    return await Event.findOneAndUpdate(
        { _id: eventId, 'tickets._id': ticketId },
        { $set: { 'tickets.$': { _id: ticketId, ...update } } },
        { new: true }
    )
}

export const deleteTicketType = async (eventId, ticketId) => {
    return await Event.findByIdAndUpdate(
        eventId,
        { $pull: { tickets: { _id: ticketId } } },
        { new: true }
    )
}

export const removeImages = async (eventId, imageUrls) => {
    return await Event.findByIdAndUpdate(
        eventId,
        { $pull: { images: { url: { $in: imageUrls } } } },
        { new: true }
    )
}

export const getEventTickets = async (eventId) => {
    const event = await Event.findById(eventId).select('tickets')
    return event?.tickets || []
}

export const updateEventTickets = async (eventId, tickets) => {
    return await Event.findByIdAndUpdate(
        eventId,
        { $set: { tickets } },
        { new: true }
    )
}
