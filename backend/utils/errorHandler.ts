import express from 'express';
import MyCustomError from './MyCustomError';

export default function handleErrorMessages(res: express.Response, error: Error, processName: string, filePathAndName: string) : express.Response{
    if(error instanceof MyCustomError){
        logErrorMessages(error.message, filePathAndName, error.data);
        return res.status(error.statusCode).json({error: error.message});
    }

    const processErrorMessage = `Something went wrong while ${processName}`;
    logErrorMessages(processErrorMessage, filePathAndName, error);
    return res.status(500).json({error: processErrorMessage});
}

function logErrorMessages(error_mssg: string, filePathAndName: string, caught_error: object): void{
    const error_log = `${filePathAndName} ----->  ` + error_mssg;
    console.error(error_log + (caught_error ? ' : ' + caught_error : ``));
}