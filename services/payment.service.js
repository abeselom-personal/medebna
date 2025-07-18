import axios from 'axios'
import { v4 as uuid } from 'uuid'
import config from '../config/config.js'
import Business from '../model/business/business.model.js'
import Payment from '../model/payment/payment.model.js'
import Room from '../model/room/room.model.js'
import Event from '../model/event/event.model.js'

export const initPayment = async ({
    businessId, amount, currency,
    email, first_name, last_name,
    phone_number, metadata = {}
}) => {
    if (!businessId || !amount || !currency || !email || !first_name || !last_name || !phone_number)
        throw new Error('Missing required fields')

    const biz = await Business.findById(businessId)
    if (!biz) throw new Error('Invalid business ID')

    const tx_ref = `${metadata.paymentType || 'unknown'}-${uuid()}-${Date.now()}`
    const generatedCallbackUrl = config.callbackUrl + tx_ref
    const generatedReturnUrl = config.returnUrl + tx_ref

    const payload = {
        amount,
        currency,
        email,
        first_name,
        last_name,
        phone_number,
        tx_ref,
        return_url: generatedReturnUrl,
        callback_url: generatedCallbackUrl,
        metadata, // keep sending metadata as is
        customization: {
            title: metadata.paymentType || 'payment',
            logo: null
        }
    }

    let resp
    // Replace error handling with clearer message extraction
    try {
        resp = await axios.post(
            'https://api.chapa.co/v1/transaction/initialize',
            payload,
            { headers: { Authorization: `Bearer ${config.chapa.secretKey}` } }
        )
    } catch (err) {
        console.log(err)
        const message = err.response?.data?.message || err.message || JSON.stringify(err)
        throw new Error('Failed to initialize payment: ' + message)
    }

    if (!resp?.data?.data?.checkout_url) throw new Error('Invalid response from Chapa')

    await Payment.create({
        tx_ref,
        reference: 'pending',
        status: 'initialized',
        amount,
        currency,
        email,
        phone_number,
        paidFor: {
            item: metadata.sourceId,
            kind: metadata.paymentType === 'room_booking' ? 'Room' : 'Event'
        },
        raw: null
    })
    return {
        checkout_url: resp.data.data.checkout_url,
        tx_ref
    }
}

export const verifyPayment = async (tx_ref) => {
    if (!tx_ref) throw new Error('Missing tx_ref')

    let resp
    try {
        resp = await axios.get(
            `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
            { headers: { Authorization: `Bearer ${config.chapa.secretKey}` } }
        )
    } catch (err) {
        throw new Error('Failed to verify payment: ' + (err.response?.data?.message || err.message))
    }

    const data = resp?.data?.data
    if (!data || !data.status || data.status !== 'success') throw new Error('Payment not successful')

    const type = data.tx_ref?.split('-')?.[0] || ''
    const meta = data.customization?.description ? safeParseJSON(data.customization.description) : {}

    if (type === 'room_booking' && meta.sourceId) {
        await Room.updateOne({ _id: meta.sourceId }, { $set: { paid: true } }).catch(() => { })
    }

    if (type === 'event' && meta.sourceId) {
        await Event.updateOne({ _id: meta.sourceId }, { $set: { paid: true } }).catch(() => { })
    }
    await Payment.findOneAndUpdate(
        { tx_ref: data.tx_ref },
        {
            reference: data.reference,
            status: data.status,
            raw: data
        }
    ).catch(() => { })

    return data
}

const safeParseJSON = (str) => {
    try {
        return JSON.parse(str)
    } catch {
        return {}
    }
}
