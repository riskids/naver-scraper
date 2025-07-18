"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customError_1 = __importDefault(require("../exceptions/customError"));
const sendErrorResponse = (res, error, statusCode = 500) => {
    let bodyMsg = error.message;
    let errorMsg = error.message == "jwt expired"
        ? "The token is expired!"
        : "Internal server error!";
    if (error instanceof customError_1.default) {
        errorMsg = error.message;
        if (error.stack !== undefined)
            bodyMsg = error.stack;
    }
    const responseOptions = {
        status: false,
        data: bodyMsg,
        message: errorMsg,
    };
    statusCode = error instanceof customError_1.default ? error.statusCode : statusCode;
    res.status(statusCode).json(responseOptions);
};
exports.default = sendErrorResponse;
