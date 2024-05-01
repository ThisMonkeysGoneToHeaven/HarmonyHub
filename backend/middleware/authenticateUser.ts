import express from 'express';
import jwt from 'jsonwebtoken';
import handleErrorMessages from '../utils/errorHandler';

const fileNameAndPath = `backend/middleware/authenticateUser.js`;

interface ExtendedRequest extends express.Request {
    user?: any; 
  }  

export default function authenticateUser(req: ExtendedRequest, res: express.Response, next: express.NextFunction): any{
    try{
        
        const token = req.header('Authorization');
        
        if(!token)
            throw new Error(`auth token is undefined, can't authenticate the User!`);

        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET_KEY!);
    
        // we need to append user details to request so that the controller is aware of the identity of the user making this request
        req.user = decoded;
        next();    
    }
    catch(error: any){
        const processName = 'authenticating your request!';
        return handleErrorMessages(res, error, processName, fileNameAndPath);
    }
};