import { Request, Response } from "express";
import sendErrorResponse from "../helpers/sendErrorResponse.helper";
import scrapeNaverProduct from "../services/naver.service";

export const getNaverProduct = async(req: Request, res: Response) => {
    const {productUrl} = req.query as { productUrl: string}

    try {
        const data = await scrapeNaverProduct(productUrl);
        res.json(data)
    } catch (error: any) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
}