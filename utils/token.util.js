import jwt from 'jsonwebtoken'
import config from '../config/config.js'

export const generateTokens = (id) => ({
    accessToken: jwt.sign({ id }, config.jwt.access, { expiresIn: '15m' }),
    refreshToken: jwt.sign({ id }, config.jwt.refresh, { expiresIn: '7d' })
})

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, config.jwt.refresh)
}
