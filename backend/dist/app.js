"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const spotifyRouter_1 = __importDefault(require("./routes/spotifyRouter"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500'),
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});
app.use(express_1.default.json());
app.use('/auth', authRouter_1.default);
app.use('/api/spotify', spotifyRouter_1.default);
app.use('/api/user', userRouter_1.default);
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
