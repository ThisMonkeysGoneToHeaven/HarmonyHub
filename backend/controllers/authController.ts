import jwt from 'jsonwebtoken';
import User from '../models/User';
import Session from '../models/Session';
import {Request, Response} from 'express';
import MyCustomError from '../utils/MyCustomError';
import getRandomToken from '../utils/randomTokenGen';
import handleErrorMessages from '../utils/errorHandler';
import { UserRequiredInRequest, registerationTimeoutDurationInMinutes } from '../utils/defintitionFile';
import {hashPassword, comparePassword} from '../utils/passwordHash';
import {isValidEmail, isValidPassword} from '../utils/basicValidation';
import RegisterationSession from '../models/RegisterationSession';
import sendEmail from '../utils/sendEmail';


const filePathAndName = 'backend/controllers/authController.ts';

export async function register(req: Request, res: Response){
    try{

        const email = req.body.email.toLowerCase();
        const password = req.body.password;

        if(!isValidEmail(email) || !isValidPassword(password)){
            throw new MyCustomError('Registration failed! Invalid Email or Password!', 400);
        }

        const hashedPassword = await hashPassword(password);

        // generate a token
        const token = getRandomToken();
        // create an object for storing registeration-sessions and add the token, email and password to the schema with 5-10 mins validity
        const registerationSessionUser = new RegisterationSession({
            email: email,
            password: hashedPassword,
            token: token,
            expiry_time: Date.now() + registerationTimeoutDurationInMinutes * 60 * 1000
        });

        // send the email with token
        const link = process.env.REGISTERATION_ACTIVATION_URI + `?userId=${email}&token=${token}`;
        const subject = `Click this link to activate your HarmonyHub account!`;

        // IF EMAIL SENT SUCCESFULLY : save the entry in the db
        sendEmail(email, link, subject)
        .then(async response => {
            // check if a sessionRequest already exists and delete it 
            const existingSessionCheck = await RegisterationSession.findOne({email});
            if(existingSessionCheck)
                await existingSessionCheck.deleteOne();
            // otherwise make a new one
            await registerationSessionUser.save();
        })
        .catch(error => {
            throw new MyCustomError('Something went wrong while sending the email', 500);
        });

        return res.status(201).json({message: `Pls click on the link sent to your email address within next ${registerationTimeoutDurationInMinutes} minutes to activate your HarmonyHub account!`});
    }
    catch(error: any){
        if(error.code === 11000 && error.keyPattern.email === 1){
                error = new MyCustomError('Email already exists. Pls log in!', 409);
        }

        const processName = `regisetering the user!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
    }
}

export async function login(req: Request, res: Response){
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
                if(existingSession.expiresAt! > Date.now())
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
            expiresAt: Date.now() + 60 * 60 * 1000
        });

        await session.save();
        return res.json({token, message: doTheyHaveAnExistingActiveSession ? 'Your previously active session has been terminated. You are logged in here now!' : 'You are logged in.'});
    }
    catch(error: any){
        const processName = `logging in the user!`;
        return handleErrorMessages(res, error, processName, filePathAndName);    
    }
}

export async function logout(req: UserRequiredInRequest, res: Response){
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

export async function verifyCaptcha(req: Request, res: Response){
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