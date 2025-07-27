import Event from '../model/event/event.model.js'

export const createEvent = async (payload) => {
    return await Event.create(payload)
}


export const getEventById = async (id) => {
    return await Event.findById(id)
        .populate('businessId createdBy')
}

export const listEvents = async (filters = {}, { page = 1, limit = 10 } = {}) => {
    const query = {}
    if (filters.location) query.location = { $regex: filters.location, $options: 'i' }
    if (filters.date) query.date = { $gte: new Date(filters.date) }

    const events = await Event.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ date: -1 })
        .populate('businessId createdBy')

    const total = await Event.countDocuments(query)

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

// Ticket-related functions
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

// Image-related functions
export const removeImages = async (eventId, imageUrls) => {
    return await Event.findByIdAndUpdate(
        eventId,
        { $pull: { images: { url: { $in: imageUrls } } } },
        { new: true }
    )
}

// Additional utility functions
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
