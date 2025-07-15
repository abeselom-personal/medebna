
export const RoomDTO = (room) => ({
    id: room._id,
    title: room.title,
    description: room.description,
    images: room.images,
    price: room.price,
    location: room.location,
    availability: room.availability,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
})

export const EventDTO = (event) => ({
    id: event._id,
    name: event.name,
    description: event.description,
    images: event.images,
    price: event.price,
    location: event.location,
    date: event.date,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
})

export const PaginatedDTO = (items, page, limit, total) => ({
    data: items,
    meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
    },
})
