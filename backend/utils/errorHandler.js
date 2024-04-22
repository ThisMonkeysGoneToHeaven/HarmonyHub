function handleErrorMessages(res, error_mssg, caught_error, error_code, filePathAndName){
    error_log = `${filePathAndName} --- ` + caught_error + ' -> ' + error_mssg;
    console.error(error_log + (caught_error !== '' ? ` : ${caught_error}` : ''));
    return res.status(error_code).json({error: error_mssg});
}

module.exports = handleErrorMessages;