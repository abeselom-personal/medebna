import bcrypt from 'bcryptjs'
import * as userService from './user.service.js'
import { generateTokens, verifyRefreshToken } from '../utils/token.util.js'

export const register = async ({ email, password, firstName, lastName, phone, role = 'customer' }) => {
    const hashed = await bcrypt.hash(password, 10)
    const user = await userService.createUser({ email, password: hashed, firstName, lastName, phone, role })

    const tokens = generateTokens(user._id)
    await userService.setRefreshToken(user._id, tokens.refreshToken)

    return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: user
    }
}

export const login = async ({ email, password }) => {
    const user = await userService.findUserByEmail(email)
    if (!user || !(await bcrypt.compare(password, user.password))) throw new Error('Invalid credentials')

    const tokens = generateTokens(user._id)
    await userService.setRefreshToken(user._id, tokens.refreshToken)

    return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: user
    }
}

export const me = async ({ id }) => {
    const user = await userService.findUserById(id)
    return user
}

export const refresh = async (token) => {
    const payload = verifyRefreshToken(token)
    const user = await userService.findUserById(payload.id)
    if (!user || user.refreshToken !== token) throw new Error('Invalid refresh token')

    const tokens = generateTokens(user._id)
    await userService.setRefreshToken(user._id, tokens.refreshToken)

    return tokens
}

export const logout = async (user) => {
    await userService.clearRefreshToken(user.id)
}
