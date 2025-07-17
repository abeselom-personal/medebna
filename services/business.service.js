// services/business.service.js
import Business from '../model/business/business.model.js'
import * as roomService from './room.service.js'
import { calculateProgress } from '../utils/progress.util.js'

export const createBusiness = async (ownerId, type) => {
    if (!type) throw new Error('Business type is required')
    const business = new Business({ ownerId, type })
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
            business.stepsCompleted[step] = true
            break
        case 'contacts':
            business.contact = data.contact || business.contact
            business.stepsCompleted[step] = true
            break
        case 'amenities':
            business.amenities = data.amenities || business.amenities
            business.stepsCompleted[step] = true
            break
        case 'images':
            business.images = data.images || business.images
            business.stepsCompleted[step] = true
            break
        case 'legal':
            business.legal = data || business.legal
            business.stepsCompleted[step] = true
            break

        case 'paymentSettings':
            business.paymentSettings = data || business.paymentSettings
            business.stepsCompleted[step] = true
            break
        case 'rooms':
            if (!data?.rooms?.length) break
            const roomsWithBusiness = data.rooms.map(room => ({
                ...room,
                businessId: business._id
            }))
            await roomService.createMultipleRooms(roomsWithBusiness)
            business.stepsCompleted[step] = true
            break
        default:
            throw new Error('Invalid step')
    }

    await business.save()
    return business
}

export const publishBusiness = async (businessId) => {
    const business = await Business.findById(businessId)
    if (!business) throw new Error('Business not found')

    const { _id, ...steps } = business.stepsCompleted.toObject()
    const allStepsDone = Object.values(steps).every(v => v === true)
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
