"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const store_1 = __importDefault(require("./routes/store"));
const audit_1 = __importDefault(require("./routes/audit"));
const sanctions_1 = __importDefault(require("./routes/sanctions"));
const node_cron_1 = __importDefault(require("node-cron"));
const merkle_1 = require("./lib/merkle");
const config_1 = require("./config");
const merkle_2 = __importDefault(require("./routes/merkle"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const events_1 = __importDefault(require("./routes/events"));
node_cron_1.default.schedule('0 * * * *', async () => {
    try {
        const s = await (0, merkle_1.createMerkleSnapshot)();
        console.log('Merkle snapshot created', s);
    }
    catch (e) {
        console.error('Merkle snapshot failed', e);
    }
});
const app = (0, express_1.default)();
app.use(body_parser_1.default.json({ limit: '10mb' }));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use('/store', store_1.default);
app.use('/audit', audit_1.default);
app.use('/sanctions', sanctions_1.default);
app.use('/merkle', merkle_2.default);
app.use('/webhook', webhooks_1.default);
app.use('/events', events_1.default);
app.get('/health', (req, res) => res.json({ status: 'ok' }));
// Export the app for tests / other modules
exports.default = app;
// If the file is run directly (node src/index.ts), start listening.
// This keeps behavior identical when run directly but allows tests to import app.
if (require.main === module) {
    app.listen(config_1.PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`storage_audit running on port ${config_1.PORT}`);
    });
}
