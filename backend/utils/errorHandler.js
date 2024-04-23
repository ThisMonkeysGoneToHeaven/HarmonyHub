const MyCustomError = require('./MyCustomError');

function handleErrorMessages(res, error, processName, filePathAndName){
    if(error instanceof MyCustomError){
        logErrorMessages(error.message, filePathAndName, error.data);
        return res.status(error.statusCode).json({error: error.message});
    }

    const processErrorMessage = `Something went wrong while ${processName}`;
    logErrorMessages(processErrorMessage, filePathAndName, error);
    return res.status(500).json({error: processErrorMessage});
}

function logErrorMessages(error_mssg, filePathAndName, caught_error){
    error_log = `${filePathAndName} ----->  ` + error_mssg;
    console.error(error_log + (caught_error ? ` : ${caught_error}` : ``));
}

module.exports = handleErrorMessages;