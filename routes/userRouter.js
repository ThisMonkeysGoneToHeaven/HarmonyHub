const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateUser = require('../middleware/authenticateUser')

// middleware 'authenticateUser' utilised here
router.get('/:userId', authenticateUser, userController.getUserDetails);

module.exports = router;