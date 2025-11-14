// test/store.test.ts
import request from 'supertest';
import fs from 'fs-extra';
import path from 'path';
import app from '../src/index';

const token = 'token1';

describe('store upload', () => {
  let server: any;

  beforeAll((done) => {
    // start server on an ephemeral port
    server = app.listen(0, () => done());
  });

  afterAll((done) => {
    server.close(done);
  });

  it('uploads file and returns hash', async () => {
    const res = await request(server)
      .post('/store/upload')
      .set('X-Service-Token', token)
      .attach('file', path.join(__dirname, '../demo/sample_id.jpg'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('storage_path');
    expect(res.body).toHaveProperty('hash');
    expect(res.body.hash.startsWith('sha256:')).toBe(true);
  });
});
