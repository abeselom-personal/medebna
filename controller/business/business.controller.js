// controllers/business.controller.js
import * as businessService from '../../services/business.service.js'
import { businessResponseDTO } from '../../dtos/business.dto.js'

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
        const step = req.params.step
        const businessId = req.params.id
        const data = req.body
        const business = await businessService.updateStep(businessId, step, data)
        res.json(businessResponseDTO(business))
    } catch (error) {
        next(error)
    }
}

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
