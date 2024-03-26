const bcrypt = require('bcrypt');
const User = require('../models/User');
const Session = require('../models/Session');
const validator = require('validator');
const jwt = require('jsonwebtoken');

// Import the database connection from db.js
const db = require('../db'); 

function handleErrorMessages(res, error_mssg, catched_error, error_code){
    error_log = './controllers/authController.js --- ' + catched_error + ' -> ' + error_mssg;
    console.error(error_log);
    return res.status(error_code).json({error: error_mssg});
}

function isValidEmail(email){
    return validator.isEmail(email);
}

function isValidPassword(password){
    return validator.isStrongPassword(password);
}

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
} 

async function register(req, res){
    try{
        const {email, password} = req.body;

        if(!isValidEmail(email) || !isValidPassword(password))
            return res.status(400).json({ error: 'Registration failed! Invalid Email or Password.'});

        const hashedPassword = await hashPassword(password);

        const newUser = new User({email: email, password: hashedPassword, isSpotifyConnected: false});
        await newUser.save();

        return res.status(201).json({message: 'Registration successful.'});
    }
    catch(error){

        if(error.code === 11000){
            if(error.keyPattern.email === 1){
                return res.status(400).json({error: 'Email is already registered.'});
            }
        }

        return res.status(500).json({error: 'Registration failed - ' + error});
    }
}

async function login(req, res){
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if(!user)
            return handleErrorMessages(res, 'user not found', '', 401);
 
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if(!isPasswordValid)
            return handleErrorMessages(res, 'invalid password', '', 401);

        // need to check if we already have an active session for this user
        const existingSession = await Session.findOne({userId: email});
        let doTheyHaveAnExistingActiveSession = false;

        if(existingSession){
                if(existingSession.expiresAt > new Date())
                    doTheyHaveAnExistingActiveSession = true;
                // if a previous session exists, we get rid of that
                await existingSession.deleteOne();
        }

        // generate a token
        const myUser = {userId: email};
        const secret_key = process.env.SECRET_KEY;
        const token = jwt.sign(myUser, secret_key, {expiresIn: '1h'});

        const session = new Session({
            userId: email,
            token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        });

        await session.save();
        return res.json({token, message: doTheyHaveAnExistingActiveSession ? 'Your previously active session has been terminated. You are logged in here now!' : 'You are logged in.'});
    }
    catch(error){
        // console.error(error);
        return res.status(500).json({ error: 'An error occurred while logging in: ' + error });    
    }
}

async function logout(req, res){
    try{

        const {userId} = req.user;
        await Session.deleteMany({userId});
        return res.status(201).json({message: 'Logout Successfull !'});
    }
    catch(error){
        return handleErrorMessages(res, 'Logout Unsuccessfull.', error, 500);
    }
}

module.exports = {register, login, logout};