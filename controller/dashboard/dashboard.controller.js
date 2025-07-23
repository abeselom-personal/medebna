import * as service from '../../services/dashboard.service.js'

export const getVendorDashboard = async (req, res) => {
    try {
        const vendorId = req.user.id
        console.log(vendorId)
        const businessId = req.query.businessId
        const dashboardData = await service.getVendorDashboardData(vendorId, businessId)
        res.status(200).json(dashboardData)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

export const getAdminDashboard = async (req, res) => {
    try {
        const dashboardData = await service.getAdminDashboardData()
        res.status(200).json(dashboardData)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}
