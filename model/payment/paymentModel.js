import * as mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    tx_ref: { type: String, required: true },
    status: { type: String, required: true },
    paymentMethod: { type: String, default: '' },
    amount: { type: String, default: '' },
    types: { type: String, default: '' },
    reference: { type: String, default: '' },
    charged_amount: { type: String, default: '' },
    currency: { type: String, default: '' },
    mobile: { type: String, default: '' },
    first_name: { type: String, default: '' },
    last_name: { type: String, default: '' },
    email: { type: String, default: '' },




    createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;
