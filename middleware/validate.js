import Ajv from 'ajv'

import addFormats from 'ajv-formats'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

export const validateBody = (schema) => {
    const validate = ajv.compile(schema)
    return (req, res, next) => {
        const valid = validate(req.body)
        if (!valid) return res.status(400).json({ errors: validate.errors[0].message })
        next()
    }
}

export const validateResponse = (schema) => {
    const validate = ajv.compile(schema)
    return (_, res, next) => {
        const _json = res.json
        res.json = (data) => {
            const valid = validate(data)
            if (!valid) console.warn('❌ Invalid response:', validate.errors[0].message)
            return _json.call(res, data)
        }
        next()
    }
}

export const validateIdParam = (req, res, next) => {
    const { id } = req.params
    if (!id || typeof id !== 'string') return res.status(400).json({ message: 'Invalid ID' })
    next()
}

export const validateSearchQuery = (req, res, next) => {
    const { source = 'rooms', where, when, dateFrom, dateTo, priceMin, priceMax } = req.query

    if (!where) return res.status(400).json({ message: '"where" is required' })

    if (!when && !(dateFrom && dateTo))
        return res.status(400).json({ message: 'Provide "when" or both "dateFrom" and "dateTo"' })

    if ((priceMin && isNaN(Number(priceMin))) || (priceMax && isNaN(Number(priceMax))))
        return res.status(400).json({ message: '"priceMin" and "priceMax" must be valid numbers' })

    if (!['rooms', 'events'].includes(source))
        return res.status(400).json({ message: '"source" must be either "rooms" or "events"' })

    next()
}
