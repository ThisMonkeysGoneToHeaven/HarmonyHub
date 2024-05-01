"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.getUserDetails = void 0;
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const passwordHash_1 = require("../utils/passwordHash");
const MyCustomError_1 = __importDefault(require("../utils/MyCustomError"));
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const ResetPasswordToken_1 = __importDefault(require("../models/ResetPasswordToken"));
const basicValidation_1 = require("../utils/basicValidation");
const resetPasswordTimeoutDurationInMinutes = 5;
const filePathAndName = 'backend/controllers/userController.js';
const getRandomToken = () => {
    const randomBytes = crypto_1.default.randomBytes(32);
    return randomBytes.toString('hex');
};
const sendEmail = async (email, link) => {
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.mail.yahoo.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.YAHOO_EMAIL,
            pass: process.env.YAHOO_PASSWORD
        }
    });
    const info = await transporter.sendMail({
        from: process.env.YAHOO_EMAIL,
        to: 'anantdiagarwal@gmail.com',
        subject: 'Click the link to reset HarmonyHub Password!',
        text: link,
    });
    return info;
};
const getUserDetails = async function (req, res) {
    var _a;
    try {
        if (!req.user)
            throw new Error(`user property is null in request`);
        const requestedUsersId = req.params.userId;
        const requestingUsersId = req.user.userId;
        if (requestedUsersId !== requestingUsersId)
            throw new MyCustomError_1.default(`Unauthorized! You don't have access to this data at this time!`, 403);
        const user = await User_1.default.findOne({ email: requestedUsersId });
        const userDetails = {
            username: 'MyDude',
            email: (_a = user === null || user === void 0 ? void 0 : user.email) !== null && _a !== void 0 ? _a : '',
            isSpotifyConnected: (user === null || user === void 0 ? void 0 : user.isSpotifyConnected) || false
        };
        return res.status(200).json(userDetails);
    }
    catch (error) {
        const processName = `fetching user's details!`;
        return (0, errorHandler_1.default)(res, error, processName, filePathAndName);
    }
};
exports.getUserDetails = getUserDetails;
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        const success_message = 'Pls check your email for the reset link.';
        if (!(0, basicValidation_1.isValidEmail)(email))
            throw new MyCustomError_1.default('Invalid email provided', 400);
        const user = await User_1.default.findOne({ email });
        if (user === null) {
            res.status(200).json({ message: success_message });
        }
        const existingResetToken = await ResetPasswordToken_1.default.findOne({ email });
        if (existingResetToken !== null) {
            const expiryTime = existingResetToken.createdAt + resetPasswordTimeoutDurationInMinutes * 60 * 1000;
            if (Date.now() < expiryTime) {
                const timeLeft = ((expiryTime - Date.now()) / 1000) | 0;
                const mins = (timeLeft / 60) | 0;
                const secs = timeLeft % 60;
                throw new MyCustomError_1.default(`You can send another request after ${mins} ${mins === 1 ? 'minute' : 'minutes'} ${secs} seconds!`, 429);
            }
            else {
                await ResetPasswordToken_1.default.deleteOne({ email });
            }
        }
        const newToken = new ResetPasswordToken_1.default({
            email: email,
            token: getRandomToken(),
            createdAt: Date.now()
        });
        const link = process.env.RESET_PASSWORD_URI + `?userId=${email}&token=${newToken.token}`;
        await sendEmail(email, link)
            .then(async (response) => {
            await newToken.save();
        })
            .catch(error => {
            throw new MyCustomError_1.default(`Something went wrong while sending the email!`, 500, error);
        });
        return res.status(200).json({ message: 'A reset link has been sent to your email address!' });
    }
    catch (error) {
        const processName = `processing your forgetPassword request!`;
        return (0, errorHandler_1.default)(res, error, processName, filePathAndName);
    }
}
exports.forgotPassword = forgotPassword;
const resetPassword = async function (req, res) {
    try {
        const { email, token, password } = req.body;
        if (!(0, basicValidation_1.isValidEmail)(email))
            throw new MyCustomError_1.default('Invalid email. Pls enter a valid email!', 400);
        const existingResetToken = await ResetPasswordToken_1.default.findOne({ email });
        if (existingResetToken === null) {
            throw new MyCustomError_1.default('Invalid unauthorized request! No reset password token raised for this email account!', 401);
        }
        if (existingResetToken.token !== token)
            throw new MyCustomError_1.default('Invalid token. UNAUTHORIZED!', 401);
        const expiryTime = existingResetToken.createdAt + resetPasswordTimeoutDurationInMinutes * 60 * 1000;
        if (Date.now() > expiryTime) {
            throw new MyCustomError_1.default(`Time out! Please raise another request for the reset password link and please complete the process within ${resetPasswordTimeoutDurationInMinutes} minutes!`, 202);
        }
        if (!(0, basicValidation_1.isValidPassword)(password))
            throw new MyCustomError_1.default('Pls enter a proper strong password that satisfies all the required criteria!', 400);
        const hashedPassword = await (0, passwordHash_1.hashPassword)(password);
        const user = await User_1.default.findOne({ email });
        if (!user)
            throw new Error('user data found null');
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: 'Password successfully updated!' });
    }
    catch (error) {
        const processName = `changing password!`;
        return (0, errorHandler_1.default)(res, error, processName, filePathAndName);
    }
};
exports.resetPassword = resetPassword;
