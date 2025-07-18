// dto/room.dto.js
export const roomCreateDto = (body, userId) => {
    const { title, description, images, price, location, availability, businessId } = body;
    return { title, description, images, price, location, availability, createdBy: userId, businessId };
};

export const roomUpdateDto = (body) => {
    const allowed = {};
    ['title', 'description', 'images', 'price', 'location', 'availability'].forEach(f => {
        if (body[f] !== undefined) allowed[f] = body[f];
    });
    return allowed;
};

export const roomResponseDto = (room) => ({
    id: room._id,
    title: room.title,
    description: room.description,
    images: room.images,
    price: room.price,
    location: room.location,
    availability: room.availability,
    createdBy: room.createdBy,
    businessId: room.businessId,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt
});
