const jwt = require('jsonwebtoken');
const User = require('../models/User');
const MyCustomError = require('../utils/MyCustomError');
const handleErrorMessages = require('../utils/errorHandler');

const fileNameAndPath = `backend/middleware/makeSureSpotifyIsConnected.js`;

async function makeSureSpotifyIsConnected(req, res, next){

    try{
        const user = await User.findOne({email: req.user.userId});
        if(user.isSpotifyConnected === false)
            throw new MyCustomError(`User's Spotify is not connected to their HarmonyHub`, 400);
        next();
    }
    catch(error){
        const processName = `verifying if user's Spotify is connected to their HarmonyHub account.`;
        return handleErrorMessages(res, error, processName, fileNameAndPath);
    }
}

module.exports = makeSureSpotifyIsConnected;