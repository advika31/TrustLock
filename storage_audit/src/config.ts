// /src/config.ts

import dotenv from 'dotenv';
dotenv.config();

const env = process.env;

export const PORT = Number(env.PORT || 9000);
export const DATA_DIR = env.DATA_DIR || './data';
export const SERVICE_TOKENS = (env.SERVICE_TOKENS || 'token1').split(',').map(s => s.trim());
export const MAX_UPLOAD_MB = Number(env.MAX_UPLOAD_MB || 10);
export const ENABLE_ENCRYPTION = (env.ENABLE_ENCRYPTION || 'false') === 'true';
export const ENCRYPTION_KEY = env.ENCRYPTION_KEY || '';
