"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authenticateUser_1 = __importDefault(require("../middleware/authenticateUser"));
const router = express_1.default.Router();
router.post('/forgotPassword', userController_1.forgotPassword);
router.post('/resetPassword', userController_1.resetPassword);
router.get('/:userId', authenticateUser_1.default, userController_1.getUserDetails);
exports.default = router;
