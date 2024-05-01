import express from 'express';
import User from '../models/User';
import querystring from 'querystring';
import MyCustomError from '../utils/MyCustomError';
import handleErrorMessages from '../utils/errorHandler';
import { UserRequiredInRequest, NewTokensReturnType } from '../utils/defintitionFile';

const filePathAndName = 'backend/controllers/spotifyController.js';

export const initiateSpotifyAuthorization = async function(req: UserRequiredInRequest, res: express.Response){

    try{
        const baseSpotifyAuthURL = 'https://accounts.spotify.com/authorize';
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const redirectURI = process.env.SPOTIFY_REDIRECT_URI;
        const scope = 'user-read-private user-top-read';
    
        if(!req.user)
            throw new Error(`user property is null in request`);

        const finalAuthURL = baseSpotifyAuthURL + '?' + querystring.stringify({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectURI,
            scope: scope,
            state: req.user.userId.toLowerCase()
        });
    
        // send it back to the frontend
        return res.send(finalAuthURL);    
    }
    catch(error: any){
        const processName = 'initiating Spotify Authorisation!';
        return handleErrorMessages(res, error, processName, filePathAndName);
    }
}

export const handleCallback = async function(req: express.Request, res: express.Response){
    
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
            code: authorizationCode?.toString() || '',
            grant_type: 'authorization_code',
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
        }),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
        },
        json: true
    };


    fetch(authOptions.url, authOptions)
    .then(response => response.json())
    .then(async data => {

        // DO THIS: why the f do I have to manually check if data is defined or not this should be caught by the system man
        if(data.access_token === undefined)
            throw new MyCustomError('Access token is undefined!', 500);
        
        // save access_token and refresh_token in the user's SpotifyData
        const userId = req.query.state;
        const userData = await User.findOne({email: userId});

        if(!userData)
            throw new Error('user data found null');

        userData.isSpotifyConnected = true;

        userData.spotifyData = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expiry_time: Date.now() + data.expires_in * 1000,
            expires_in: data.expires_in
        }

        await userData.save();
        return res.status(200).redirect(process.env.USERS_DASHBOARD_URI!);
    })
    .catch(error => {
        const processName = `completing Spotify authorisation!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
    });
}

export const requestNewTokens = async function(req: express.Request, res: express.Response, refresh_token: string): Promise<NewTokensReturnType | express.Response>{
    try{
        const apiUrl = "https://accounts.spotify.com/api/token";
        const requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
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
    catch(error: any){
        const processName = `refreshing tokens!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
    }
}

export const getSpotifyAccessToken = async function(req: express.Request, res: express.Response, userId_received: string){
    try{
        const userId = userId_received.toLowerCase();
        const userData = await User.findOne({email: userId});

        if(!userData || !userData.spotifyData)
        throw new Error('user data or user\'s spotify data found null');

        const currentAccessToken = userData.spotifyData.access_token;
        // check if the access token is valid  
        if(Date.now() <= userData.spotifyData.expiry_time!)
            // if valid, return the token
            return currentAccessToken;

        // otherwise, fetch a new one using the refresh token and return that
        const newTokens = await requestNewTokens(req, res, userData.spotifyData.refresh_token!);

        if('newAccessToken' in newTokens == false || 'newRefreshToken' in newTokens == false)
            throw new Error('Error while requesting new spotify tokens!');

        userData.spotifyData = {
            access_token: newTokens.newAccessToken,
            refresh_token: newTokens.newRefreshToken,
            expiry_time: Date.now() + (userData.spotifyData.expires_in!  * 1000),
            expires_in: userData.spotifyData.expires_in
        }
        await userData.save();
        return newTokens.newAccessToken;
    }
    catch(error: any){
        const processName = `fetching Spotify token!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
    }
}

export const disconnectSpotify = async function(req: UserRequiredInRequest, res: express.Response){ 
    try{

        if(!req.user)
            throw new Error(`user property is null in request`);

        // fetching userData
        const userId = req.user.userId.toLowerCase();
        const userData = await User.findOne({email: userId});

        if(!userData)
            throw new Error('user data found null');

        // making and saving necessary changes for deleting user's spotify data from HarmonyHub
        userData.spotifyData = undefined;
        userData.isSpotifyConnected = false;
        await userData.save();
        
        return res.status(200).json({message: `successfully deleted your spotify data from HarmonyHub. Pls go ahead and revoke HarmonyHub's access to your spotify account by visiting Manage Apps section in your Spotify account settings.`});
    }
    catch(error: any){
        const processName = `disconnecting Spotify!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
    }
}

export const getTopArtists = async function(req: UserRequiredInRequest, res: express.Response){

    if(!req.user)
    throw new Error(`user property is null in request`);

    const apiUrl = `https://api.spotify.com/v1/me/top/artists`;
    const spotifyAccessToken = await getSpotifyAccessToken(req, res, req.user.userId.toLowerCase());
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
