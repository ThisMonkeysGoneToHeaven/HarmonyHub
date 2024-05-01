import express from 'express';
import {register, login, logout, verifyCaptcha} from '../controllers/authController';
import authenticateUser from '../middleware/authenticateUser';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateUser, logout);
router.post('/verifyCaptcha', verifyCaptcha);

export default router;