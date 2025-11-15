"use strict";
// /src/utils/helpers.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAuditId = generateAuditId;
const uuid_1 = require("uuid");
function generateAuditId(prefix = 'audit') {
    return `${prefix}_${(0, uuid_1.v4)()}`;
}
