"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const NaverProductUrlSchema = joi_1.default.object({
    productUrl: joi_1.default.string()
        .uri()
        .pattern(/^https:\/\/smartstore\.naver\.com\/[a-zA-Z0-9_-]+\/products\/[0-9]+$/)
        .required()
        .messages({
        'string.uri': 'productUrl must be a valid URL',
        'string.pattern.base': 'Invalid productUrl format. Expected format: https://smartstore.naver.com/{store_name}/products/{product_id}',
        'any.required': 'productUrl is required',
    }),
});
const validateNaverProductUrl = (req, res, next) => {
    const { error } = NaverProductUrlSchema.validate(req.query);
    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        });
    }
    next();
};
exports.default = validateNaverProductUrl;
