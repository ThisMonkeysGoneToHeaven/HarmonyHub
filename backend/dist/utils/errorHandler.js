"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MyCustomError_1 = __importDefault(require("./MyCustomError"));
function handleErrorMessages(res, error, processName, filePathAndName) {
    if (error instanceof MyCustomError_1.default) {
        logErrorMessages(error.message, filePathAndName, error.data);
        return res.status(error.statusCode).json({ error: error.message });
    }
    const processErrorMessage = `Something went wrong while ${processName}`;
    logErrorMessages(processErrorMessage, filePathAndName, error);
    return res.status(500).json({ error: processErrorMessage });
}
exports.default = handleErrorMessages;
function logErrorMessages(error_mssg, filePathAndName, caught_error) {
    const error_log = `${filePathAndName} ----->  ` + error_mssg;
    console.error(error_log + (caught_error ? ` : ${caught_error}` : ``));
}
