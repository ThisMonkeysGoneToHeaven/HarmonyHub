import express from 'express';
import {forgotPassword, resetPassword, getUserDetails, completeRegisteration} from '../controllers/userController';
import authenticateUser from '../middleware/authenticateUser';

const router = express.Router();

router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);
router.get('/:userId', authenticateUser, getUserDetails);
router.post('/completeRegisteration', completeRegisteration);

export default router;