import http from 'node:http';

const BASE_URL = process.env.TRUSTLOCK_SEED_URL || 'http://localhost:3000';

function post(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `${BASE_URL}${path}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  const result = await post('/api/mock/demo/seed');
  console.log('Seed status:', result.status);
  console.log(result.body);
})();


