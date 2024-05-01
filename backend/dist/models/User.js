"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isSpotifyConnected: {
        type: Boolean,
        default: false,
        required: true
    },
    spotifyData: {
        type: {
            access_token: {
                type: String,
                required: true
            },
            refresh_token: {
                type: String,
                required: true
            },
            expires_in: {
                type: Number,
                required: true
            },
            expiry_time: {
                type: Number,
                required: true
            }
        },
        required: function () {
            return this.isSpotifyConnected;
        },
        default: undefined
    }
});
const User = mongoose.model('User', userSchema);
exports.default = User;
