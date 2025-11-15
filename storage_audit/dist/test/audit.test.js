"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// test/audit.test.ts
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../src/index"));
const token = 'token1';
describe('audit append', () => {
    let server;
    beforeAll((done) => {
        server = index_1.default.listen(0, () => done());
    });
    afterAll((done) => {
        server.close(done);
    });
    it('appends audit record and returns log_hash', async () => {
        const payload = { foo: 'bar' };
        const res = await (0, supertest_1.default)(server)
            .post('/audit/append')
            .set('X-Service-Token', token)
            .send({ audit_id: 'audit_test_1', actor: 'orchestrator', action: 'test', payload, prev_hash: '' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('log_hash');
        expect(res.body).toHaveProperty('timestamp');
    });
});
