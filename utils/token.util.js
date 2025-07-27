import jwt from 'jsonwebtoken'
import config from '../config/config.js'

export const generateTokens = (id, role) => ({
    accessToken: jwt.sign({ id, role }, config.jwt.access, { expiresIn: '1d' }),
    refreshToken: jwt.sign({ id, role }, config.jwt.refresh, { expiresIn: '7d' })
})

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, config.jwt.refresh)
}
