// services/business.service.js
import Business from '../model/business/business.model.js'
import Events from '../model/event/event.model.js'
import Rooms from '../model/room/room.model.js'
import * as paymentService from './payment.service.js'
import { calculateProgress } from '../utils/progress.util.js'

export const createBusiness = async (ownerId, type) => {
    if (!type) throw new Error('Business type is required')
    const business = new Business({ ownerId, type })
    await business.save()
    return business
}

export const getBusinessesByOwner = async (ownerId) => {
    return Business.find({ ownerId })
}

export const getBusinessById = async (id) => {
    const business = await Business.findById(id)
    if (!business) throw new Error('Business not found')

    business.progress = calculateProgress(business.stepsCompleted)
    return business
}

export const deleteBusiness = async (id, ownerId) => {
    const business = await Business.findOneAndDelete({ _id: id, ownerId })
    if (!business) throw new Error('Business not found or unauthorized')
    return business
}

export const updateStep = async (businessId, step, data, toDelete = []) => {
    const business = await Business.findById(businessId)
    if (!business) throw new Error('Business not found')

    let rooms = []
    if (toDelete.length > 0) {
        if (step === 'legal') {
            business.legal.additionalDocs = business.legal.additionalDocs?.filter(
                doc => !toDelete.includes(doc)
            ) || [];
        }
        else if (step === 'rooms') {
            await Rooms.updateMany(
                { businessId, 'images.url': { $in: toDelete } },
                { $pull: { images: { url: { $in: toDelete } } } }
            );
        }
        else {
            business.images = business.images.filter(
                img => !toDelete.includes(img.url)
            );
        }
    }

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

        case 'images':
            business.images = data.images || business.images
            break

        case 'legal':
            business.legal = {
                licenseNumber: data.licenseNumber || business.legal?.licenseNumber,
                taxInfo: data.taxInfo || business.legal?.taxInfo,
                additionalDocs: data.additionalDocs || business.legal?.additionalDocs || [],
            }
            break

        case 'paymentSettings':
            const chapaSubaccountId = await paymentService.createSubaccount({
                business_name: business.name,
                account_name: data.subAccount.account_name,
                bank_code: data.subAccount.bank_code,
                account_number: data.subAccount.account_number,
                split_value: 0.10,
                split_type: "percentage"
            });
            if (chapaSubaccountId == null) {
                break
            }
            business.paymentSettings = {
                currencies: data.currencies || business.paymentSettings?.currencies || [],
                details: data.details || business.paymentSettings?.details || {},
                subAccount: {
                    id: chapaSubaccountId,
                    business_name: business.name,
                    account_name: data.subAccount.account_name,
                    bank_code: data.subAccount.bank_code,
                    account_number: data.subAccount.account_number,
                    split_value: data.subAccount.split_value,
                    split_type: data.subAccount.split_type
                }
            };
            break;
        default:
            throw new Error('Invalid step')
    }

    business.stepsCompleted[step] = true
    await business.save()
    return { business }

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

export const getEvents = async (businessId) => {
    const events = await Events.find({ businessId: businessId })
    if (!events) throw new Error('Business not found')

    return events
}

export const getRooms = async (businessId) => {
    const rooms = await Rooms.find({ businessId: businessId })
    if (!rooms) throw new Error('Business not found')

    return rooms
}
