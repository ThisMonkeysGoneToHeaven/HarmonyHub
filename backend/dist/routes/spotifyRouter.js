"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const spotifyController_1 = require("../controllers/spotifyController");
const authenticateUser_1 = __importDefault(require("../middleware/authenticateUser"));
const checkIfSpotifyAlreadyConnected_1 = __importDefault(require("../middleware/checkIfSpotifyAlreadyConnected"));
const makeSureSpotifyIsConnected_1 = __importDefault(require("../middleware/makeSureSpotifyIsConnected"));
const router = express_1.default.Router();
router.get('/connect', authenticateUser_1.default, checkIfSpotifyAlreadyConnected_1.default, spotifyController_1.initiateSpotifyAuthorization);
router.get('/callback', spotifyController_1.handleCallback);
router.get('/disconnect', authenticateUser_1.default, makeSureSpotifyIsConnected_1.default, spotifyController_1.disconnectSpotify);
router.get('/topArtists', authenticateUser_1.default, makeSureSpotifyIsConnected_1.default, spotifyController_1.getTopArtists);
exports.default = router;
