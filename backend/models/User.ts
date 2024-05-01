import mongoose = require('mongoose');

interface UserInterface{
    email: string,
    password: string,
    isSpotifyConnected: Boolean,
    spotifyData?: {
        access_token: string,
        refresh_token: string,
        expires_in: Number,
        expiry_time:Number
    }    
}


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
                required: true
            },
            refresh_token:{
                type: String,
                required: true
            },
            expires_in:{
                type: Number,
                required: true
            },
            expiry_time:{
                type: Number,
                required: true
            }
        },
        required: function(this: UserInterface){
            return this.isSpotifyConnected;
        },
        default: undefined
    }
});

const User = mongoose.model('User', userSchema);
export default User;