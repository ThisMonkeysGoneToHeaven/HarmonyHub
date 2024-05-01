import express from 'express';
import {forgotPassword, resetPassword, getUserDetails} from '../controllers/userController';
import authenticateUser from '../middleware/authenticateUser';

const router = express.Router();

router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);
router.get('/:userId', authenticateUser, getUserDetails);


export default router;