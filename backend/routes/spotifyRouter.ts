import express from 'express';
import {initiateSpotifyAuthorization, handleCallback, disconnectSpotify, getTopArtists} from '../controllers/spotifyController';
import authenticateUser from '../middleware/authenticateUser';
import checkIfSpotifyAlreadyConnected from '../middleware/checkIfSpotifyAlreadyConnected';
import makeSureSpotifyIsConnected from '../middleware/makeSureSpotifyIsConnected';

const router = express.Router();

router.get('/connect', authenticateUser, checkIfSpotifyAlreadyConnected, initiateSpotifyAuthorization);
router.get('/callback', handleCallback);
router.get('/disconnect', authenticateUser, makeSureSpotifyIsConnected, disconnectSpotify);
router.get('/topArtists', authenticateUser, makeSureSpotifyIsConnected, getTopArtists);

export default router;