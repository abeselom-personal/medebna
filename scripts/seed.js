
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Room from '../model/room/room.model.js'
import Event from '../model/event/event.model.js'

dotenv.config()

const db = process.env.MONGO_URI

const random = (arr) => arr[Math.floor(Math.random() * arr.length)]

const fakeLocations = ['Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Hawassa', 'Adama']
const fakeImages = [
    'https://picsum.photos/600/400?random=1',
    'https://picsum.photos/600/400?random=2',
    'https://picsum.photos/600/400?random=3'
]

const generateRooms = (count = 50) =>
    Array.from({ length: count }).map((_, i) => ({
        title: `Room ${i + 1}`,
        description: `Nice room number ${i + 1}`,
        images: [random(fakeImages), random(fakeImages)],
        price: Math.floor(Math.random() * 500) + 100,
        location: random(fakeLocations),
        availability: {
            from: new Date(),
            to: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        },
        createdBy: new mongoose.Types.ObjectId() // fake user id
    }))

const generateEvents = (count = 30) =>
    Array.from({ length: count }).map((_, i) => ({
        name: `Event ${i + 1}`,
        description: `Cool event ${i + 1}`,
        images: [random(fakeImages)],
        price: Math.floor(Math.random() * 300) + 50,
        location: random(fakeLocations),
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * (i + 1)),
        createdBy: new mongoose.Types.ObjectId()
    }))

const seed = async () => {
    try {
        await mongoose.connect(db)
        console.log('DB Connected')

        await Room.deleteMany()
        await Event.deleteMany()

        const rooms = await Room.insertMany(generateRooms())
        const events = await Event.insertMany(generateEvents())

        console.log(`Seeded ${rooms.length} rooms and ${events.length} events`)
        process.exit(0)
    } catch (err) {
        console.error('Seeding error:', err)
        process.exit(1)
    }
}

seed()
