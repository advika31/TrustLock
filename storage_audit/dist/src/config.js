"use strict";
// /src/config.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENCRYPTION_KEY = exports.ENABLE_ENCRYPTION = exports.MAX_UPLOAD_MB = exports.SERVICE_TOKENS = exports.DATA_DIR = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const env = process.env;
exports.PORT = Number(env.PORT || 9000);
exports.DATA_DIR = env.DATA_DIR || './data';
exports.SERVICE_TOKENS = (env.SERVICE_TOKENS || 'token1').split(',').map(s => s.trim());
exports.MAX_UPLOAD_MB = Number(env.MAX_UPLOAD_MB || 10);
exports.ENABLE_ENCRYPTION = (env.ENABLE_ENCRYPTION || 'false') === 'true';
exports.ENCRYPTION_KEY = env.ENCRYPTION_KEY || '';
