import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        blurhash: {
            type: String,
            default: ''
        }
    }],
    location: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    tickets: [{
        title: {
            type: String,
            required: true
        },
        totalCapacity: {
            type: Number,
            default: 0
        },
        available: {
            type: Number,
            default: function() {
                return this.totalCapacity;
            }
        },
        types: [{
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            benefits: {
                type: String,
                default: ''
            },
            amenities: [{
                type: String
            }]
        }]
    }],
    performers: [{
        name: {
            type: String,
            required: true
        },
        role: {
            type: String,
            default: ''
        },
        image: {
            type: String,
            default: ''
        }
    }],
    sponsors: [{
        name: {
            type: String,
            required: true
        },
        logo: {
            type: String,
            default: ''
        },
        website: {
            type: String,
            default: ''
        }
    }],
    amenities: [{
        name: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            default: ''
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

export default mongoose.model('Event', eventSchema);
