// controllers/business.controller.js
import * as businessService from '../../services/business.service.js'
import { businessResponseDTO } from '../../dtos/business.dto.js'
import { getBlurhash } from '../../utils/blurHash.js'

import config from '../../config/config.js'

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
        res.json({ message: 'Business deleted', business: businessResponseDTO(business) })
    } catch (error) {
        next(error)
    }
}

export const updateStep = async (req, res, next) => {
    try {
        let processed = [];
        if (req.files && req.files.length > 0) {
            processed = await Promise.all(
                req.files.map(async file => {
                    const hash = await getBlurhash(file.path);
                    return {
                        url: `${process.env.BASE_URL}/${file.path}`,
                        blurhash: hash
                    };
                })
            );
        }

        const step = req.params.step;
        const businessId = req.params.id;
        const data = req.body;
        console.log(data)
        if (step === 'rooms') {
            if (typeof data.rooms === 'string') data.rooms = JSON.parse(data.rooms);
            if (Array.isArray(data.rooms)) {
                data.rooms = data.rooms.map(room => ({
                    ...room,
                    images: processed
                }));
            }
        }

        if (step === 'images') {
            data.images = processed;
        }

        const result = await businessService.updateStep(businessId, step, data)
        res.json({
            business: businessResponseDTO(result.business),
            ...(result.rooms && { rooms: result.rooms })
        })
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
