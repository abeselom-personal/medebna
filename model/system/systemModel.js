import mongoose from 'mongoose';

const systemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['car', 'hotel', 'event', 'admin'],

    },

    refreshToken: { type: String, select: false },
    password: {
        type: String,
        required: true
    }

});

const System = mongoose.model('System', systemSchema);

export default System;
