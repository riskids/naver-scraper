# Naver API Scraper

## Scraper explanation

*   **Anti-Detection**: Uses Puppeteer-Extra with Stealth Plugin, rotates proxies, and changes User-Agents to avoid bot detection.
*   **Resilience**: Implements retry logic for blocking, though captcha solving is currently on progress.
*   **Efficiency**: Leverages Redis for caching scraped data to prevent redundant requests.
*   **Data Extraction**: Primarily extracts data from `window.__PRELOADED_STATE__` JavaScript objects.


## Local Installation

1.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run project:**
    Development (hot-reloading):
    ```bash
    npm run start
    ```
    Access at `http://localhost:5001`.

4.  **Setting the proxy:**
    Add the proxy to this file:
    ```bash
    proxy.txt
    ```

5.  **Example usage of API:**
    the endpoint can be found at `http://localhost:3030/api/naver?productUrl=https://smartstore.naver.com/{store_name}/products/{product_id}`.

    example: `http://localhost:3030/api/naver?productUrl=https://smartstore.naver.com/rainbows9030/products/9645732504` 




## Running via Docker

1.  **Build Docker images:**
    ```bash
    docker-compose build
    ```

2.  **Start services:**
    ```bash
    docker-compose up
    ```
    (For detached mode: `docker-compose up -d`)

3.  **Access application:**
    `http://localhost:3030`

4.  **Stop services:**
    ```bash
    docker-compose down
