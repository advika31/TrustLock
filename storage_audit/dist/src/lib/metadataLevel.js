"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putObjectMeta = putObjectMeta;
exports.getObjectMeta = getObjectMeta;
exports.listAllMeta = listAllMeta;
// src/lib/metadataLevel.ts
const level_1 = require("level");
const path_1 = __importDefault(require("path"));
const config_1 = require("../config"); // use your config file
const dbPath = path_1.default.join(config_1.DATA_DIR, 'metadata_db');
const db = new level_1.Level(dbPath, {
    valueEncoding: 'json'
});
const dbOpenPromise = (async () => {
    try {
        // open() will resolve if DB is ready; if already open it resolves quickly
        // Some level versions open automatically upon creation; calling open() is safe.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (typeof db.open === 'function') {
            await db.open();
        }
    }
    catch (err) {
        // Log but don't crash the process here; callers will still await dbOpenPromise and see errors if fatal.
        console.warn('leveldb open failed at startup:', err);
        // rethrow so awaiting callers are aware
        throw err;
    }
})();
async function putObjectMeta(meta) {
    // ensure DB open
    await dbOpenPromise;
    const key = `obj:${meta.sha256}`;
    await db.put(key, meta);
    return meta;
}
async function getObjectMeta(sha256) {
    await dbOpenPromise;
    try {
        const v = await db.get(`obj:${sha256}`);
        return v;
    }
    catch (err) {
        // level throws an error object with .notFound === true for missing keys
        if (err && err.notFound)
            return null;
        throw err;
    }
}
// optional helper to list all meta keys (for admin / debugging)
async function listAllMeta() {
    await dbOpenPromise;
    const out = [];
    for await (const value of db.values()) {
        out.push(value);
    }
    return out;
}
