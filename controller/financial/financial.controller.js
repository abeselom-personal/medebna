// controller/financial/financial.controller.js
import * as service from '../../services/financial.service.js'

export const createBooking = async (req, res) => {
    try {
        const userId = req?.user?._id ?? null
        const booking = await service.createBookingService({ ...req.body, userId })
        res.status(201).json(booking)
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }
}

export const getBookings = async (req, res) => {
    try {
        const userId = req.user?._id
        const bookings = await service.getBookingsById(userId)
        res.status(200).json(bookings)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

export const getBookingById = async (req, res) => {
    try {
        const id = req?.params?.id
        const booking = await service.getBookingsById(id)
        res.status(201).json(booking)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}
