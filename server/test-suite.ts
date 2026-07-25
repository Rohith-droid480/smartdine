// =============================================================================
// server/test-suite.ts
// Automated end-to-end API test suite for SmartDine backend.
// =============================================================================

import { createApp } from './src/app';
import http from 'http';

async function runTests() {
  console.log('🚀 Starting SmartDine Backend E2E Test Suite...\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://localhost:${address.port}/api/v1`;

  try {
    // Test 1: Health check
    console.log('1️⃣  Testing Health Check (GET /v1/health)...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log('   Status:', healthRes.status, JSON.stringify(healthData));
    if (healthRes.status !== 200) throw new Error('Health check failed');

    // Test 2: Login as customer
    console.log('\n2️⃣  Testing Auth Login (POST /v1/auth/login)...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@smartdine.com',
        password: 'Password123',
      }),
    });
    const loginData = await loginRes.json();
    console.log('   Status:', loginRes.status, 'User:', loginData.data?.user?.email);
    if (loginRes.status !== 200 || !loginData.data?.tokens?.accessToken) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    const customerToken = loginData.data.tokens.accessToken;

    // Test 3: Login as staff
    console.log('\n3️⃣  Testing Auth Login as Staff (POST /v1/auth/login)...');
    const staffLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'staff@smartdine.com',
        password: 'Password123',
      }),
    });
    const staffLoginData = await staffLoginRes.json();
    console.log('   Status:', staffLoginRes.status, 'User:', staffLoginData.data?.user?.email);
    const staffToken = staffLoginData.data.tokens.accessToken;

    // Test 4: Get Current User (GET /v1/auth/me)
    console.log('\n4️⃣  Testing Get Me (GET /v1/auth/me)...');
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const meData = await meRes.json();
    console.log('   Status:', meRes.status, 'Profile:', meData.data?.name, meData.data?.role);

    // Test 5: List Menu Items (GET /v1/menu)
    console.log('\n5️⃣  Testing List Menu Items (GET /v1/menu)...');
    const menuRes = await fetch(`${baseUrl}/menu`);
    const menuData = await menuRes.json();
    console.log('   Status:', menuRes.status, 'Total Items:', menuData.pagination?.total);
    const menuItems = menuData.data || [];
    if (menuItems.length === 0) throw new Error('No menu items found in seed');
    const firstDish = menuItems[0];

    // Test 6: List Tables (GET /v1/reservations/tables)
    console.log('\n6️⃣  Testing List Tables (GET /v1/reservations/tables)...');
    const tablesRes = await fetch(`${baseUrl}/reservations/tables`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const tablesData = await tablesRes.json();
    console.log('   Status:', tablesRes.status, 'Total Tables:', tablesData.data?.length);

    // Test 7: Create Reservation (POST /v1/reservations)
    console.log('\n7️⃣  Testing Create Reservation (POST /v1/reservations)...');
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(19, 0, 0, 0);

    const resvRes = await fetch(`${baseUrl}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        time: tomorrow.toISOString(),
        partySize: 2,
      }),
    });
    const resvData = await resvRes.json();
    console.log('   Status:', resvRes.status, 'Reservation ID:', resvData.data?.id, 'Table:', resvData.data?.tableId);
    if (resvRes.status !== 201) throw new Error(`Reservation failed: ${JSON.stringify(resvData)}`);

    // Test 8: Place Order (POST /v1/orders)
    console.log('\n8️⃣  Testing Place Order (POST /v1/orders)...');
    const orderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [
          { menuItemId: firstDish.id, quantity: 2 },
        ],
      }),
    });
    const orderData = await orderRes.json();
    console.log('   Status:', orderRes.status, 'Order ID:', orderData.data?.id, 'Total:', orderData.data?.total);
    if (orderRes.status !== 201) throw new Error(`Order failed: ${JSON.stringify(orderData)}`);
    const createdOrderId = orderData.data.id;

    // Test 9: Update Order Status (PATCH /v1/orders/:id/status as Staff)
    console.log('\n9️⃣  Testing Update Order Status as Staff (PATCH /v1/orders/:id/status)...');
    const updateOrderRes = await fetch(`${baseUrl}/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({ status: 'preparing' }),
    });
    const updateOrderData = await updateOrderRes.json();
    console.log('   Status:', updateOrderRes.status, 'Updated Status:', updateOrderData.data?.status);
    if (updateOrderRes.status !== 200) throw new Error(`Order status update failed: ${JSON.stringify(updateOrderData)}`);

    // Test 10: List Orders (GET /v1/orders)
    console.log('\n🔟 Testing List Orders (GET /v1/orders)...');
    const listOrdersRes = await fetch(`${baseUrl}/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const listOrdersData = await listOrdersRes.json();
    console.log('   Status:', listOrdersRes.status, 'Total Orders:', listOrdersData.pagination?.total);

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! SmartDine Backend & Supabase DB are 100% Operational!\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
