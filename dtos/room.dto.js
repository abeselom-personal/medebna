// dto/room.dto.js

export const roomCreateDto = (body, userId) => {
    const {
        title, description, images, price, location, availability,
        businessId, maxCapacity, numberOfAdults, numberOfChildren,
        floorLevel, discounts
    } = body;

    return {
        title,
        description,
        images,
        price,
        location,
        availability,
        createdBy: userId,
        businessId,
        maxCapacity,
        numberOfAdults,
        numberOfChildren,
        discounts,
        floorLevel
    };
};

export const roomUpdateDto = (body) => {
    const allowed = {};
    [
        'title', 'description', 'images', 'price', 'location',
        'availability', 'maxCapacity', 'currentCapacity',
        'numberOfAdults', 'numberOfChildren', 'floorLevel', 'discounts'
    ].forEach(f => {
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
    numberOfAdults: room.numberOfAdults || 0,
    numberOfChildren: room.numberOfChildren || 0,
    floorLevel: room.floorLevel || [],
    createdAt: room.createdAt || null,
    updatedAt: room.updatedAt || null,
    discounts: room.discounts || [],
    favoritesCount: room.favoritesCount || 0,
    business: room.business || null,
    isFavorite: !!room.isFavorite
});
