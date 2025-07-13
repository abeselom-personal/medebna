import * as mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'System',
        required: true

    },
    accountName: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: Number,
        required: true,
    },
    bankCode: {
        type: Number,
        required: true,
    },
    chapaSubaccountId: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Account', accountSchema);
