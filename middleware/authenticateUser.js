const jwt = require('jsonwebtoken');

function handleErrorMessages(res, error_mssg, error, error_code){
    error_log = './middleware/authenticateUser.js --- ' + error_mssg;
    console.error(error_log + (error !== '' ? ` : ${error}` : ''));
    return res.status(error_code).json({error: error_mssg});
}    


function authenticateUser(req, res, next){

    let token;

    try{
        token = req.header('Authorization').split(' ')[1];
    }
    catch(error){
        // Always log your errors, Always!
        handleErrorMessages(res, 'Authentication Required! There is an issue with your authorization token!', error, 500);
    }

    if(!token){
        handleErrorMessages(res, 'Authentication Required!', '', 401);
    }

    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        // we need to append user details to request so that the controller is aware of the identity of the user making this request
        req.user = decoded;
        next();
    }
    catch(error){
        handleErrorMessages(res, 'Invalid Token!', error, 401);
    }
};

module.exports = authenticateUser;