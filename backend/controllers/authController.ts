import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Session from '../models/Session';
import MyCustomError from '../utils/MyCustomError';
import handleErrorMessages from '../utils/errorHandler';
import { UserRequiredInRequest } from '../utils/defintitionFile';
import {hashPassword, comparePassword} from '../utils/passwordHash';
import {isValidEmail, isValidPassword} from '../utils/basicValidation';

// Import the database connection from db.js
const db = require('../db');
 
const filePathAndName = 'backend/controllers/authController.ts';

export async function register(req: express.Request, res: express.Response){
    try{

        const email = req.body.email.toLowerCase();
        const password = req.body.password;

        if(!isValidEmail(email) || !isValidPassword(password)){
            throw new MyCustomError('Registration failed! Invalid Email or Password!', 400);
        }

        const hashedPassword = await hashPassword(password);
        const newUser = new User({email: email.toLowerCase(), password: hashedPassword, isSpotifyConnected: false});

        await newUser.save();
        return res.status(201).json({message: 'Registration successful.'});
    }
    catch(error: any){
        if(error.code === 11000 && error.keyPattern.email === 1){
                error = new MyCustomError('Email already exists. Pls log in!', 409);
        }

        // the processName will be appended to -> 'Something went wrong while ';
        const processName = `regisetering the user!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
    }
}

export async function login(req: express.Request, res: express.Response){
    try{
        
        const email = req.body.email.toLowerCase();
        const password = req.body.password;

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
                if(existingSession.expiresAt! > new Date())
                    doTheyHaveAnExistingActiveSession = true;
                // if a previous session exists, we get rid of that
                await existingSession.deleteOne();
        }

        // generate a token
        const myUser = {userId: email};
        const token = jwt.sign(myUser, process.env.JWT_SECRET_KEY!, {expiresIn: '1h'});

        const session = new Session({
            userId: email,
            token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        });

        await session.save();
        return res.json({token, message: doTheyHaveAnExistingActiveSession ? 'Your previously active session has been terminated. You are logged in here now!' : 'You are logged in.'});
    }
    catch(error: any){
        const processName = `logging in the user!`;
        return handleErrorMessages(res, error, processName, filePathAndName);    
    }
}

export async function logout(req: UserRequiredInRequest, res: express.Response){
    try{

        if(!req.user?.userId)
            throw new Error('user-id is undefined!');

        const userId = req.user.userId.toLowerCase();
        await Session.deleteMany({userId});
        return res.status(201).json({message: 'Logout Successfull !'});
    }
    catch(error: any){
        const processName = `logging out the user!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
    }
}

export async function verifyCaptcha(req: express.Request, res: express.Response){
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