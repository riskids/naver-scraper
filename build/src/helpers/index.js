"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwCustomError = exports.getDevice = exports.extractToken = exports.useCache = void 0;
const cache_config_1 = __importDefault(require("../configs/cache.config"));
const customError_1 = __importDefault(require("../exceptions/customError"));
const useCache = () => {
    const initializedCache = new cache_config_1.default();
    const cache = initializedCache.getCache();
    return cache;
};
exports.useCache = useCache;
const extractToken = (req) => {
    var _a;
    try {
        const getToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!getToken)
            throw new Error("Token missing from request");
        return getToken;
    }
    catch (error) {
        throw error;
    }
};
exports.extractToken = extractToken;
const getDevice = (userAgent) => {
    let device = "";
    if ((userAgent === null || userAgent === void 0 ? void 0 : userAgent.isiPad) === true) {
        device = "iPad";
    }
    else if ((userAgent === null || userAgent === void 0 ? void 0 : userAgent.isiPod) === true) {
        device = "iPod";
    }
    else if ((userAgent === null || userAgent === void 0 ? void 0 : userAgent.isAndroid) === true) {
        device = "Android";
    }
    else if ((userAgent === null || userAgent === void 0 ? void 0 : userAgent.isiPhone) === true) {
        device = "iPhone";
    }
    else if ((userAgent === null || userAgent === void 0 ? void 0 : userAgent.isDesktop) === true) {
        device = "Desktop";
    }
    else if ((userAgent === null || userAgent === void 0 ? void 0 : userAgent.isBot) === true) {
        device = "Bot";
    }
    else {
        device = "unknown";
    }
    return device;
};
exports.getDevice = getDevice;
const throwCustomError = (message, statusCode = 400, stack = undefined) => {
    throw new customError_1.default(message, statusCode, stack);
};
exports.throwCustomError = throwCustomError;
