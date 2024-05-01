"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const MyCustomError_1 = __importDefault(require("../utils/MyCustomError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const fileNameAndPath = `backend/middleware/checkIfSpotifyAlreadyConnected.js`;
async function checkIfSpotifyAlreadyConnected(req, res, next) {
    try {
        if (!req.user)
            throw new Error(`user property is null in request`);
        const user = await User_1.default.findOne({ email: req.user.userId });
        if (!user)
            throw new Error('user data found null!');
        if (user.isSpotifyConnected === true)
            throw new MyCustomError_1.default("User's spotify account is already connected to HarmonyHub.", 409);
        next();
    }
    catch (error) {
        const processName = `verifying if user's HarmonyHub is already connected to their Spotify`;
        return (0, errorHandler_1.default)(res, error, processName, fileNameAndPath);
    }
}
exports.default = checkIfSpotifyAlreadyConnected;
