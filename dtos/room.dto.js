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
    createdAt: room.createdAt || null,
    updatedAt: room.updatedAt || null,
    favoritesCount: room.favoritesCount || 0,
    isFavorite: !!room.isFavorite
})
