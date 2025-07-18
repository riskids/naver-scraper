import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const NaverProductUrlSchema = Joi.object({
    productUrl: Joi.string()
    .uri()
    .pattern(/^https:\/\/smartstore\.naver\.com\/[a-zA-Z0-9_-]+\/products\/[0-9]+$/)
    .required()
    .messages({
        'string.uri': 'productUrl must be a valid URL',
        'string.pattern.base': 'Invalid productUrl format. Expected format: https://smartstore.naver.com/{store_name}/products/{product_id}',
        'any.required': 'productUrl is required',
    }),
})

const validateNaverProductUrl = (req: Request, res:Response, next: NextFunction) => {
    const { error } = NaverProductUrlSchema.validate(req.query)
    if (error) {
        return res.status(400).json({
            error: error.details[0].message
        });
    }
    next();
}

export default validateNaverProductUrl;