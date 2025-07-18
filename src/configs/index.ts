import dotenv from "dotenv";

dotenv.config();
const {
  PORT,
  APP_MODE,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
  SALT_ROUNDS,
  SALT_KEY,
  TOKEN_KEY,
  TOKEN_EXPIRATION,
  CACHE_HOST,
  CACHE_PORT,
  JWT_SET_KEY,
  REDIS_HOST, // Add REDIS_HOST
  REDIS_PORT, // Add REDIS_PORT
} = process.env;
export default {
  port: PORT,
  appMode: APP_MODE,
  dbHost: DB_HOST,
  dbPort: DB_PORT,
  dbDatabase: DB_DATABASE,
  dbUsername: DB_USERNAME,
  dbPassword: DB_PASSWORD,
  saltRounds: SALT_ROUNDS,
  saltKey: SALT_KEY,
  tokenKey: TOKEN_KEY,
  tokenExpration: TOKEN_EXPIRATION || "5m",
  cacheHost: REDIS_HOST || CACHE_HOST, // Prioritize REDIS_HOST
  cachePort: REDIS_PORT ? parseInt(REDIS_PORT as string) : (CACHE_PORT ? parseInt(CACHE_PORT as string) : 6379), // Prioritize REDIS_PORT
  jwtSetKey: JWT_SET_KEY || "tokens",
};
