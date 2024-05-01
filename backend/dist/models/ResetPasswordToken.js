"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const tokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Number,
        required: true
    }
});
const ResetPasswordToken = mongoose.model('ResetPasswordToken', tokenSchema);
exports.default = ResetPasswordToken;
