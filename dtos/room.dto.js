// dto/room.dto.js

export const roomCreateDto = (body, userId) => {
    const {
        title, description, images, price, availability,
        businessId, maxCapacity, numberOfAdults, numberOfChildren,
        discounts
    } = body;

    return {
        title,
        description,
        images,
        price,
        availability,
        createdBy: userId,
        businessId,
        maxCapacity,
        numberOfAdults,
        numberOfChildren,
        discounts,
    };
};

export const roomUpdateDto = (body) => {
    const allowed = {};
    [
        'title', 'description', 'images', 'price',
        'availability', 'businessId', 'maxCapacity', 'currentCapacity',
        'numberOfAdults', 'numberOfChildren', 'discounts'
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
    createdAt: room.createdAt || null,
    updatedAt: room.updatedAt || null,
    discounts: room.discounts || [],
    favoritesCount: room.favoritesCount || 0,
    business: room.business || null,
    isFavorite: !!room.isFavorite
});
