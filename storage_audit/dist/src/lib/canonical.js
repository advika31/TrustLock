"use strict";
// /src/lib/canonical.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalize = canonicalize;
function canonicalize(obj) {
    return JSON.stringify(sortObject(obj));
}
function sortObject(value) {
    if (Array.isArray(value))
        return value.map(sortObject);
    if (value && typeof value === 'object') {
        const keys = Object.keys(value).sort();
        const res = {};
        for (const k of keys) {
            res[k] = sortObject(value[k]);
        }
        return res;
    }
    return value;
}
