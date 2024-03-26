const querystring = require('querystring');
const User = require('../models/User');
const request = require('request-promise');
const axios = require('axios');

function handleErrorMessages(res, error, error_mssg, error_code){
    error_log = './controllers/spotifyController.js --- ' + error_mssg;
    console.error(error_log + error !== '' ? ` : ${error}` : '');
    return res.status(error_code).json({error: error_mssg});
}

const getSpotifyAccessToken = async function(userId){
    try{
        const userData = await User.findOne({email: userId});
        const currentAccessToken = userData.spotifyData.access_token;
        // check if the access token is valid
        // if valid, return the token
        // otherwise, fetch a new one using the refresh token and return that
    }
    catch(error){
        // error handling
    }
}

const initiateSpotifyAuthorization = async function(req, res){

    const baseSpotifyAuthURL = 'https://accounts.spotify.com/authorize';
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectURI = process.env.SPOTIFY_REDIRECT_URI;
    const scope = 'user-read-private user-read-email';

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
        userData.spotifyData = {
            access_token: data.access_token,
            refresh_token: data.refresh_token
        }

        await userData.save();
        return res.status(200).redirect(process.env.USERS_DASHBOARD_URI);
    })
    .catch(error => {
        return handleErrorMessages(res, error, 'error retrieving spotify tokens', 500);
    });
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
    const spotifyAccessToken = await getSpotifyAccessToken(req.user.userId);
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
        console.error(`Error Fetching User's Top Aritsts : ${error}`);
        return res.status(500).json({error: `Error Fetching User's Top Aritsts`});
    });
}

module.exports = {initiateSpotifyAuthorization, handleCallback, disconnectSpotify, getTopArtists};