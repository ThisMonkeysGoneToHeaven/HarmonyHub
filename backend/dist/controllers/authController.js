"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCaptcha = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Session_1 = __importDefault(require("../models/Session"));
const MyCustomError_1 = __importDefault(require("../utils/MyCustomError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const passwordHash_1 = require("../utils/passwordHash");
const basicValidation_1 = require("../utils/basicValidation");
const filePathAndName = 'backend/controllers/authController.js';
async function register(req, res) {
    try {
        const { email, password } = req.body;
        if (!(0, basicValidation_1.isValidEmail)(email) || !(0, basicValidation_1.isValidPassword)(password)) {
            throw new MyCustomError_1.default('Registration failed! Invalid Email or Password!', 400);
        }
        const hashedPassword = await (0, passwordHash_1.hashPassword)(password);
        const newUser = new User_1.default({ email: email, password: hashedPassword, isSpotifyConnected: false });
        await newUser.save();
        return res.status(201).json({ message: 'Registration successful.' });
    }
    catch (error) {
        if (error.code === 11000 && error.keyPattern.email === 1) {
            error = new MyCustomError_1.default('Email already exists. Pls log in!', 409);
        }
        const processName = `regisetering the user!`;
        return (0, errorHandler_1.default)(res, error, processName, filePathAndName);
    }
}
exports.register = register;
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user)
            throw new MyCustomError_1.default('User not found!', 404);
        const isPasswordValid = await (0, passwordHash_1.comparePassword)(password, user.password);
        if (!isPasswordValid)
            throw new MyCustomError_1.default('Invalid Password', 401);
        const existingSession = await Session_1.default.findOne({ userId: email });
        let doTheyHaveAnExistingActiveSession = false;
        if (existingSession) {
            if (existingSession.expiresAt > new Date())
                doTheyHaveAnExistingActiveSession = true;
            await existingSession.deleteOne();
        }
        const myUser = { userId: email };
        const token = jsonwebtoken_1.default.sign(myUser, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        const session = new Session_1.default({
            userId: email,
            token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        });
        await session.save();
        return res.json({ token, message: doTheyHaveAnExistingActiveSession ? 'Your previously active session has been terminated. You are logged in here now!' : 'You are logged in.' });
    }
    catch (error) {
        const processName = `logging in the user!`;
        return (0, errorHandler_1.default)(res, error, processName, filePathAndName);
    }
}
exports.login = login;
async function logout(req, res) {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId))
            throw new Error('user-id is undefined!');
        const { userId } = req.user;
        await Session_1.default.deleteMany({ userId });
        return res.status(201).json({ message: 'Logout Successfull !' });
    }
    catch (error) {
        const processName = `logging out the user!`;
        return (0, errorHandler_1.default)(res, error, processName, filePathAndName);
    }
}
exports.logout = logout;
async function verifyCaptcha(req, res) {
    const { token } = req.body;
    const apiUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`;
    const authOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    return fetch(apiUrl, authOptions)
        .then(response => response.json())
        .then(data => {
        if ('error-codes' in data)
            throw new Error(data['error-codes']);
        return res.status(200).json({ captcha_success: data.success });
    })
        .catch(error => {
        const processName = `verifying the captcha!`;
        return (0, errorHandler_1.default)(res, error, processName, filePathAndName);
    });
}
exports.verifyCaptcha = verifyCaptcha;
