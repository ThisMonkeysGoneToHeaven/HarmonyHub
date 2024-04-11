const jwt = require('jsonwebtoken');
const User = require('../models/User');

function handleErrorMessages(res, error, error_mssg, error_code){
    error_log = './middleware/makeSureSpotifyIsConnected.js --- ' + error_mssg;
    console.error(error_log + (error !== '' ? ` : ${error}` : ''));
    return res.status(error_code).json({error: error_mssg});
}    

async function makeSureSpotifyIsConnected(req, res, next){

    try{
        // make sure that this user's spotify is connect to HH
        const user = await User.findOne({email: req.user.userId});
        
        if(user.isSpotifyConnected === false)
            return handleErrorMessages(res, '', `Spotify account isn't connected to Harmony Hub`, 409);
            else
                next();
    }
    catch(error){
        return handleErrorMessages(res, error, 'error while checking if user has their spotify account connected to HH', 401);
    }
}

module.exports = makeSureSpotifyIsConnected;