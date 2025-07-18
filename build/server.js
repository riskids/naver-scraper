"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configs_1 = __importDefault(require("./src/configs"));
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("./src/index"));
const app = (0, express_1.default)();
new index_1.default(app);
const parsedPort = parseInt(configs_1.default.port, 10);
const PORT = isNaN(parsedPort) ? 5000 : parsedPort;
app
    .listen(PORT, "localhost", function () {
    console.log(`Server is running on port ${PORT}.`);
})
    .on("error", (err) => {
    console.error(err);
    if (err.code === "EADDRINUSE") {
        console.log("Error: address already in use");
    }
    else {
        console.log(err);
    }
});
