// services/bank.service.js
import axios from 'axios'
import NodeCache from 'node-cache'
import config from '../config/config.js'

const cache = new NodeCache({ stdTTL: 86400 }) // 1 day

export const getBanksService = async () => {
    const cached = cache.get('chapa_banks')
    if (cached) return cached

    const response = await axios.get('https://api.chapa.co/v1/banks', {
        headers: { Authorization: `Bearer ${config.chapa.secretKey}` }
    })

    cache.set('chapa_banks', response.data.data)
    return response.data.data
}
