import jwt from 'jsonwebtoken'
import config from '../config/config.js'

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return next({ status: 401, message: 'Unauthorized: Bearer token missing' })
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(token, config.jwt.access, (err, decoded) => {
        if (err) {
            return next({ status: 403, message: 'Forbidden: Invalid or expired token' })
        }

        req.user = decoded
        next()
    })
}

export default verifyJWT
