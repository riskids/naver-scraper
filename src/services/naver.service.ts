
import puppeteer from 'puppeteer-extra';
import { Browser, Page } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import * as fs from 'fs';
import * as path from 'path';
import { redisHelper } from '../helpers/redis.helper';
import * as crypto from 'crypto';

puppeteer.use(StealthPlugin())

interface StateData{
    [key: string] : any;
}

const MAX_RETRY_ATTEMPTS = 3;

const loadProxies = () => {
    const proxyFilePath = path.join(__dirname, '../../proxy.txt');
    const proxyList = fs.readFileSync(proxyFilePath, 'utf-8').split('\n').filter(line => line.trim() !== '');

    const servers: string[] = [];
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
const hashUrl = (url: string): string => {
    return crypto.createHash('md5').update(url).digest('hex');
};

const scrapeNaverProduct = async (url: string): Promise<StateData> => {
    const urlHash = hashUrl(url);

    // Check Redis for cached data
    const cachedData = await redisHelper.get<StateData>(urlHash);
    if (cachedData) {
        console.log(`Returning cached data for URL: ${url}`);
        return cachedData;
    }

    let attempt = 0;
    while (attempt < MAX_RETRY_ATTEMPTS) {
        let browser: Browser | null = null;
        try {
            const proxyServer = PROXY_SERVERS[attempt % PROXY_SERVERS.length];
            console.log(`Using proxy: ${proxyServer}`);

            browser = await puppeteer.launch({
                args: [
                    `--proxy-server=${proxyServer}`,
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ]
            });

            const userAgent = new UserAgent({ 
                deviceCategory: 'desktop' 
            });
            console.log(`Using User Agent: ${userAgent.toString()}`);

            const page = await browser.newPage();
            await page.setUserAgent(userAgent.toString());
            await page.setViewport({ width: 1920, height: 1080 });
            await page.authenticate(PROXY_CREDENTIALS);

            await page.goto(url, {
                waitUntil:'networkidle0',
                timeout: 60000 
            })

            // await page.screenshot({path: `test-${attempt + 1}.png`, fullPage:true});

            if (await checkCaptcha(page)) {
                console.log('captcha detected');

                //todo func bypass captcha
            }

            if (await checkBlocking(page)) {
                console.log(`Web blocked on attempt ${attempt + 1}...`);
                
                // Close browser and try again with different configuration
                if (browser) {
                    await browser.close();
                    browser = null;
                }
                
                attempt++;
                
                if (attempt >= MAX_RETRY_ATTEMPTS) {
                    throw new Error('Maximum retry attempts reached. All attempts were blocked., try to add more proxy');
                }
                
                // Wait a bit before retrying to avoid rapid requests
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }

            console.log("bypass sucesss ... ");

            const preloadedState = await page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script'));
                const preloadedStateScript = scripts.find(script => 
                    script.innerHTML.includes('__PRELOADED_STATE__')
                );

                console.log(preloadedStateScript);
                
                if (preloadedStateScript) {
                    const jsonString = preloadedStateScript.innerHTML
                        .replace('window.__PRELOADED_STATE__=', '')
                        .trim()
                        .replace(/;$/, ''); // Remove trailing semicolon if exists
                    try {
                        return JSON.parse(jsonString);
                    } catch (e) {
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
            await redisHelper.set(urlHash, preloadedState, 3600);
            console.log(`Scraped data cached for URL: ${url}`);
            
            return preloadedState

        } catch (error) {
            console.error(`Scraping error on attempt ${attempt + 1}:`, error);
            
            if (browser) {
                await browser.close();
                browser = null;
            }
            
            attempt++;
            
            if (attempt >= MAX_RETRY_ATTEMPTS) {
                throw new Error(`Failed to scrape product after ${MAX_RETRY_ATTEMPTS} attempts: ${error instanceof Error ? error.message : String(error)}`);
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
        } finally{
            if (browser) {
                await browser.close();
            }
        }
    }

    throw new Error('Unexpected error: exceeded retry loop without success or failure');
}

const checkCaptcha = async (page: Page): Promise<boolean> => {
    const captchaHead = await page.$('head[title="captcha"]');
    return !!captchaHead;
};

const checkBlocking = async (page: Page):Promise<Boolean> => {
    const isBlocking = await page.evaluate(() => {
        return !!document.querySelector('a.button.highlight[onclick*="location.reload()"]');
    });

    if (isBlocking) {
        return true
    }

    return false
}

export default scrapeNaverProduct;