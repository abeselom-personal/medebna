import mongoose from 'mongoose'
import logger from './utils/logger.js'

async function initDatabase() {
    mongoose.Promise = global.Promise
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,  // Fail fast if no connection
            maxIdleTimeMS: 10000,
            waitQueueTimeoutMS: 10000
        });
        logger.info('MongoDB connected')
    } catch (err) {
        console.log(err)
        logger.error('MongoDB connection failed:', err.message)
        process.exit(1)
    }
}
export default initDatabase
