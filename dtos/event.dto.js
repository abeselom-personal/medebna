// dtos/event.dto.js
import Joi from 'joi'
import mongoose from 'mongoose'

const objectIdValidator = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid')
    }
    return value
}

export const eventCreateDto = (data, userId) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().allow(''),
        location: Joi.string().required(),
        date: Joi.date().required(),
        startTime: Joi.date().required(),
        endTime: Joi.date().required(),
        businessId: Joi.string().custom(objectIdValidator).required(),
        tickets: Joi.array().items(
            Joi.object({
                title: Joi.string().required(),
                types: Joi.array().items(
                    Joi.object({
                        name: Joi.string().required(),
                        price: Joi.number().required(),
                        benefits: Joi.string().allow(''),
                        amenities: Joi.array().items(Joi.string()).default([])
                    })
                ).required()
            })
        ).default([]),
        performers: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                role: Joi.string().allow(''),
                image: Joi.string().uri().allow('')
            })
        ).default([]),
        sponsors: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                logo: Joi.string().uri().allow(''),
                website: Joi.string().uri().allow('')
            })
        ).default([]),
        amenities: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                icon: Joi.string().allow('')
            })
        ).default([]),
    })

    const validated = schema.validate(data, { abortEarly: false })
    if (validated.error) throw validated.error

    // Set available if missing for each ticket
    if (validated.value.tickets) {
        validated.value.tickets = validated.value.tickets.map(t => ({
            ...t,
            available: t.available !== undefined ? t.available : t.totalCapacity
        }))
    }

    return { ...validated.value, createdBy: userId }
}

export const eventUpdateDto = (data) => {
    const schema = Joi.object({
        name: Joi.string(),
        description: Joi.string().allow(''),
        location: Joi.string(),
        date: Joi.date(),
        startTime: Joi.date(),
        endTime: Joi.date(),
        tickets: Joi.array().items(
            Joi.object({
                totalCapacity: Joi.number().integer().min(1),
                available: Joi.number().integer().min(0),
                types: Joi.array().items(
                    Joi.object({
                        name: Joi.string().required(),
                        price: Joi.number().required(),
                        benefits: Joi.string().allow(''),
                        amenities: Joi.array().items(Joi.string()).default([])
                    })
                ).optional()
            })
        ),
        performers: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                role: Joi.string().allow(''),
                image: Joi.string().uri().allow('')
            })
        ),
        sponsors: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                logo: Joi.string().uri().allow(''),
                website: Joi.string().uri().allow('')
            })
        ),
        amenities: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                icon: Joi.string().allow('')
            })
        ),
        deleteImages: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
    }).unknown(true)

    const validated = schema.validate(data, { abortEarly: false })
    if (validated.error) throw validated.error
    return validated.value
}

export const eventResponseDto = (event) => {
    if (!event) return null
    return {
        id: event._id,
        name: event.name,
        description: event.description,
        location: event.location,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        images: event.images || [],
        businessId: event.businessId,
        createdBy: event.createdBy,
        tickets: event.tickets || [],
        performers: event.performers || [],
        sponsors: event.sponsors || [],
        amenities: event.amenities || [],
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
    }
}
