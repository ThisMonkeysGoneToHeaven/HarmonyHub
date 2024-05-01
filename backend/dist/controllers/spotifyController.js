"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopArtists = exports.disconnectSpotify = exports.getSpotifyAccessToken = exports.requestNewTokens = exports.handleCallback = exports.initiateSpotifyAuthorization = void 0;
const User_1 = __importDefault(require("../models/User"));
const querystring_1 = __importDefault(require("querystring"));
const MyCustomError_1 = __importDefault(require("../utils/MyCustomError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const filePathAndName = 'backend/controllers/spotifyController.js';
const initiateSpotifyAuthorization = async function (req, res) {
    try {
        const baseSpotifyAuthURL = 'https://accounts.spotify.com/authorize';
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const redirectURI = process.env.SPOTIFY_REDIRECT_URI;
        const scope = 'user-read-private user-top-read';
        if (!req.user)
            throw new Error(`user property is null in request`);
        const finalAuthURL = baseSpotifyAuthURL + '?' + querystring_1.default.stringify({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectURI,
            scope: scope,
            state: req.user.userId
        });
        return res.send(finalAuthURL);
    }
    catch (error) {
        const processName = 'initiating Spotify Authorisation!';
        return (0, errorHandler_1.default)(res, error, processName, filePathAndName);
    }
};
exports.initiateSpotifyAuthorization = initiateSpotifyAuthorization;
const handleCallback = async function (req, res) {
    const authorizationCode = req.query.code || null;
    const state = req.query.state || null;
    if (state === null) {
        res.redirect('/#' +
            querystring_1.default.stringify({
                error: 'state_mismatch'
            }));
    }
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        method: 'POST',
        body: new URLSearchParams({
            code: (authorizationCode === null || authorizationCode === void 0 ? void 0 : authorizationCode.toString()) || '',
            grant_type: 'authorization_code',
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        }),
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
        },
        json: true
    };
    fetch(authOptions.url, authOptions)
        .then(response => response.json())
        .then(async (data) => {
        if (data.access_token === undefined)
            throw new MyCustomError_1.default('Access token is undefined!', 500);
        const userId = req.query.state;
        const userData = await User_1.default.findOne({ email: userId });
        if (!userData)
            throw new Error('user data found null');
        userData.isSpotifyConnected = true;
        userData.spotifyData = {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expiry_time: Date.now() + data.expires_in * 1000,
            expires_in: data.expires_in
        };
        await userData.save();
        return res.status(200).redirect(process.env.USERS_DASHBOARD_URI);
    })
        .catch(error => {
        const processName = `completing Spotify authorisation!`;
        return (0, errorHandler_1.default)(res, error, processName, filePathAndName);
    });
};
exports.handleCallback = handleCallback;
const requestNewTokens = async function (req, res, refresh_token) {
    try {
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
        };
        const newUserDataResponse = await fetch(apiUrl, requestOptions)
            .then(response => response.json());
        return { newAccessToken: newUserDataResponse.access_token, newRefreshToken: newUserDataResponse.refresh_token || refresh_token };
    }
    catch (error) {
        const processName = `refreshing tokens!`;
        return (0, errorHandler_1.default)(res, error, processName, filePathAndName);
    }
};
exports.requestNewTokens = requestNewTokens;
const getSpotifyAccessToken = async function (req, res, userId) {
    try {
        const userData = await User_1.default.findOne({ email: userId });
        if (!userData || !userData.spotifyData)
            throw new Error('user data or user\'s spotify data found null');
        const currentAccessToken = userData.spotifyData.access_token;
        if (Date.now() <= userData.spotifyData.expiry_time)
            return currentAccessToken;
        const newTokens = await (0, exports.requestNewTokens)(req, res, userData.spotifyData.refresh_token);
        if ('newAccessToken' in newTokens == false || 'newRefreshToken' in newTokens == false)
            throw new Error('Error while requesting new spotify tokens!');
        userData.spotifyData = {
            access_token: newTokens.newAccessToken,
            refresh_token: newTokens.newRefreshToken,
            expiry_time: Date.now() + (userData.spotifyData.expires_in * 1000),
            expires_in: userData.spotifyData.expires_in
        };
        await userData.save();
        return newTokens.newAccessToken;
    }
    catch (error) {
        const processName = `fetching Spotify token!`;
        return (0, errorHandler_1.default)(res, error, processName, filePathAndName);
    }
};
exports.getSpotifyAccessToken = getSpotifyAccessToken;
const disconnectSpotify = async function (req, res) {
    try {
        if (!req.user)
            throw new Error(`user property is null in request`);
        const userId = req.user.userId;
        const userData = await User_1.default.findOne({ email: userId });
        if (!userData)
            throw new Error('user data found null');
        userData.spotifyData = undefined;
        userData.isSpotifyConnected = false;
        await userData.save();
        return res.status(200).json({ message: `successfully deleted your spotify data from HarmonyHub. Pls go ahead and revoke HarmonyHub's access to your spotify account by visiting Manage Apps section in your Spotify account settings.` });
    }
    catch (error) {
        const processName = `disconnecting Spotify!`;
        return (0, errorHandler_1.default)(res, error, processName, filePathAndName);
    }
};
exports.disconnectSpotify = disconnectSpotify;
const getTopArtists = async function (req, res) {
    if (!req.user)
        throw new Error(`user property is null in request`);
    const apiUrl = `https://api.spotify.com/v1/me/top/artists`;
    const spotifyAccessToken = await (0, exports.getSpotifyAccessToken)(req, res, req.user.userId);
    const requestOptions = {
        method: "GET",
        uri: apiUrl,
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${spotifyAccessToken}`
        }
    };
    fetch(apiUrl, requestOptions)
        .then(response => response.json())
        .then(data => {
        return res.status(200).json(data);
    })
        .catch(error => {
        const processName = `fetching user's top artists!`;
        return (0, errorHandler_1.default)(res, error, processName, filePathAndName);
    });
};
exports.getTopArtists = getTopArtists;
