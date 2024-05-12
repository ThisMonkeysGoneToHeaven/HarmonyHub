import mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Number,
        default: Date.now
    },
    expiresAt: {
        type: Number
    }
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;