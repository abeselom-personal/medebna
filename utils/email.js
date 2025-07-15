import nodemailer from 'nodemailer'
import config from '../config/config.js'

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
})

export const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: config.email.user,
            to,
            subject,
            text,
        })
    } catch (err) {
        console.error(`Email error: ${err.message}`)
        throw err
    }
}
