import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../model/user/user.model.js'
import config from '../config/config.js'

const generateTokens = (id) => {
    const accessToken = jwt.sign({ id }, config.jwt.access, { expiresIn: '15m' })
    const refreshToken = jwt.sign({ id }, config.jwt.refresh, { expiresIn: '7d' })
    return { accessToken, refreshToken }
}

export const register = async ({ email, password, firstName, lastName, phone }) => {
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ email, password: hashed, firstName, lastName, phone })

    const tokens = generateTokens(user._id)
    user.refreshToken = tokens.refreshToken
    await user.save()

    return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: { id: user._id, email: user.email }
    }
}

export const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+password +refreshToken')
    console.log(user)
    if (!user || !(await bcrypt.compare(password, user.password))) throw new Error('Invalid credentials')

    const tokens = generateTokens(user._id)
    user.refreshToken = tokens.refreshToken
    await user.save()

    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: { id: user._id, email: user.email } }
}

export const refresh = async (token) => {
    const payload = jwt.verify(token, config.jwt.refresh)
    const user = await User.findById(payload.id).select('+refreshToken')
    if (!user || user.refreshToken !== token) throw new Error('Invalid refresh token')

    const tokens = generateTokens(user._id)
    user.refreshToken = tokens.refreshToken
    await user.save()

    return tokens
}

export const logout = async (token) => {
    const payload = jwt.verify(token, config.jwt.refresh)
    const user = await User.findById(payload.id)
    if (user) {
        user.refreshToken = null
        await user.save()
    }
}
