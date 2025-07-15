
import speakeasy from 'speakeasy'

export const generateOTP = () => {
    const secret = speakeasy.generateSecret()
    const otp = speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
        digits: 6,
    })
    return { otp, secret: secret.base32 }
}

export const verifyOTP = (token, secret) => {
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1,
    })
}
