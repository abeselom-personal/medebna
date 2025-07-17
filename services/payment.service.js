import axios from 'axios'
import { v4 as uuid } from 'uuid'
import config from '../config/config.js'
import Business from '../model/business/business.model.js'
import Idempotency from '../model/idempotency/idempotenct.model.js'

export const initPayment = async (
    userId,
    {
        businessId, amount, currency,
        email, first_name, last_name,
        phone_number, return_url, callback_url,
        metadata = {}
    },
    idempotencyKey
) => {
    if (!idempotencyKey) throw new Error('Idempotency-Key header required')

    const exists = await Idempotency.findOne({ key: idempotencyKey })
    if (exists) return exists.response

    const biz = await Business.findOne({ _id: businessId, ownerId: userId })
    if (!biz) throw new Error('Invalid business')

    const tx_ref = `${metadata.paymentType}-${uuid()}`

    const payload = {
        amount, currency, email, first_name, last_name,
        phone_number, tx_ref, return_url, callback_url,
        metadata,
        customization: { title: metadata.paymentType }
    }

    const resp = await axios.post(
        'https://api.chapa.co/v1/transaction/initialize',
        payload,
        {
            headers: {
                Authorization: `Bearer ${config.chapa.secretKey}`,
                'Content-Type': 'application/json',
                'Idempotency-Key': idempotencyKey
            }
        }
    )

    const responseData = {
        checkout_url: resp.data.data.checkout_url,
        tx_ref
    }

    await Idempotency.create({
        key: idempotencyKey,
        tx_ref,
        response: responseData
    })

    return responseData
}

export const verifyPayment = async (tx_ref) => {
    const resp = await axios.get(
        `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
        { headers: { Authorization: `Bearer ${config.chapa.secretKey}` } }
    )
    return resp.data
}
