import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  cartItemId: { 
    type: String, 
    required: true, 
    default: () => new mongoose.Types.ObjectId().toString() 
  },
  item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'kind' },
  kind: { type: String, enum: ['Room', 'Event'], required: true },
  currency: { type: String, required: true },
  unitPrice: {
    currency: { type: String, required: true },
    base: { type: Number, required: true },
    final: { type: Number, required: true },
    ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscountRule', default: null },
    discountLocked: { type: Boolean, default: false }
  },
  adults: { type: Number, default: 1 },
  children: { type: Number, default: 0 },
  checkIn: Date,
  checkOut: Date,
  eventDate: Date,
  discountPercent: { type: Number, default: 0 },
  appliedDiscount: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscountRule', default: null },
  baseCost: { type: Number, required: true },
  finalCost: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
  items: [cartItemSchema],
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) 
  },
  couponCode: String,
  totalBaseCost: { type: Number, default: 0 },
  totalFinalCost: { type: Number, default: 0 },
  currency: { type: String, required: true }
}, { timestamps: true });

// Pre-save hook to calculate totals
cartSchema.pre('save', async function(next) {
  // Recalculate costs for modified items
  let totalBase = 0;
  let totalFinal = 0;
  
  for (const item of this.items) {
    if (item.isModified) {
      // Recalculate costs if needed
      const nights = item.kind === 'Room' 
        ? Math.ceil((new Date(item.checkOut) - new Date(item.checkIn)) / (1000 * 60 * 60 * 24))
        : 1;
      
      item.baseCost = item.unitPrice.base * nights;
      item.finalCost = item.unitPrice.final * nights;
      item.lastUpdated = new Date();
    }
    totalBase += item.baseCost;
    totalFinal += item.finalCost;
  }
  
  this.totalBaseCost = totalBase;
  this.totalFinalCost = totalFinal;
  next();
});

export default mongoose.model('Cart', cartSchema);
