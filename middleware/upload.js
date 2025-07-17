import multer from 'multer'
import path from 'path'
import fs from 'fs'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads'
        if (!fs.existsSync(dir)) fs.mkdirSync(dir)
        cb(null, dir)
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        cb(null, Date.now() + '-' + file.fieldname + ext)
    }
})

export default multer({ storage })
