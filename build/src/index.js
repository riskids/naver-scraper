"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const cache_config_1 = __importDefault(require("./configs/cache.config"));
const express_useragent_1 = __importDefault(require("express-useragent"));
class Server {
    constructor(app) {
        this.config(app);
        this.syncCache();
        new routes_1.default(app);
    }
    config(app) {
        const corsOptions = {
            origin: "http://localhost:3000",
            credentials: true,
        };
        app.use((0, cors_1.default)(corsOptions));
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
        app.use(express_1.default.static("public"));
        app.use(express_useragent_1.default.express());
    }
    syncCache() {
        new cache_config_1.default();
    }
}
exports.default = Server;
