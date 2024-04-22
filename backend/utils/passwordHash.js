const bcrypt = require('bcrypt');

async function hashPassword(password){
    try{
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);

        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    }
    catch(error){
        throw new Error('Password Hashing Failed.');
    }
};

async function comparePassword(providedPassword, correctPassword){
    return await bcrypt.compare(providedPassword, correctPassword);
}

module.exports = {hashPassword, comparePassword};