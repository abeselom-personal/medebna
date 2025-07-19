// dto/event.dto.js
export const eventCreateDto = (body, userId) => {
    const {
        name, description, location,
        date, startTime, endTime,
        price, images, businessId
    } = body

    return { name, description, location, date, startTime, endTime, price, images, businessId, createdBy: userId }
}

export const eventUpdateDto = (body) => {
    const allowedFields = ['name', 'description', 'location', 'date', 'startTime', 'endTime', 'price', 'images', 'deleteImages'];
    const updates = {};
    for (const key of allowedFields) {
        if (body[key] !== undefined) updates[key] = body[key];
    }
    return updates;
};

export const eventResponseDto = (e) => ({
    id: e._id,
    name: e.name,
    description: e.description,
    location: e.location,
    date: e.date,
    startTime: e.startTime,
    endTime: e.endTime,
    price: e.price,
    images: e.images,
    businessId: e.businessId,
    createdBy: e.createdBy,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt
})
