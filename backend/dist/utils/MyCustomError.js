"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MyCustomError extends Error {
    constructor(message, statusCode, data = {}) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
    }
}
exports.default = MyCustomError;
