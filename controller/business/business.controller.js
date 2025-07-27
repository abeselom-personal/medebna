// controllers/business.controller.js
import * as businessService from '../../services/business.service.js'
import { businessResponseDTO } from '../../dtos/business.dto.js'
import { processImages, deleteImages } from '../../services/imageUpload.service.js'

export const createBusiness = async (req, res, next) => {
    try {
        const ownerId = req.user.id
        const { type } = req.body
        const business = await businessService.createBusiness(ownerId, type)
        res.status(201).json(businessResponseDTO(business))
    } catch (error) {
        next(error)
    }
}

export const getMyBusinesses = async (req, res, next) => {
    try {
        const ownerId = req.user.id
        const businesses = await businessService.getBusinessesByOwner(ownerId)
        res.json(businesses.map(businessResponseDTO))
    } catch (error) {
        next(error)
    }
}

export const getBusinessById = async (req, res, next) => {
    try {
        const business = await businessService.getBusinessById(req.params.id)
        res.json(businessResponseDTO(business))
    } catch (error) {
        next(error)
    }
}

export const deleteBusiness = async (req, res, next) => {
    try {
        const ownerId = req.user.id
        const business = await businessService.deleteBusiness(req.params.id, ownerId)
        if (business.images?.length) {
            const urls = business.images.map(i => i.url)
            await deleteImages(urls, process.env.BASE_URL)
        }
        if (business.legal?.additionalDocs?.length) {
            await deleteImages(business.legal.additionalDocs, process.env.BASE_URL)
        }
        res.json({ message: 'Business deleted', business: businessResponseDTO(business) })
    } catch (error) {
        next(error)
    }
}

export const updateStep = async (req, res, next) => {

    try {
        const step = req.params.step;
        const businessId = req.params.id;
        const data = req.body;
        const ownerId = req.user.id;
        let processed = [];

        // Extract images to delete (case-insensitive check)
        const toDelete = [].concat(req.body.toDelete || req.body.ToDelete || []);
        // Process new images first
        const images = req.files?.images || [];
        const docs = req.files?.additionalDocs || [];

        if (step === 'images' && images.length) {
            processed = await processImages(images, process.env.BASE_URL);
            data.images = processed;
        }

        // if (step === 'rooms') {
        //     if (typeof data.rooms === 'string') {
        //         data.rooms = JSON.parse(data.rooms);
        //     }
        //
        //     if (images.length) {
        //         processed = await processImages(images, process.env.BASE_URL);
        //     }
        //
        //     if (Array.isArray(data.rooms)) {
        //         data.rooms = data.rooms.map(room => ({
        //             ...room,
        //             images: processed
        //         }));
        //     }
        // }

        if (step === 'legal' && docs.length) {
            const uploadedDocs = docs.map(f => `${process.env.BASE_URL}/${f.path}`);
            data.additionalDocs = Array.isArray(data.additionalDocs)
                ? [...data.additionalDocs, ...uploadedDocs]
                : uploadedDocs;
        }

        // Handle deletions after processing new files
        if (toDelete.length > 0) {
            await deleteImages(
                toDelete,
                process.env.BASE_URL,
                ownerId,
                step,
                businessId
            );
        }

        // Update step with both new data and deletions
        const result = await businessService.updateStep(
            businessId,
            step,
            data,
            toDelete
        );

        res.json({
            business: businessResponseDTO(result.business),
            ...(result.rooms && { rooms: result.rooms })
        });
    } catch (error) {
        next(error);
    }
};

export const publishBusiness = async (req, res, next) => {
    try {
        const businessId = req.params.id
        const business = await businessService.publishBusiness(businessId)
        res.json(businessResponseDTO(business))
    } catch (error) {
        next(error)
    }
}

export const getStepsStatus = async (req, res, next) => {
    try {
        const businessId = req.params.id
        const stepsCompleted = await businessService.getStepsStatus(businessId)
        res.json(stepsCompleted)
    } catch (error) {
        next(error)
    }
}

export const getEvents = async (req, res, next) => {
    try {
        const businessId = req.params.id
        const events = await businessService.getEvents(businessId)
        res.json(events)
    } catch (error) {
        next(error)
    }
}

export const getRooms = async (req, res, next) => {
    try {
        const businessId = req.params.id
        const rooms = await businessService.getRooms(businessId)
        res.json(rooms)
    } catch (error) {
        next(error)
    }
}
