"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const fileNameAndPath = `backend/middleware/authenticateUser.js`;
function authenticateUser(req, res, next) {
    try {
        const token = req.header('Authorization');
        if (!token)
            throw new Error(`auth token is undefined, can't authenticate the User!`);
        const decoded = jsonwebtoken_1.default.verify(token.split(' ')[1], process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    }
    catch (error) {
        const processName = 'authenticating your request!';
        return (0, errorHandler_1.default)(res, error, processName, fileNameAndPath);
    }
}
exports.default = authenticateUser;
;
