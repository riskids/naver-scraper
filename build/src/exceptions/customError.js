"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomError extends Error {
    constructor(message, statusCode = 400, stack = null) {
        super(message);
        this.name = "CustomError";
        this.statusCode = statusCode;
        this.stack = stack;
    }
}
exports.default = CustomError;
