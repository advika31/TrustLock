// /test/audit.test.ts

/// <reference types="jest" />

import request from 'supertest';
import { spawn } from 'child_process';

const server = 'http://localhost:9000';
const token = 'token1';

describe('audit append', () => {
  let proc: any;

  beforeAll((done) => {
    proc = spawn('npx', ['ts-node-dev', '--respawn', '--transpile-only', 'src/index.ts'], { stdio: 'inherit' });
    setTimeout(done, 1200);
  });

  afterAll(() => {
    proc.kill();
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
