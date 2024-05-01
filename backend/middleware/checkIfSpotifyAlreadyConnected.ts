import express from 'express';
import User from '../models/User';
import MyCustomError from '../utils/MyCustomError';
import handleErrorMessages from '../utils/errorHandler';
import {UserRequiredInRequest} from '../utils/defintitionFile';

const fileNameAndPath = `backend/middleware/checkIfSpotifyAlreadyConnected.js`;

export default async function checkIfSpotifyAlreadyConnected(req: UserRequiredInRequest, res: express.Response, next: express.NextFunction): Promise<any>{

    try{

        if(!req.user)
            throw new Error(`user property is null in request`);

        const user = await User.findOne({email: req.user.userId.toLowerCase()});

        if(!user)
            throw new Error('user data found null!');

        if(user.isSpotifyConnected === true)
            throw new MyCustomError("User's spotify account is already connected to HarmonyHub.", 409);

        next();
    }
    catch(error: any){
        const processName = `verifying if user's HarmonyHub is already connected to their Spotify`;
        return handleErrorMessages(res, error, processName, fileNameAndPath);
    }
}