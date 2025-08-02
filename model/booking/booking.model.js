import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'kind' },
    kind: { type: String, enum: ['Room', 'Event'], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
    currency: { type: String, required: true }, // Store the selected currency

    unitPrice: {
        currency: { type: String, required: true },
        base: { type: Number, required: true },
        final: { type: Number, required: true },
        ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscountRule', default: null }
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

    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Confirmed', 'Cancelled'],
        default: 'Pending',
    },
    paymentTxRef: String,
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }
}, { timestamps: true });

bookingSchema.pre('validate', async function(next) {
    if (this.kind === 'Room') {
        if (!this.checkIn || !this.checkOut) {
            return next(new Error('Check-in and check-out are required for room bookings.'));
        }

        const Room = mongoose.model('Room');
        const room = await Room.findById(this.item);
        if (!room) return next(new Error('Room not found'));

        // Validate capacity
        if (this.adults > room.numberOfAdults) {
            return next(new Error('Adults exceed room capacity'));
        }
        if (this.children > room.numberOfChildren) {
            return next(new Error('Children exceed room capacity'));
        }

        // Find price for requested currency
        const priceObj = room.price.find(p => p.currency === this.currency);
        if (!priceObj) {
            return next(new Error(`Price not available in ${this.currency}`));
        }

        // Set unit price in selected currency
        this.unitPrice = {
            currency: this.currency,
            base: priceObj.amount,
            final: priceObj.amount,
            ruleId: null
        };

        // Validate availability
        const overlappingCount = await mongoose.model('Booking').countDocuments({
            item: this.item,
            kind: 'Room',
            status: { $in: ['Pending', 'Confirmed'] },
            _id: { $ne: this._id },
            $or: [
                { checkIn: { $lt: this.checkOut, $gte: this.checkIn } },
                { checkOut: { $gt: this.checkIn, $lte: this.checkOut } },
                { checkIn: { $lte: this.checkIn }, checkOut: { $gte: this.checkOut } }
            ]
        });

        if (overlappingCount >= room.maxCapacity) {
            return next(new Error('No rooms available for the selected dates'));
        }
    }

    next();
});

export default mongoose.model('Booking', bookingSchema);
