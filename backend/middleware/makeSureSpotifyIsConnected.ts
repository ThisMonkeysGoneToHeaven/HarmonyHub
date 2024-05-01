import express from 'express';
import User from '../models/User';
import MyCustomError from '../utils/MyCustomError';
import handleErrorMessages from '../utils/errorHandler';
import {UserRequiredInRequest} from '../utils/defintitionFile';

const fileNameAndPath = `backend/middleware/makeSureSpotifyIsConnected.js`;

export default async function makeSureSpotifyIsConnected(req: UserRequiredInRequest, res: express.Response, next: express.NextFunction): Promise<any>{

    try{

        if(!req.user)
            throw new Error('user property is undefined in request!');

        const user = await User.findOne({email: req.user.userId.toLowerCase()});

        if(!user)
            throw new Error('null, user is not found in the db!');

        if(user.isSpotifyConnected === false)
            throw new MyCustomError(`User's Spotify is not connected to their HarmonyHub`, 400);
        next();
    }
    catch(error: any){
        const processName = `verifying if user's Spotify is connected to their HarmonyHub account.`;
        return handleErrorMessages(res, error, processName, fileNameAndPath);
    }
}