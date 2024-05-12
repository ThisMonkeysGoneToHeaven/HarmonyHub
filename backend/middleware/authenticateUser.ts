import express from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import handleErrorMessages from '../utils/errorHandler';
import MyCustomError from '../utils/MyCustomError';
import Session from '../models/Session';
import { error } from 'console';

const fileNameAndPath = `backend/middleware/authenticateUser.js`;

interface ExtendedRequest extends express.Request {
    user?: any; 
  }  

export default async function authenticateUser(req: ExtendedRequest, res: express.Response, next: express.NextFunction): Promise<any>{
    try{
        
        const token = req.header('Authorization');
        
        if(!token)
            throw new Error(`auth token is undefined, can't authenticate the User!`);

        let decoded : JwtPayload;

        try{
            decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET_KEY!) as JwtPayload;
        }
        catch(error){
            throw new MyCustomError('Something went wrong while authenticating your JWT token!', 500);
        }


        // check the sessions-db to make sure if this user has an active session
        let activeSession;
        try{
            const email = decoded.userId;
            activeSession = await Session.findOne({userId: email});
            if(!activeSession)
                throw error;
        }
        catch(error){
            throw new MyCustomError('User needs to be logged in to do this action!', 401);
        }

        // also check that session is not expired, otherwise logout user
        try{
            if(Date.now() > activeSession.expiresAt!){
                await activeSession.deleteOne();
                throw error;
            }
        }
        catch(error){
            throw new MyCustomError('User session expired. Pls log in again to make this request.', 440);
        }


        // we need to append user details to request so that the controller is aware of the identity of the user making this request
        req.user = decoded;
        next();    
    }
    catch(error: any){
        const processName = 'authenticating your request!';
        return handleErrorMessages(res, error, processName, fileNameAndPath);
    }
};