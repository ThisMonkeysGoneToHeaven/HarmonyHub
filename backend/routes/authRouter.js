const express = require('express');
const authController = require('../controllers/authController');
const authenticateUser = require('../middleware/authenticateUser');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticateUser, authController.logout);

module.exports = router;