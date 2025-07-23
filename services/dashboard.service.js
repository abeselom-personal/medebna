import Booking from '../model/booking/booking.model.js'
import Payment from '../model/payment/payment.model.js'
import Business from '../model/business/business.model.js'
import User from '../model/user/user.model.js'
import Event from '../model/event/event.model.js'
import Room from '../model/room/room.model.js'

// Vendor Dashboard Service
export const getVendorDashboardData = async (vendorId, businessId) => {
    const businesses = await Business.find({ ownerId: vendorId })
    if (!businesses.length) throw new Error('No businesses found for this vendor')

    const targetBusiness = businessId
        ? businesses.find(b => b._id.equals(businessId))
        : businesses[0]

    if (!targetBusiness) throw new Error('Business not found')

    const [bookings, revenue, upcomingBookings, recentPayments] = await Promise.all([
        // Booking counts by status
        Booking.aggregate([
            {
                $match: {
                    $or: [
                        { 'item': { $in: await Room.find({ businessId: targetBusiness._id }).distinct('_id') } },
                        {
                            'item': { $in: await Event.find({ businessId: targetBusiness._id }).distinct('_id') }
                        }]
                }
            },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),

        // Total revenue
        Payment.aggregate([
            { $match: { status: 'success' } },
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'paidFor.item',
                    foreignField: '_id',
                    as: 'booking'
                }
            },
            { $unwind: '$booking' },
            {
                $match: {
                    $or: [
                        { 'booking.item': { $in: await Room.find({ businessId: targetBusiness._id }).distinct('_id') } },
                        {
                            'booking.item': { $in: await Event.find({ businessId: targetBusiness._id }).distinct('_id') }
                        }]
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),

        // Upcoming bookings (next 7 days)
        Booking.find({
            $or: [
                { checkIn: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } },
                { eventDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } }
            ],
            $or: [
                { 'item': { $in: await Room.find({ businessId: targetBusiness._id }).distinct('_id') } },
                {
                    'item': { $in: await Event.find({ businessId: targetBusiness._id }).distinct('_id') }
                }]
        }).sort({ createdAt: -1 }).limit(5).populate('guest'),

        // Recent payments
        Payment.find({ status: 'success' })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
                path: 'paidFor.item',
                match: {
                    $or: [
                        { businessId: targetBusiness._id },
                        { businessId: targetBusiness._id }
                    ]
                }
            })
    ])

    return {
        business: {
            id: targetBusiness._id,
            name: targetBusiness.name,
            type: targetBusiness.type,
            published: targetBusiness.published,
            stepsCompleted: targetBusiness.stepsCompleted
        },
        stats: {
            bookings: bookings.reduce((acc, curr) => {
                acc[curr._id.toLowerCase()] = curr.count
                return acc
            }, { pending: 0, confirmed: 0, cancelled: 0 }),
            revenue: revenue[0]?.total || 0,
            rooms: await Room.countDocuments({ businessId: targetBusiness._id }),
            events: await Event.countDocuments({ businessId: targetBusiness._id })
        },
        upcomingBookings,
        recentPayments: recentPayments.filter(p => p.paidFor.item),
        businesses: businesses.map(b => ({ id: b._id, name: b.name }))
    }
}

// Admin Dashboard Service
export const getAdminDashboardData = async () => {
    const [businesses, users, bookings, revenue] = await Promise.all([
        Business.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),
        Booking.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Payment.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
    ])

    const recentActivities = await Booking.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('guest')
        .populate({
            path: 'item',
            populate: { path: 'businessId', model: 'Business' }
        })

    return {
        stats: {
            businesses: businesses.reduce((acc, curr) => {
                acc[curr._id] = curr.count
                return acc
            }, { hotel: 0, venue: 0 }),
            users: users.reduce((acc, curr) => {
                acc[curr._id] = curr.count
                return acc
            }, { customer: 0, vendor: 0, admin: 0 }),
            bookings: bookings.reduce((acc, curr) => {
                acc[curr._id.toLowerCase()] = curr.count
                return acc
            }, { pending: 0, confirmed: 0, cancelled: 0 }),
            revenue: revenue[0]?.total || 0
        },
        recentActivities
    }
}
