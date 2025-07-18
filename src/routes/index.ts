import naverRoutes from "./naver.routes";
import { Application } from "express";

export default class Routes {
  constructor(app: Application) {
    app.use("/api/naver", naverRoutes)
  }
}
