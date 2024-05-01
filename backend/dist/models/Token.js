"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const tokenSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresIn: { type: Number, required: true }
});
const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;
