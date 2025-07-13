import * as authService from '../../services/auth.service.js'

export const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body)
        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}

export const login = async (req, res, next) => {
    try {
        const { accessToken, refreshToken, user } = await authService.login(req.body)
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
        res.status(200).json({ accessToken, user })
    } catch (err) {
        next(err)
    }
}

export const refresh = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken
        const { accessToken, refreshToken } = await authService.refresh(token)
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
        res.status(200).json({ accessToken })
    } catch (err) {
        next(err)
    }
}

export const logout = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken
        await authService.logout(token)
        res.clearCookie('refreshToken')
        res.sendStatus(204)
    } catch (err) {
        next(err)
    }
}
