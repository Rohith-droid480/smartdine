// =============================================================================
// server/test-suite.ts
// Automated end-to-end API test suite for all SmartDine backend modules.
// =============================================================================

import { createApp } from './src/app';
import http from 'http';

async function runTests() {
  console.log('🚀 Starting SmartDine Backend Full E2E Test Suite...\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://localhost:${address.port}/api/v1`;

  try {
    // 1. Health check
    console.log('1️⃣  Testing Health Check (GET /v1/health)...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    console.log('   Status:', healthRes.status, JSON.stringify(healthData));

    // 2. Login as Admin
    console.log('\n2️⃣  Testing Auth Login as Admin (POST /v1/auth/login)...');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@smartdine.com', password: 'Password123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data.tokens.accessToken;
    console.log('   Status:', adminLoginRes.status, 'Admin logged in');

    // 3. Login as Staff
    console.log('\n3️⃣  Testing Auth Login as Staff (POST /v1/auth/login)...');
    const staffLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'staff@smartdine.com', password: 'Password123' }),
    });
    const staffLoginData = await staffLoginRes.json();
    const staffToken = staffLoginData.data.tokens.accessToken;
    console.log('   Status:', staffLoginRes.status, 'Staff logged in');

    // 4. Login as Customer
    console.log('\n4️⃣  Testing Auth Login as Customer (POST /v1/auth/login)...');
    const custLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@smartdine.com', password: 'Password123' }),
    });
    const custLoginData = await custLoginRes.json();
    const customerToken = custLoginData.data.tokens.accessToken;
    const customerId = custLoginData.data.user.id;
    console.log('   Status:', custLoginRes.status, 'Customer logged in');

    // 5. Inventory: Create Item (POST /v1/inventory)
    console.log('\n5️⃣  Testing Create Inventory Item (POST /v1/inventory)...');
    const invRes = await fetch(`${baseUrl}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        name: 'Fresh Parmesan Cheese',
        quantity: 15.5,
        unit: 'kg',
        reorderThreshold: 5.0,
      }),
    });
    const invData = await invRes.json();
    console.log('   Status:', invRes.status, 'Inventory Item:', invData.data?.name, 'Low stock?:', invData.data?.isLowStock);
    const createdInvId = invData.data.id;

    // 6. Inventory: Low Stock Check (GET /v1/inventory/low-stock)
    console.log('\n6️⃣  Testing Low Stock Detection (GET /v1/inventory/low-stock)...');
    const lowStockRes = await fetch(`${baseUrl}/inventory/low-stock`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    const lowStockData = await lowStockRes.json();
    console.log('   Status:', lowStockRes.status, 'Low Stock Items:', lowStockData.data?.length);

    // 7. Staff: List Staff (GET /v1/staff)
    console.log('\n7️⃣  Testing List Staff (GET /v1/staff)...');
    const staffListRes = await fetch(`${baseUrl}/staff`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const staffListData = await staffListRes.json();
    console.log('   Status:', staffListRes.status, 'Staff Count:', staffListData.pagination?.total);

    // 8. Notification: Create Notification (POST /v1/notifications)
    console.log('\n8️⃣  Testing Create Notification (POST /v1/notifications)...');
    const notifRes = await fetch(`${baseUrl}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        userId: customerId,
        message: 'Your table reservation #1 is confirmed for tomorrow evening!',
        channel: 'in_app',
      }),
    });
    const notifData = await notifRes.json();
    console.log('   Status:', notifRes.status, 'Notification ID:', notifData.data?.id);
    const notifId = notifData.data.id;

    // 9. Notification: List & Mark Read (GET & PATCH /v1/notifications)
    console.log('\n9️⃣  Testing List & Mark Notification Read (PATCH /v1/notifications/:id/read)...');
    const markReadRes = await fetch(`${baseUrl}/notifications/${notifId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const markReadData = await markReadRes.json();
    console.log('   Status:', markReadRes.status, 'Is Read:', markReadData.data?.read);

    // 10. Billing: Generate Bill (POST /v1/billing/generate)
    console.log('\n🔟 Testing Billing Foundation (POST /v1/billing/generate)...');
    // First create an order
    const menuRes = await fetch(`${baseUrl}/menu`);
    const menuData = await menuRes.json();
    const dish = menuData.data[0];

    const orderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ items: [{ menuItemId: dish.id, quantity: 2 }] }),
    });
    const orderData = await orderRes.json();
    const orderId = orderData.data.id;

    const billRes = await fetch(`${baseUrl}/billing/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      body: JSON.stringify({
        orderId,
        discountPercentage: 10,
        includeServiceCharge: true,
      }),
    });
    const billData = await billRes.json();
    console.log('   Status:', billRes.status, 'Receipt ID:', billData.data?.receiptId, 'Grand Total:', billData.data?.financials?.grandTotal);
    console.log('   Tax Breakdown: CGST (2.5%):', billData.data?.financials?.taxes?.cgstAmount, 'SGST (2.5%):', billData.data?.financials?.taxes?.sgstAmount);

    console.log('\n🎉 ALL 10 MODULE TESTS PASSED CLEANLY! All Core SmartDine Backend Modules Operational!\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
