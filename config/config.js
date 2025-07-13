import dotenv from 'dotenv'
import path from 'path'
import logger from '../utils/logger.js'

const envPath = path.resolve(process.cwd(), '.env')
const result = dotenv.config({ path: envPath })

if (result.error) {
    logger.error('❌ Failed to load .env file:', result.error)
    process.exit(1)
}

const requiredVars = ['JWT_SECRET', 'MONGODB_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET']
for (const v of requiredVars) {
    if (!process.env[v]) {
        logger.error(`❌ Missing env variable: ${v}`)
        process.exit(1)
    }
}

export default {
    jwt: {
        secret: process.env.JWT_SECRET,
        access: process.env.ACCESS_TOKEN_SECRET,
        refresh: process.env.REFRESH_TOKEN_SECRET,
    },
    mongoose: {
        uri: process.env.MONGODB_URI,
    },
    callbackUrl: process.env.CALLBACK_URL,
    port: parseInt(process.env.PORT || '3000'),
}
