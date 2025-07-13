
const jwt = require('jsonwebtoken')

const ACCESS_SECRET = 'ACCESS_SECRET_KEY'
const REFRESH_SECRET = 'REFRESH_SECRET_KEY'

exports.generateTokens = (id) => {
    const accessToken = jwt.sign({ id }, ACCESS_SECRET, { expiresIn: '15m' })
    const refreshToken = jwt.sign({ id }, REFRESH_SECRET, { expiresIn: '7d' })
    return { accessToken, refreshToken }
}

exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, REFRESH_SECRET)
}
