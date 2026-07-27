import { signAccessToken } from './src/utils/jwt';
import http from 'http';

const staffToken = signAccessToken({
  sub: 'usr_staff_test_001',
  email: 'staff@smartdine.com',
  role: 'staff',
});

const customerToken = signAccessToken({
  sub: 'usr_customer_test_001',
  email: 'customer@smartdine.com',
  role: 'customer',
});

async function testEndpoint(path: string, token: string, body: Record<string, unknown> | null = null): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:4000${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: body ? 'POST' : 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function main() {
  console.log('=== CALLING AI ENDPOINTS ===\n');

  console.log('--- 1. GET /api/v1/ai/recommendations ---');
  const recRes = await testEndpoint('/api/v1/ai/recommendations', customerToken);
  console.log(JSON.stringify(recRes, null, 2));

  console.log('\n--- 2. GET /api/v1/ai/insights ---');
  const insRes = await testEndpoint('/api/v1/ai/insights', staffToken);
  console.log(JSON.stringify(insRes, null, 2));

  console.log('\n--- 3. GET /api/v1/ai/forecast ---');
  const fcRes = await testEndpoint('/api/v1/ai/forecast', staffToken);
  console.log(JSON.stringify(fcRes, null, 2));

  console.log('\n--- 4. POST /api/v1/ai/assistant (Operational Query) ---');
  const astRes1 = await testEndpoint('/api/v1/ai/assistant', staffToken, { query: 'What is our current sales and kitchen status?' });
  console.log(JSON.stringify(astRes1, null, 2));

  console.log('\n--- 5. POST /api/v1/ai/assistant (Out of Scope Query) ---');
  const astRes2 = await testEndpoint('/api/v1/ai/assistant', staffToken, { query: 'What is the capital of France?' });
  console.log(JSON.stringify(astRes2, null, 2));
}

main().catch(console.error);
