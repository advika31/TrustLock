"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// test/store.test.ts
const supertest_1 = __importDefault(require("supertest"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("../src/index"));
const token = 'token1';
describe('store upload', () => {
    let server;
    beforeAll((done) => {
        // start server on an ephemeral port
        server = index_1.default.listen(0, () => done());
    });
    afterAll((done) => {
        server.close(done);
    });
    it('uploads file and returns hash', async () => {
        const res = await (0, supertest_1.default)(server)
            .post('/store/upload')
            .set('X-Service-Token', token)
            .attach('file', path_1.default.join(__dirname, '../demo/sample_id.jpg'));
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('storage_path');
        expect(res.body).toHaveProperty('hash');
        expect(res.body.hash.startsWith('sha256:')).toBe(true);
    });
});
