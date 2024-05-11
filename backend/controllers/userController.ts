import User from '../models/User';
import {Request, Response} from 'express';
import sendEmail from '../utils/sendEmail';
import {hashPassword} from '../utils/passwordHash';
import MyCustomError from '../utils/MyCustomError';
import getRandomToken from '../utils/randomTokenGen';
import handleErrorMessages from '../utils/errorHandler';
import ResetPasswordToken from '../models/ResetPasswordToken';
import {isValidEmail, isValidPassword} from '../utils/basicValidation';
import { UserRequiredInRequest, registerationTimeoutDurationInMinutes, resetPasswordTimeoutDurationInMinutes} from '../utils/defintitionFile';
import RegisterationSession from '../models/RegisterationSession';

const filePathAndName = 'backend/controllers/userController.js';

export const getUserDetails = async function(req: UserRequiredInRequest, res: Response){

    try{

        if(!req.user)
            throw new Error(`user property is null in request`);

        //the userId whose data user wants to see
        const requestedUsersId = req.params.userId.toLowerCase(); 
        //the userId of currently logged in user - obtain this from token
        const requestingUsersId = req.user.userId.toLowerCase();

        //check if the data they're requesting is their own data or someone else's and respond accordingly 
        if(requestedUsersId !== requestingUsersId)           
            throw new MyCustomError(`Unauthorized! You don't have access to this data at this time!`, 403);

        const user = await User.findOne({email: requestedUsersId});
        
        const userDetails = {
            username: 'MyDude',
            email: user?.email ?? '',
            isSpotifyConnected: user?.isSpotifyConnected || false
        };

        return res.status(200).json(userDetails);
    }
    catch(error: any){
        const processName = `fetching user's details!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
    }
};

export async function forgotPassword(req: Request, res: Response){
    try{
        const email = req.body.email.toLowerCase();
        const success_message = 'Pls check your email for the reset link.';
        
        if(!isValidEmail(email))
            throw new MyCustomError('Invalid email provided', 400);
    
        const user = await User.findOne({email});
        if(user === null){
            // send a positive message when the email does not exist in the db
            res.status(200).json({message: success_message});
        }
    
        // check for a previously raised token for this user in the db
        const existingResetToken = await ResetPasswordToken.findOne({email});
        
        // if a token does exist in the db for this user
        if(existingResetToken !== null){
            const expiryTime = existingResetToken.createdAt + resetPasswordTimeoutDurationInMinutes * 60 * 1000;
            if(Date.now() < expiryTime){
                const timeLeft = ((expiryTime - Date.now()) / 1000) | 0;
                const mins = (timeLeft / 60) | 0; const secs = timeLeft % 60;
                
                throw new MyCustomError(`You can send another request after ${mins} ${mins === 1 ? 'minute' : 'minutes'} ${secs} seconds!`, 429);
            }else{
                await ResetPasswordToken.deleteOne({email});
            }
        }
    
        const newToken = new ResetPasswordToken({
            email: email,
            token: getRandomToken(),
            createdAt: Date.now()
        });
            
        const link = process.env.RESET_PASSWORD_URI + `?userId=${email}&token=${newToken.token}`;
        const subject = `Click the link to reset HarmonyHub Password!`;

        await sendEmail(email, link, subject)
        .then(async response =>  {
            // token must only be saved in the db when the email is successfully sent
            await newToken.save();
        })
        .catch(error => {
            throw new MyCustomError(`Something went wrong while sending the email!`, 500, error);
        });
    
        return res.status(200).json({message: 'A reset link has been sent to your email address!'});
    }
    catch(error: any){
        const processName = `processing your forgetPassword request!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
    }
}

export const resetPassword = async function (req: Request, res: Response){
    try{

        let {email, token, password} = req.body;
        email = email.toLowerCase();
        
        if(!isValidEmail(email))
            throw new MyCustomError('Invalid email. Pls enter a valid email!', 400);
    
        const existingResetToken = await ResetPasswordToken.findOne({email});
        if(existingResetToken === null){
            // invalid unauthorized request since no token is raised for this email
            throw new MyCustomError('Invalid unauthorized request! No reset password token raised for this email account!', 401);
        }

        // validate the token here my dude
        if(existingResetToken.token !== token)
            throw new MyCustomError('Invalid token. UNAUTHORIZED!', 401);
    
        const expiryTime = existingResetToken.createdAt + resetPasswordTimeoutDurationInMinutes * 60 * 1000;
        if(Date.now() > expiryTime){
            throw new MyCustomError(`Time out! Please raise another request for the reset password link and please complete the process within ${resetPasswordTimeoutDurationInMinutes} minutes!`, 202);
        }
    
        if(!isValidPassword(password))
            throw new MyCustomError('Pls enter a proper strong password that satisfies all the required criteria!', 400);
    
        const hashedPassword = await hashPassword(password);
        const user = await User.findOne({email});

        if(!user)
            throw new Error('user data found null');

        user.password = hashedPassword;
        await user.save();
        
        return res.status(200).json({message: 'Password successfully updated!'});    
    }
    catch(error: any){
        const processName = `changing password!`;
        return handleErrorMessages(res, error, processName, filePathAndName); 
    }
}

export async function completeRegisteration(req: Request, res: Response){
    try{
        // get email and token from the request
        const {email, token} = req.body;
        // check if a reg-session is available for email or throw error o/w
        const regSession = await RegisterationSession.findOne({email});

        if(!regSession)
            throw new MyCustomError('No registeration request raised for this user!', 404);
        // check if the reg-session is not expired or throw error o/w
        if(Date.now() > regSession.expiry_time)
            throw new MyCustomError(`Registeration request expired. Pls re-start the registeration process again and make sure to verify your email within ${registerationTimeoutDurationInMinutes} minutes!`, 408);
        // check if the token is valid or throw error o/w
        if(token !== regSession.token)
            throw new MyCustomError('Invalid Token! Token must not be tampered with.', 401);
        // make a new User object for this request
        const newUser = new User({
            email: email,
            password: regSession.password,
            isSpotifyConnected: false
        });
        // save it to the db
        await newUser.save();
        // send success
        return res.status(200).json({message: 'Successfully registered user. Pls login in with your credentials!'});
    }
    catch(error: any){
        const processName = `completing user registeration!`;
        return handleErrorMessages(res, error, processName, filePathAndName);
    }
}