const validator = require('validator');

function isValidEmail(email){
    return validator.isEmail(email);
}

function isValidPassword(password){
    return validator.isStrongPassword(password);
}

module.exports = {isValidEmail, isValidPassword};