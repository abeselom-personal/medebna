// dtos/booking.dto.js
export const validateBookingDto = ({ kind, paymentId }) => {
    if (!kind || !paymentId) throw new Error('kind and paymentId are required')
    if (!['Room', 'Event'].includes(kind)) throw new Error('Invalid kind')
    return { kind, paymentId }
}
