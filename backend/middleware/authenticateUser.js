const jwt = require('jsonwebtoken');
const handleErrorMessages = require('../utils/errorHandler');

const fileNameAndPath = `backend/middleware/authenticateUser.js`;

function authenticateUser(req, res, next){

    let token;
    try{
        token = req.header('Authorization').split(' ')[1];
    }
    catch(error){
        // Always log your errors, Always!
        handleErrorMessages(res, 'Authentication Required! There is an issue with your authorization token!', error, 500, fileNameAndPath);
    }

    if(!token){
        handleErrorMessages(res, 'Authentication Required!', '', 401, fileNameAndPath);
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        // we need to append user details to request so that the controller is aware of the identity of the user making this request
        req.user = decoded;
        next();
    }
    catch(error){
        handleErrorMessages(res, 'Invalid Token!', error, 401, fileNameAndPath);
    }
};

module.exports = authenticateUser;