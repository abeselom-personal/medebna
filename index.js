import 'module-alias/register.js'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import path from 'path';
import swaggerUi from 'swagger-ui-express'
import swaggerJsDoc from 'swagger-jsdoc'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url';

import swaggerConfig from './config/swagger.js'
import initDatabase from './initDatabase.js'
import logger from './utils/logger.js'
import seedAdminUser from './scripts/seedAdmin.js'
import { seed } from './scripts/seed.js'
import routes from './routes/index.js'
import { errorHandler } from './middleware/error.js'

dotenv.config()

const app = express()
const swaggerSpec = swaggerJsDoc(swaggerConfig)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], credentials: true, maxAge: 3600 }))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

initDatabase()
seedAdminUser()
await seed()
app.get('/', (_, res) => res.send('OK'))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api', routes)

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => logger.info(`Server running at http://0.0.0.0:${PORT}`))
