import { Router } from "express";
import { getNaverProduct } from "../controllers/naver.controller";
import validateNaverProductUrl from '../requests/naver.request'
import express from "express";

const router = express.Router();

router.get('/', validateNaverProductUrl ,getNaverProduct);

export default router;