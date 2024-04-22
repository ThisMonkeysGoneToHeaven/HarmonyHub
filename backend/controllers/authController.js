const User = require('../models/User');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const handleErrorMessages = require('../utils/errorHandler');
const {isValidEmail, isValidPassword} = require('../utils/basicValidation');
const {hashPassword, comparePassword} = require('../utils/passwordHash');

// Import the database connection from db.js
const db = require('../db'); 
const filePathAndName = 'backend/controllers/authController.js';

async function register(req, res){
    try{

        const {email, password} = req.body;
        if(!isValidEmail(email) || !isValidPassword(password)){
            return handleErrorMessages(res, 'Registration failed! Invalid Email or Password!', '', 400, filePathAndName);
        }

        const hashedPassword = await hashPassword(password);
        const newUser = new User({email: email, password: hashedPassword, isSpotifyConnected: false});

        await newUser.save();
        return res.status(201).json({message: 'Registration successful.'});
    }
    catch(error){

        if(error.code === 11000){
            if(error.keyPattern.email === 1){
                return handleErrorMessages(res, 'Email is already registered!', '', 409, filePathAndName);
            }
        }

        return handleErrorMessages(res, 'Something went wrong. Registration failed!', error, 500, filePathAndName);
    }
}

async function login(req, res){
    try{

        const {email, password} = req.body;
        const user = await User.findOne({email});

        if(!user)
            return handleErrorMessages(res, 'User not found!', '', 401, filePathAndName);
 
        const isPasswordValid = await comparePassword(password, user.password);
        
        if(!isPasswordValid)
            return handleErrorMessages(res, 'Invalid password!', '', 401, filePathAndName);

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
        const secret_key = process.env.JWT_SECRET_KEY;
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
        return handleErrorMessages(res, 'an error occured while logging in ', error, 500, filePathAndName);    
    }
}

async function logout(req, res){
    try{
        const {userId} = req.user;
        await Session.deleteMany({userId});
        return res.status(201).json({message: 'Logout Successfull !'});
    }
    catch(error){
        return handleErrorMessages(res, 'Logout Unsuccessfull.', error, 500, filePathAndName);
    }
}

async function verifyCaptcha(req, res){
        const {token} = req.body;
        const apiUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`;

        const authOptions = {
            method: 'POST',
            headers:{
                'Content-Type':'application/json',
            }
        }

        return fetch(apiUrl, authOptions)
        .then(response => response.json())
        .then(data => {
            
            if('error-codes' in data)
                throw new Error(data['error-codes']);
            return res.status(200).json({captcha_success : data.success});
        })
        .catch(error => {
            return handleErrorMessages(res, 'Error during verifying captcha', error, 500, filePathAndName);
        });
}


module.exports = {register, login, logout, verifyCaptcha};