// validators/validation.js
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { body, param, query, validationResult } from 'express-validator'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

export const validateBody = (schema) => {
    const validate = ajv.compile(schema)
    return (req, res, next) => {
        const valid = validate(req.body)
        if (!valid) return res.status(400).json({ errors: validate.errors.map(e => e.message) })
        next()
    }
}

export const validateResponse = (schema) => {
    const validate = ajv.compile(schema)
    return (_, res, next) => {
        const _json = res.json
        res.json = (data) => {
            const valid = validate(data)
            if (!valid) console.warn('❌ Invalid response:', validate.errors)
            return _json.call(res, data)
        }
        next()
    }
}

export const validateIdParam = [
    param('id').isMongoId().withMessage('Invalid ID'),
    (req, res, next) => {
        const errs = validationResult(req)
        if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() })
        next()
    }
]

export const validateSearchQuery = [
    query('where').exists().withMessage('"where" is required'),
    query('when')
        .if((_, __) => !_.query.dateFrom && !_.query.dateTo)
        .exists().withMessage('Provide "when" or both "dateFrom" and "dateTo"'),
    query('dateFrom').optional().isISO8601(),
    query('dateTo').optional().isISO8601(),
    query('priceMin').optional().isNumeric().withMessage('"priceMin" must be number'),
    query('priceMax').optional().isNumeric().withMessage('"priceMax" must be number'),
    query('source').optional().isIn(['rooms', 'events']).withMessage('"source" must be rooms or events'),
    (req, res, next) => {
        const errs = validationResult(req)
        if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() })
        next()
    }
]

export const validateInit = [
    body('email').isEmail().withMessage('email must be valid'),
    body('first_name').notEmpty().withMessage('first_name is required'),
    body('last_name').notEmpty().withMessage('last_name is required'),
    body('metadata.paymentType').isString().withMessage('metadata.paymentType is required'),
    (req, res, next) => {
        const errs = validationResult(req)
        if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() })
        next()
    }
]
