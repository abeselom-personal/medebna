# Source Code Context

Generated on: 2025-07-23T07:36:14Z

## Repository Overview
- Total Files: 9
- Total Size: 7364 bytes

## Directory Structure
```
booking/
  booking.model.js
business/
  business.model.js
context/
  images/
event/
  event.model.js
favorite/
  favorite.model.js
guest/
  guest.model.js
idempotency/
  idempotenct.model.js
payment/
  payment.model.js
room/
  room.model.js
user/
  user.model.js

```

## File Contents


### File: booking/booking.model.js

```javascript
import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'kind' },
    kind: { type: String, enum: ['Room', 'Event'], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest',
    },
    checkIn: Date,
    checkOut: Date,
    eventDate: Date,
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Pending',
    },
}, { timestamps: true })
// dynamic validation depending on kind
bookingSchema.pre('validate', function(next) {
    if (this.kind === 'Room') {
        if (!this.checkIn || !this.checkOut) {
            return next(new Error('Check-in and check-out are required for room bookings.'))
        }
    } else if (this.kind === 'Event') {
        if (!this.eventDate) {
            return next(new Error('Event date is required for event bookings.'))
        }
    }
    next()
})
bookingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 5, partialFilterExpression: { status: 'pending' } })
export default mongoose.model('Booking', bookingSchema)

```





### File: business/business.model.js

```javascript
// model/business/business.model.js
import mongoose from 'mongoose'

const StepFlags = {
    basic: { type: Boolean, default: false },
    contacts: { type: Boolean, default: false },
    amenities: { type: Boolean, default: false },
    images: { type: Boolean, default: false },
    rooms: { type: Boolean, default: false },
    legal: { type: Boolean, default: false },
    paymentSettings: { type: Boolean, default: false },
}

const BusinessSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    address: {
        line: String,
        city: String,
        country: String,
        lat: Number,
        lng: Number
    },
    type: { type: String, enum: ['hotel', 'venue'], default: 'hotel', required: true },
    contact: {
        phone: String,
        emails: [String]
    },
    amenities: [String],
    images: [{
        url: String,
        blurhash: String
    }],
    legal: {
        licenseNumber: String,
        taxInfo: String,
        additionalDocs: [String]
    },
    paymentSettings: {
        currencies: [{ type: String }],
        details: mongoose.Schema.Types.Mixed,
        subAccount: {
            id: String, // chapa subaccount id
            account_name: String,
            business_name: String,
            bank_code: Number,
            account_number: String,
            split_type: { type: String, enum: ['flat', 'percentage'] },
            split_value: Number
        }
    },
    stepsCompleted: { type: StepFlags, default: () => ({}) },
    published: { type: Boolean, default: false },
}, { timestamps: true })

BusinessSchema.methods.completeStep = function(step) {
    if (this.stepsCompleted.hasOwnProperty(step)) {
        this.stepsCompleted[step] = true
        return this.save()
    }
}
export default mongoose.model('Business', BusinessSchema)

```





### File: event/event.model.js

```javascript
import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
    name: String,
    description: String,
    images: [{
        url: String,
        blurhash: String
    }],
    location: String,
    date: Date,
    startTime: Date,
    endTime: Date,
    price: Number,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    }
}, { timestamps: true })

export default mongoose.model('Event', eventSchema)

```





### File: favorite/favorite.model.js

```javascript
import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'kind' },
    kind: { type: String, required: true, enum: ['Room', 'Event'] },
    createdAt: { type: Date, default: Date.now }
})
export default mongoose.model('Favorite', favoriteSchema)


```





### File: guest/guest.model.js

```javascript
// guest/guest.model.js
import mongoose from 'mongoose'

const guestSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: false },
    dob: { type: Date, required: false }
}, { timestamps: true })

export default mongoose.model('Guest', guestSchema)

```





### File: idempotency/idempotenct.model.js

```javascript

import mongoose from 'mongoose'

const schema = new mongoose.Schema({
    key: { type: String, unique: true, required: true },
    tx_ref: String,
    response: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
})

schema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }) // auto-remove after 24h
export default mongoose.model('Idempotency', schema)

```





### File: payment/payment.model.js

```javascript
import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    tx_ref: { type: String, required: true, unique: true },
    reference: { type: String, required: true },
    status: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    paidFor: {
        item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'paidFor.kind' },
        kind: { type: String, required: true, enum: ['Room', 'Event'] }
    },
    raw: { type: Object },
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Payment', paymentSchema)

```





### File: room/room.model.js

```javascript
import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
    title: String,
    description: String,
    images: [{
        url: String,
        blurhash: String
    }],
    price: [{
        currency: { type: String, required: true },
        amount: { type: Number, required: true }
    }],
    location: String,
    availability: {
        from: Date,
        to: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    }
}, { timestamps: true })
export default mongoose.model('Room', roomSchema)

```





### File: user/user.model.js

```javascript
import mongoose, { Schema } from "mongoose"

const UserSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true },
    password: {
        type: String,
        required: true
    },
    phone: { type: String, required: true, trim: true, unique: true },
    role: {
        type: String,
        enum: ["customer", "vendor", "admin"],
        default: "customer"
    },
    sessionId: String,
    productType: String,
    paymentMethod: { type: String, enum: ["chapa", "stripe"] },
    productId: String,
    eventTypeIds: [String],
    eventIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    roomIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
    refreshToken: { type: String, select: false },
}, { timestamps: true })

export default mongoose.model("User", UserSchema)

```




