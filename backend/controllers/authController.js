const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const MyCustomError = require('../utils/MyCustomError');
const handleErrorMessages = require('../utils/errorHandler');
const {hashPassword, comparePassword} = require('../utils/passwordHash');
const {isValidEmail, isValidPassword} = require('../utils/basicValidation');

// Import the database connection from db.js
const db = require('../db'); 
const filePathAndName = 'backend/controllers/authController.js';

async function register(req, res){
    try{

        const {email, password} = req.body;
        if(!isValidEmail(email) || !isValidPassword(password)){
            throw new MyCustomError('Registration failed! Invalid Email or Password!', 400);
        }

        const hashedPassword = await hashPassword(password);
        const newUser = new User({email: email, password: hashedPassword, isSpotifyConnected: false});

        await newUser.save();
        return res.status(201).json({message: 'Registration successful.'});
    }
    catch(error){

        if(error.code === 11000 && error.keyPattern.email === 1){
                error = new MyCustomError('Email already exists. Pls log in!', 409);
        }

        // the processName will be appended to -> 'Something went wrong while ';
        const processName = `regisetering the user!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
    }
}

async function login(req, res){
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if(!user)
            throw new MyCustomError('User not found!', 404);
 
        const isPasswordValid = await comparePassword(password, user.password);
        
        if(!isPasswordValid)
            throw new MyCustomError('Invalid Password', 401);

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
        const processName = `logging in the user!`;
        return handleErrorMessages(res, error, processName, filePathAndName);    
    }
}

async function logout(req, res){
    try{
        const {userId} = req.user;
        await Session.deleteMany({userId});
        return res.status(201).json({message: 'Logout Successfull !'});
    }
    catch(error){
        const processName = `logging out the user!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
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
            const processName = `verifying the captcha!`;
            return handleErrorMessages(res, error, processName, filePathAndName);
        });
}


module.exports = {register, login, logout, verifyCaptcha};