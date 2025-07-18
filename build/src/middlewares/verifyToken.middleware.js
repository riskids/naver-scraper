"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configs_1 = __importDefault(require("../configs"));
const helpers_1 = require("../helpers");
const sendErrorResponse_helper_1 = __importDefault(require("../helpers/sendErrorResponse.helper"));
const customError_1 = __importDefault(require("../exceptions/customError"));
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token = "";
    try {
        token = (0, helpers_1.extractToken)(req);
        const tokenExist = yield (0, helpers_1.useCache)().sismember(configs_1.default.jwtSetKey, token);
        if (tokenExist === 0)
            throw new customError_1.default("The token is not valid!", 401);
        const verifiedToken = jsonwebtoken_1.default.verify(token, configs_1.default.tokenKey);
        req.token = token;
        req.user = verifiedToken;
        next();
    }
    catch (err) {
        yield (0, helpers_1.useCache)().srem(configs_1.default.jwtSetKey, token);
        (0, sendErrorResponse_helper_1.default)(res, err, 401);
    }
});
exports.default = verifyToken;
