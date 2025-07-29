// dto/business.dto.js
export const businessResponseDTO = (business) => ({
    id: business._id,
    name: business.name,
    address: business.address,
    logo: business.logo,
    rating: business.rating,
    type: business.type,
    contact: business.contact,
    amenities: business.amenities,
    images: business.images,
    legal: business.legal,
    paymentSettings: business.paymentSettings,
    published: business.published,
    stepsCompleted: business.stepsCompleted,
    progress: business.progress || 0,
    createdAt: business.createdAt,
    updatedAt: business.updatedAt
})
