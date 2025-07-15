import 'module-alias/register.js'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import swaggerUi from 'swagger-ui-express'
import swaggerJsDoc from 'swagger-jsdoc'
import cookieParser from 'cookie-parser'

import swaggerConfig from './config/swagger.js'
import initDatabase from './initDatabase.js'
import logger from './utils/logger.js'
import seedAdminUser from './controller/seedAdmin.js'
import routes from './routes/index.js'
import { errorHandler } from './middleware/error.js'

dotenv.config()

const app = express()

app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }))
app.use(cors({ methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], credentials: true, maxAge: 3600 }))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
const swaggerSpec = swaggerJsDoc(swaggerConfig)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

initDatabase()
seedAdminUser()

app.use(routes)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => logger.info(`Server running at http://0.0.0.0:${PORT}`))
