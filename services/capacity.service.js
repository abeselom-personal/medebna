import Room from '../model/room/room.model.js'
import Event from '../model/event/event.model.js'

export const updateRoomCapacity = async (roomId, change) => {
    const room = await Room.findById(roomId)
    if (!room) throw new Error('Room not found')

    room.currentCapacity += change
    if (room.currentCapacity < 0 || room.currentCapacity > room.maxCapacity) {
        throw new Error('Invalid capacity change')
    }

    return room.save()
}

export const updateTicketAvailability = async (eventId, ticketId, change) => {
    const event = await Event.findById(eventId)
    if (!event) throw new Error('Event not found')

    const ticket = event.tickets.id(ticketId)
    if (!ticket) throw new Error('Ticket not found')

    ticket.available += change
    if (ticket.available < 0 || ticket.available > ticket.totalCapacity) {
        throw new Error('Invalid availability change')
    }

    return event.save()
}
