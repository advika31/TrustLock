// test/audit.test.ts
import request from 'supertest';
import app from '../src/index';

const token = 'token1';

describe('audit append', () => {
  let server: any;

  beforeAll((done) => {
    server = app.listen(0, () => done());
  });

  afterAll((done) => {
    server.close(done);
  });

  it('appends audit record and returns log_hash', async () => {
    const payload = { foo: 'bar' };
    const res = await request(server)
      .post('/audit/append')
      .set('X-Service-Token', token)
      .send({ audit_id: 'audit_test_1', actor: 'orchestrator', action: 'test', payload, prev_hash: '' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('log_hash');
    expect(res.body).toHaveProperty('timestamp');
  });
});
