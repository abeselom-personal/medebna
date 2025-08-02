import * as authService from '../../services/auth.service.js'

export const register = async (req, res, next) => {
    try {
        if (req.body.role && !["ROLE_CUSTOMER", "ROLE_TICKET_SELLER", "ROLE_HOTEL_VENDOR"].includes(req.body.role)) {
            return res.status(400).json({ message: "Role must be either 'ROLE_CUSTOMER','ROLE_TICKET_SELLER' or 'ROLE_HOTEL_VENDOR'" })
        }

        const { accessToken, refreshToken, user } = await authService.register(req.body)
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
        res.status(200).json({ accessToken, user })
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

export const me = async (req, res, next) => {
    try {
        const user = await authService.me(req.user)
        res.status(200).json(user)
    } catch (err) {
        next(err)
    }
}
export const logout = async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken
        if (!token) return res.status(400).json({ error: 'Missing refresh token' })

        await authService.logout(token)
        res.clearCookie('refreshToken')
        res.status(200).json({ message: 'Logged out' })
    } catch (err) {
        next(err)
    }
}
