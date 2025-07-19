import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Room from '../model/room/room.model.js'
import Business from '../model/business/business.model.js'
import Event from '../model/event/event.model.js'

dotenv.config()

const db = process.env.MONGODB_URI

const random = (arr) => arr[Math.floor(Math.random() * arr.length)]

const fakeLocations = ['Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Hawassa', 'Adama']
const fakeImages = [
    {
        url: 'https://picsum.photos/600/400?random=1',
        blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
    },
    {
        url: 'https://picsum.photos/600/400?random=2',
        blurhash: 'LKO2?U%2Tw=^}pIoU1t7t6fQfQfQ'
    },
    {
        url: 'https://picsum.photos/600/400?random=3',
        blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.'
    }
]

const roomTitles = ['Deluxe Suite', 'Standard Room', 'Single Bed Room', 'Executive Room', 'Family Room']
const roomDescriptions = [
    'A cozy and comfortable space ideal for solo travelers.',
    'Spacious room with modern amenities and city view.',
    'Perfect for families, includes 2 queen beds and balcony.',
    'Executive suite with king-size bed and workspace.',
    'Budget-friendly room with all essentials included.'
]

const generateRooms = (count = 200, businessId) =>
    Array.from({ length: count }).map(() => {
        const title = random(roomTitles)
        const description = random(roomDescriptions)
        const usd = Math.floor(Math.random() * 70) + 30
        const etb = usd * 57

        return {
            title,
            description,
            images: [random(fakeImages), random(fakeImages)],
            price: [
                { currency: 'USD', amount: usd },
                { currency: 'ETB', amount: etb }
            ],
            location: random(fakeLocations),
            availability: {
                from: new Date(),
                to: new Date(Date.now() + 1000 * 60 * 60 * 24 * (15 + Math.floor(Math.random() * 30)))
            },
            createdBy: new mongoose.Types.ObjectId(),
            businessId
        }
    })

const generateEvents = (count = 30, businessId) =>
    Array.from({ length: count }).map((_, i) => ({
        name: `Event ${i + 1}`,
        description: `Cool event ${i + 1}`,
        images: [random(fakeImages)],
        price: Math.floor(Math.random() * 300) + 50,
        location: random(fakeLocations),
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * (i + 1)),
        businessId: businessId,
        createdBy: new mongoose.Types.ObjectId()
    }))

export const seed = async () => {
    try {
        await mongoose.connect(db)
        console.log('DB Connected')

        const exists = await Business.findOne({ name: 'Abresh Hotel' })
        if (exists) {
            console.log('Business already exists. Skipping seeding.')
            return
        }

        const fakeBusiness = await Business.create({
            ownerId: new mongoose.Types.ObjectId(),
            name: 'Abresh Hotel',
            type: 'hotel',
            address: {
                line: 'Bole Street',
                city: 'Addis Ababa',
                country: 'Ethiopia',
                lat: 9.03,
                lng: 38.74
            },
            contact: {
                phone: '+251911000000',
                emails: ['abresh@example.com']
            },
            photos: [random(fakeImages), random(fakeImages)]
        })

        const rooms = await Room.insertMany(generateRooms(50, fakeBusiness._id))
        const events = await Event.insertMany(generateEvents(50, fakeBusiness._id))

        console.log(`Seeded ${rooms.length} rooms and ${events.length} events`)
        return
    } catch (err) {
        console.error('Seeding error:', err)
        return
    }
}

