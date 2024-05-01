"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPassword = exports.isValidEmail = void 0;
const validator_1 = __importDefault(require("validator"));
function isValidEmail(email) {
    return validator_1.default.isEmail(email);
}
exports.isValidEmail = isValidEmail;
function isValidPassword(password) {
    return validator_1.default.isStrongPassword(password);
}
exports.isValidPassword = isValidPassword;
