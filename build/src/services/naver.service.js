"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const user_agents_1 = __importDefault(require("user-agents"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const redis_helper_1 = require("../helpers/redis.helper");
const crypto = __importStar(require("crypto"));
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
const MAX_RETRY_ATTEMPTS = 3;
const loadProxies = () => {
    const proxyFilePath = path.join(__dirname, '../../proxy.txt');
    const proxyList = fs.readFileSync(proxyFilePath, 'utf-8').split('\n').filter(line => line.trim() !== '');
    const servers = [];
    let credentials = { username: '', password: '' };
    if (proxyList.length > 0) {
        const [server, port, username, password] = proxyList[0].split(':');
        servers.push(`http://${server}:${port}`);
        credentials = { username, password };
    }
    return { servers, credentials };
};
const { servers: PROXY_SERVERS, credentials: PROXY_CREDENTIALS } = loadProxies();
//hashing url for storing in redis
const hashUrl = (url) => {
    return crypto.createHash('md5').update(url).digest('hex');
};
const scrapeNaverProduct = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const urlHash = hashUrl(url);
    // Check Redis for cached data
    const cachedData = yield redis_helper_1.redisHelper.get(urlHash);
    if (cachedData) {
        console.log(`Returning cached data for URL: ${url}`);
        return cachedData;
    }
    let attempt = 0;
    while (attempt < MAX_RETRY_ATTEMPTS) {
        let browser = null;
        try {
            const proxyServer = PROXY_SERVERS[attempt % PROXY_SERVERS.length];
            console.log(`Using proxy: ${proxyServer}`);
            browser = yield puppeteer_extra_1.default.launch({
                args: [
                    `--proxy-server=${proxyServer}`,
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ]
            });
            const userAgent = new user_agents_1.default({
                deviceCategory: 'desktop'
            });
            console.log(`Using User Agent: ${userAgent.toString()}`);
            const page = yield browser.newPage();
            yield page.setUserAgent(userAgent.toString());
            yield page.setViewport({ width: 1920, height: 1080 });
            yield page.authenticate(PROXY_CREDENTIALS);
            yield page.goto(url, {
                waitUntil: 'networkidle0',
                timeout: 60000
            });
            yield page.screenshot({ path: `test-${attempt + 1}.png`, fullPage: true });
            if (yield checkCaptcha(page)) {
                console.log('captcha detected');
                //todo func bypass captcha
            }
            if (yield checkBlocking(page)) {
                console.log(`Web blocked on attempt ${attempt + 1}...`);
                // Close browser and try again with different configuration
                if (browser) {
                    yield browser.close();
                    browser = null;
                }
                attempt++;
                if (attempt >= MAX_RETRY_ATTEMPTS) {
                    throw new Error('Maximum retry attempts reached. All attempts were blocked., try to add more proxy');
                }
                // Wait a bit before retrying to avoid rapid requests
                yield new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }
            console.log("bypass sucesss ... ");
            const preloadedState = yield page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script'));
                const preloadedStateScript = scripts.find(script => script.innerHTML.includes('__PRELOADED_STATE__'));
                console.log(preloadedStateScript);
                if (preloadedStateScript) {
                    const jsonString = preloadedStateScript.innerHTML
                        .replace('window.__PRELOADED_STATE__=', '')
                        .trim()
                        .replace(/;$/, ''); // Remove trailing semicolon if exists
                    try {
                        return JSON.parse(jsonString);
                    }
                    catch (e) {
                        console.error('Failed to parse preloaded state:', e);
                        return null;
                    }
                }
                return null;
            });
            if (!preloadedState) {
                throw new Error('Could not find __PRELOADED_STATE__');
            }
            //cache the data to redis
            yield redis_helper_1.redisHelper.set(urlHash, preloadedState, 3600);
            console.log(`Scraped data cached for URL: ${url}`);
            return preloadedState;
        }
        catch (error) {
            console.error(`Scraping error on attempt ${attempt + 1}:`, error);
            if (browser) {
                yield browser.close();
                browser = null;
            }
            attempt++;
            if (attempt >= MAX_RETRY_ATTEMPTS) {
                throw new Error(`Failed to scrape product after ${MAX_RETRY_ATTEMPTS} attempts: ${error instanceof Error ? error.message : String(error)}`);
            }
            // Wait before retrying
            yield new Promise(resolve => setTimeout(resolve, 2000));
        }
        finally {
            if (browser) {
                yield browser.close();
            }
        }
    }
    throw new Error('Unexpected error: exceeded retry loop without success or failure');
});
const checkCaptcha = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const captchaHead = yield page.$('head[title="captcha"]');
    return !!captchaHead;
});
const checkBlocking = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const isBlocking = yield page.evaluate(() => {
        return !!document.querySelector('a.button.highlight[onclick*="location.reload()"]');
    });
    if (isBlocking) {
        return true;
    }
    return false;
});
exports.default = scrapeNaverProduct;
