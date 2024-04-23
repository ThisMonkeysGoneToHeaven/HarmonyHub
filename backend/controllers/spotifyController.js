const User = require('../models/User');
const querystring = require('querystring');
const MyCustomError = require(`../utils/MyCustomError`);
const handleErrorMessages = require('../utils/errorHandler');

const filePathAndName = 'backend/controllers/spotifyController.js';

const initiateSpotifyAuthorization = async function(req, res){

    try{
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
    catch(error){
        const processName = 'initiating Spotify Authorisation!';
        return handleErrorMessages(res, error, processName, filePathAndName);
    }
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
            throw new Error('access_token is undefined!');
        
        // save access_token and refresh_token in the user's SpotifyData
        const userId = req.query.state;
        const userData = await User.findOne({email: userId});
        userData.isSpotifyConnected = true;

        userData.spotifyData = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expiry_time: Date.now() + data.expires_in * 1000,
            expires_in: data.expires_in
        }

        await userData.save();
        return res.status(200).redirect(process.env.USERS_DASHBOARD_URI);
    })
    .catch(error => {
        const processName = `completing Spotify authorisation!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
    });
}

const requestNewTokens = async function(req, res, refresh_token){
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
        
        const newUserDataResponse = await fetch(apiUrl, requestOptions)
        .then(response => response.json());

        return {newAccessToken: newUserDataResponse.access_token, newRefreshToken: newUserDataResponse.refresh_token || refresh_token};
    }
    catch(error){
        const processName = `refreshing tokens!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
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

        userData.spotifyData = {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            expiry_time: Date.now() + (userData.spotifyData.expires_in  * 1000),
            expires_in: userData.spotifyData.expires_in
        }
        await userData.save();
        return newAccessToken;
    }
    catch(error){
        const processName = `fetching Spotify token!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
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
        const processName = `disconnecting Spotify!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
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
        return res.status(200).json(data);
    })
    .catch(error => {
        const processName = `fetching user's top artists!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
    });
}

module.exports = {initiateSpotifyAuthorization, handleCallback, disconnectSpotify, getTopArtists};