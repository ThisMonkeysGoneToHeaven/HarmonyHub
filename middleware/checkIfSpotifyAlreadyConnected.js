const jwt = require('jsonwebtoken');
const User = require('../models/User');

function handleErrorMessages(res, error, error_mssg, error_code){
    error_log = './middleware/checkIfSpotifyAlreadyConnected.js --- ' + error_mssg;
    console.error(error_log + (error !== '' ? ` : ${error}` : ''));
    return res.status(error_code).json({error: error_mssg});
}

async function checkIfSpotifyAlreadyConnected(req, res, next){


    try{
        // check if this user's spotify is already connected?
        const user = await User.findOne({email: req.user.userId});

        if(user.isSpotifyConnected === true)
            throw new Error("User's spotify account is already connected to HarmonyHub.", {code: 409});
        next();
    }
    catch(error){
        if(error.code === 409)
            return handleErrorMessages(res, error, "User's spotify account is already connected to HarmonyHub.", 409);
        else
            return handleErrorMessages(res, error, 'An issue occured while doing checks for the spotify connection!', 500);
    }
}

module.exports = checkIfSpotifyAlreadyConnected;