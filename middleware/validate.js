import Ajv from 'ajv'

import addFormats from 'ajv-formats'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

export const validateBody = (schema) => {
    const validate = ajv.compile(schema)
    return (req, res, next) => {
        const valid = validate(req.body)
        if (!valid) return res.status(400).json({ errors: validate.errors })
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
