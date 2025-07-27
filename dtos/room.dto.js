// dto/room.dto.js
export const roomCreateDto = (body, userId) => {
    const { title, description, images, price, location, availability, businessId, maxCapacity } = body;
    return { title, description, images, price, location, availability, createdBy: userId, businessId, maxCapacity };
};

export const roomUpdateDto = (body) => {
    const allowed = {};
    ['title', 'description', 'images', 'price', 'location', 'availability', 'maxCapacity'].forEach(f => {
        if (body[f] !== undefined) allowed[f] = body[f];
    });
    return allowed;
};

export const roomResponseDto = (room) => ({
    id: room._id?.toString(),
    title: room.title || '',
    description: room.description || '',
    images: Array.isArray(room.images) ? room.images.map(img => ({
        url: img.url || '',
        blurhash: img.blurhash || ''
    })) : [],
    price: Array.isArray(room.price) ? room.price.map(p => ({
        currency: p.currency || '',
        amount: p.amount || 0
    })) : [],
    location: room.location || '',
    availability: {
        from: room.availability?.from || null,
        to: room.availability?.to || null
    },
    createdBy: room.createdBy?.toString?.() || '',
    businessId: room.businessId?.toString?.() || '',
    maxCapacity: room.maxCapacity || null,
    currentCapacity: room.currentCapacity || 0,
    createdAt: room.createdAt || null,
    updatedAt: room.updatedAt || null,
    favoritesCount: room.favoritesCount || 0,
    business: room.business || null,
    isFavorite: !!room.isFavorite
})
