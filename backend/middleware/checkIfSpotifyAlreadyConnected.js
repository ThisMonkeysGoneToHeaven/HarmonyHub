const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MyCustomError = require('../utils/MyCustomError');
const handleErrorMessages = require('../utils/errorHandler');

const fileNameAndPath = `backend/middleware/checkIfSpotifyAlreadyConnected.js`;

async function checkIfSpotifyAlreadyConnected(req, res, next){

    try{
        const user = await User.findOne({email: req.user.userId});
        if(user.isSpotifyConnected === true)
            throw new MyCustomError("User's spotify account is already connected to HarmonyHub.", 409);

        next();
    }
    catch(error){
        const processName = `verifying if user's HarmonyHub is already connected to their Spotify`;
        return handleErrorMessages(res, error, processName, fileNameAndPath);
    }
}

module.exports = checkIfSpotifyAlreadyConnected;