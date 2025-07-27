// controllers/bank.controller.js
import { getBanksService } from '../../services/bank.service.js'
import * as paymentService from '../../services/payment.service.js'

export const getBanks = async (req, res, next) => {
    try {
        const data = await getBanksService()
        res.json({ success: true, data })
    } catch (err) {
        next(err)
    }
}

export const deleteSubaccount = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = await paymentService.deleteSubaccount(id)
        res.json({ success: true, data })
    } catch (err) {
        next(err)
    }
}

