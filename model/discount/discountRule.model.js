// models/DiscountRule.ts
import mongoose from 'mongoose'

const discountRuleSchema = new mongoose.Schema({
    target: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetType',
        validate: {
            validator: v => mongoose.Types.ObjectId.isValid(v),
            message: props => `${props.value} is not a valid ObjectId`
        }
    },
    targetType: {
        type: String,
        required: true,
        enum: ['Room', 'Event']
    },
    title: { type: String, required: true },
    conditions: [{
        key: { type: String, required: true },
        operator: { type: String, enum: ['>=', '<=', '==', '>', '<'], required: true },
        value: { type: mongoose.Schema.Types.Mixed, required: true }
    }],
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    maxDiscount: { type: Number, default: null },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    enabled: { type: Boolean, default: true }
}, { timestamps: true })

discountRuleSchema.index({ target: 1, targetType: 1, enabled: 1 });
discountRuleSchema.index({ validFrom: 1, validTo: 1 });

export default mongoose.model('DiscountRule', discountRuleSchema)
