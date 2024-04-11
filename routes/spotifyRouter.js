const express = require('express');
const spotifyController = require('../controllers/spotifyController');
const authenticateUser = require('../middleware/authenticateUser');
const checkIfSpotifyAlreadyConnected = require('../middleware/checkIfSpotifyAlreadyConnected');
const makeSureSpotifyIsConnected = require('../middleware/makeSureSpotifyIsConnected');

const router = express.Router();

router.get('/connect', authenticateUser, checkIfSpotifyAlreadyConnected, spotifyController.initiateSpotifyAuthorization);
router.get('/callback', spotifyController.handleCallback);
router.get('/disconnect', authenticateUser, makeSureSpotifyIsConnected, spotifyController.disconnectSpotify);
router.get('/topArtists', authenticateUser, makeSureSpotifyIsConnected, spotifyController.getTopArtists);


module.exports = router;