const querystring = require('querystring');
const User = require('../models/User');
const request = require('request-promise');
const axios = require('axios');

function handleErrorMessages(res, error, error_mssg, error_code){
    error_log = './controllers/spotifyController.js --- ' + error_mssg;
    console.error(error_log + (error !== '' ? ` : ${error}` : ''));
    return res.status(error_code).json({error: error_mssg});
}

const initiateSpotifyAuthorization = async function(req, res){

    const baseSpotifyAuthURL = 'https://accounts.spotify.com/authorize';
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectURI = process.env.SPOTIFY_REDIRECT_URI;
    const scope = 'user-read-private user-top-read';

    const finalAuthURL = baseSpotifyAuthURL + '?' + querystring.stringify({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectURI,
        scope: scope,
        state: req.user.userId
    });

    // send it back to the frontend
    res.send(finalAuthURL);
}

const handleCallback = async function(req, res){
    
    const authorizationCode = req.query.code || null;
    const state = req.query.state || null;

    if(state === null){
        res.redirect('/#' +
          querystring.stringify({
            error: 'state_mismatch'
        }));
    }
    
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'POST',
        body: new URLSearchParams({
            code: authorizationCode,
            grant_type: 'authorization_code',
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        }),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
        },
        json: true
    };


    fetch(authOptions.url, authOptions)
    .then(response => response.json())
    .then(async data => {

        if(data.access_token === undefined)
            throw new Error('access_token is undefined !_!');
        
        // save access_token and refresh_token in the user's SpotifyData
        const userId = req.query.state;
        const userData = await User.findOne({email: userId});
        userData.isSpotifyConnected = true;
        const error_time = ~~(0.05 * data.expires_in);

        userData.spotifyData = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expiry_time: Date.now() + (data.expires_in- error_time) * 1000,
            expires_in: data.expires_in
        }

        await userData.save();
        return res.status(200).redirect(process.env.USERS_DASHBOARD_URI);
    })
    .catch(error => {
        return handleErrorMessages(res, error, 'error retrieving spotify tokens', 500);
    });
}

const requestNewTokens = async function(req, res, refresh_token){

    console.log('requesting new tokens!'); // dev log delete

    try{
        const apiUrl = "https://accounts.spotify.com/api/token";
        const requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: refresh_token
            }),
        }
        
        const body = await fetch(apiUrl, requestOptions);
        const newUserDataResponse = await body.json();

        if(newUserDataResponse.error !== undefined)
            throw new Error('An error occurred while refreshing tokens : ' + newUserDataResponse.error + ' : ' + newUserDataResponse.error_description );
        
        return {newAccessToken: newUserDataResponse.access_token, newRefreshToken: newUserDataResponse.refresh_token || refresh_token};
    }
    catch(error){
        return handleErrorMessages(res, error, 'an error occurred while fetching tokens', 500);
    }
}

const getSpotifyAccessToken = async function(req, res, userId){
    try{
        const userData = await User.findOne({email: userId});
        const currentAccessToken = userData.spotifyData.access_token;
        


        // check if the access token is valid  
        if(Date.now() <= userData.spotifyData.expiry_time)
            // if valid, return the token
            return currentAccessToken;

        // otherwise, fetch a new one using the refresh token and return that
        const {newAccessToken, newRefreshToken} = await requestNewTokens(req, res, userData.spotifyData.refresh_token);

        if(newAccessToken === undefined)
            throw new Error('an error occured while fetching tokens');

        const error_time = ~~(0.05 * userData.spotifyData.expires_in);
        userData.spotifyData = {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            expiry_time: Date.now() + (userData.spotifyData.expires_in - error_time) * 1000,
            expires_in: userData.spotifyData.expires_in
        }
        await userData.save();
        return newAccessToken;
    }
    catch(error){
        return handleErrorMessages(res, error, 'an error occurred while fetching tokens', 500);
    }
}

const disconnectSpotify = async function(req, res){ 
    try{
        // fetching userData
        const userId = req.user.userId;
        const userData = await User.findOne({email: userId});
        // making and saving necessary changes for deleting user's spotify data from HH
        userData.spotifyData = {}
        userData.isSpotifyConnected = false;
        await userData.save();
        
        return res.status(200).json({message: `successfully deleted your spotify data from HarmonyHub. Pls go ahead and revoke HarmonyHub's access to your spotify account by visiting Manage Apps section in your Spotify account settings.`});
    }
    catch(error){
        return handleErrorMessages(res, error, 'error disconnecting spotify from HarmonyHub', 500);
    }
}

const getTopArtists = async function(req, res){
    const apiUrl = `https://api.spotify.com/v1/me/top/artists`;
    const spotifyAccessToken = await getSpotifyAccessToken(req, res, req.user.userId);
    const requestOptions = {
        method: "GET",
        uri: apiUrl,
        json: true,
        headers:{
            'Content-Type':'application/json',
            'Authorization': `Bearer ${spotifyAccessToken}`
        }
    }

    fetch(apiUrl, requestOptions)
    .then(response => response.json())
    .then(data => {
        if(data.error)
            throw new Error(JSON.stringify(data.error));
        else
            return res.status(200).json(data);
    })
    .catch(error => {
        return handleErrorMessages(res, error, `Error Fetching User's Top Aritsts`, 500);
    });
}

module.exports = {initiateSpotifyAuthorization, handleCallback, disconnectSpotify, getTopArtists};