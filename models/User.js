const mongoose = require('mongoose');

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
            access_token:{
                type: String,
                required: this.isSpotifyConnected ? true : undefined
            },
            refersh_token:{
                type: String,
                required: this.isSpotifyConnected ? true : undefined
            }
        },
        default : {}
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;