"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
async function hashPassword(password) {
    try {
        const saltRounds = 10;
        const salt = await bcrypt_1.default.genSalt(saltRounds);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        return hashedPassword;
    }
    catch (error) {
        throw new Error('Password Hashing Failed.');
    }
}
exports.hashPassword = hashPassword;
;
async function comparePassword(providedPassword, correctPassword) {
    return await bcrypt_1.default.compare(providedPassword, correctPassword);
}
exports.comparePassword = comparePassword;
