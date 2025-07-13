import config from './config/config.js'
import mongoose from 'mongoose'
import logger from './utils/logger.js'

async function initDatabase() {
    mongoose.Promise = global.Promise
    try {
        await mongoose.connect(config.mongoose.uri, {
            connectTimeoutMS: 10000,
            serverSelectionTimeoutMS: 10000,
        })
        logger.info('MongoDB connected')
    } catch (err) {
        logger.error('MongoDB connection failed:', err.message)
        process.exit(1)
    }
}

export default initDatabase
