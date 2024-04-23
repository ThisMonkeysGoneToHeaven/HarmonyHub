const jwt = require('jsonwebtoken');
const handleErrorMessages = require('../utils/errorHandler');

const fileNameAndPath = `backend/middleware/authenticateUser.js`;

function authenticateUser(req, res, next){

    try{
        const token = req.header('Authorization').split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
        // we need to append user details to request so that the controller is aware of the identity of the user making this request
        req.user = decoded;
    
        next();    
    }
    catch(error){
        const processName = 'authenticating your request!';
        return handleErrorMessages(res, error, processName, fileNameAndPath);
    }
};

module.exports = authenticateUser;