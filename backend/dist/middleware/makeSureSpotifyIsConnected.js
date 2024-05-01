"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const MyCustomError_1 = __importDefault(require("../utils/MyCustomError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const fileNameAndPath = `backend/middleware/makeSureSpotifyIsConnected.js`;
async function makeSureSpotifyIsConnected(req, res, next) {
    try {
        if (!req.user)
            throw new Error('user property is undefined in request!');
        const user = await User_1.default.findOne({ email: req.user.userId });
        if (!user)
            throw new Error('null, user is not found in the db!');
        if (user.isSpotifyConnected === false)
            throw new MyCustomError_1.default(`User's Spotify is not connected to their HarmonyHub`, 400);
        next();
    }
    catch (error) {
        const processName = `verifying if user's Spotify is connected to their HarmonyHub account.`;
        return (0, errorHandler_1.default)(res, error, processName, fileNameAndPath);
    }
}
exports.default = makeSureSpotifyIsConnected;
