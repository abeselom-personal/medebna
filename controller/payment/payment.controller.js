import * as paymentService from '../../services/payment.service.js'

export const init = async (req, res, next) => {
    try {
        const idempotencyKey = req.headers['idempotency-key']
        const result = await paymentService.initPayment(
            req.user.id,
            req.body,
            idempotencyKey
        )
        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}

export const verify = async (req, res, next) => {
    try {
        const result = await paymentService.verifyPayment(req.params.tx_ref)
        res.status(200).json(result)
    } catch (err) {
        next(err)
    }
}
