import * as nodemailer from "nodemailer";
import * as speakeasy from "speakeasy";


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // Use 465 for SSL or 587 for TLS
    secure: true,
    auth: {
        user: "help@medebna.com",
        pass: "xckb llol znvf yqlu",
    },
    logger: true, // Enable detailed logs
    debug: true,
});

const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: 'help@medebna.com',
            to: to,
            subject: subject,
            text: text,
        });
    } catch (error) {
        console.error(`Error sending email to ${to}: ${error.message}`);
        throw error;
    }
};


const generateOTP = () => {
    const secret = speakeasy.generateSecret({ length: 20 });
    return speakeasy.totp({
        secret: secret.base32,
        encoding: 'base32',
        digits: 6
    });
};

export { sendEmail, generateOTP }
