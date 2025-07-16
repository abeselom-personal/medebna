// services/business.service.js
import Business from '../models/Business.js'
import { calculateProgress } from '../utils/progress.js'

export const createBusiness = async (ownerId) => {
    const business = new Business({ ownerId })
    await business.save()
    return business
}

export const getBusinessesByOwner = async (ownerId) => {
    return Business.find({ ownerId, published: false })
}

export const getBusinessById = async (id) => {
    const business = await Business.findById(id)
    if (!business) throw new Error('Business not found')

    business.progress = calculateProgress(business.stepsCompleted)
    return business
}

export const deleteBusiness = async (id, ownerId) => {
    // soft delete example: update flag or remove, adjust as needed
    const business = await Business.findOneAndDelete({ _id: id, ownerId })
    if (!business) throw new Error('Business not found or unauthorized')
    return business
}

export const updateStep = async (businessId, step, data) => {
    const business = await Business.findById(businessId)
    if (!business) throw new Error('Business not found')

    // Update data keys based on step
    switch (step) {
        case 'basic':
            business.name = data.name || business.name
            business.address = data.address || business.address
            business.type = data.type || business.type
            break
        case 'contacts':
            business.contact = data.contact || business.contact
            break
        case 'amenities':
            business.amenities = data.amenities || business.amenities
            break
        case 'photos':
            business.photos = data.photos || business.photos
            break
        case 'legal':
            business.legal = data || business.legal
            break
        case 'paymentSettings':
            business.paymentSettings = data || business.paymentSettings
            break
        case 'rooms':
            // rooms handled separately likely
            break
        default:
            throw new Error('Invalid step')
    }

    business.stepsCompleted[step] = true
    await business.save()
    return business
}

export const publishBusiness = async (businessId) => {
    const business = await Business.findById(businessId)
    if (!business) throw new Error('Business not found')

    const allStepsDone = Object.values(business.stepsCompleted).every(v => v === true)
    if (!allStepsDone) throw new Error('Complete all steps before publishing')

    business.published = true
    await business.save()
    return business
}

export const getStepsStatus = async (businessId) => {
    const business = await Business.findById(businessId)
    if (!business) throw new Error('Business not found')

    return business.stepsCompleted
}
