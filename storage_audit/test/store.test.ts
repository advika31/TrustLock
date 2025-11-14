// /test/store.test.ts

/// <reference types="jest" />

import request from 'supertest';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';

const server = 'http://localhost:9000';
const token = 'token1';

describe('store upload', () => {
  let proc: any;

  beforeAll((done) => {
    // start the server in dev mode
    proc = spawn('npx', ['ts-node-dev', '--respawn', '--transpile-only', 'src/index.ts'], { stdio: 'inherit' });
    setTimeout(done, 1200);
  });

  afterAll(() => {
    proc.kill();
  });

  it('uploads file and returns hash', async () => {
    const res = await request(server)
      .post('/store/upload')
      .set('X-Service-Token', token)
      .attach('file', path.join(__dirname, '../demo/sample_id.png'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('storage_path');
    expect(res.body).toHaveProperty('hash');
    expect(res.body.hash.startsWith('sha256:')).toBe(true);
  });
});
