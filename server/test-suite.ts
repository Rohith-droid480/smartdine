// =============================================================================
// server/test-suite.ts
// Full E2E test suite — covers ALL SmartDine backend modules.
// Run: npx tsx test-suite.ts (from server/)
// =============================================================================

import { createApp } from './src/app';
import http from 'http';

function pass(label: string, detail?: string) {
  console.log(`   ✅ ${label}${detail ? ' — ' + detail : ''}`);
}

function fail(label: string, body: unknown): never {
  throw new Error(`❌ FAILED: ${label}\n${JSON.stringify(body, null, 2)}`);
}

async function json(res: Response) {
  return res.json();
}

async function runTests() {
  console.log('\n🚀 SmartDine Backend — Full E2E Test Suite\n' + '='.repeat(50) + '\n');

  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((r) => server.listen(0, r));
  const { port } = server.address() as { port: number };
  const B = `http://localhost:${port}/api/v1`;

  try {
    // ── Health ────────────────────────────────────────────────────────────
    console.log('MODULE: Health');
    const h = await (await fetch(`${B}/health`)).json();
    if (h.data?.status !== 'ok') fail('Health check', h);
    pass('GET /health');

    // ── Auth ─────────────────────────────────────────────────────────────
    console.log('\nMODULE: Auth');
    const headers = (t: string) => ({ Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' });

    const login = async (email: string) => {
      const r = await fetch(`${B}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Password123' }),
      });
      const d = await json(r);
      if (r.status !== 200) fail(`Login ${email}`, d);
      return { token: d.data.tokens.accessToken as string, userId: d.data.user.id as string };
    };

    const admin    = await login('admin@smartdine.com');
    const staff    = await login('staff@smartdine.com');
    const customer = await login('customer@smartdine.com');
    pass('POST /auth/login (admin, staff, customer)');

    const meR = await fetch(`${B}/auth/me`, { headers: headers(customer.token) });
    if (meR.status !== 200) fail('GET /auth/me', await json(meR));
    pass('GET /auth/me');

    // ── Menu ─────────────────────────────────────────────────────────────
    console.log('\nMODULE: Menu');
    const menuList = await (await fetch(`${B}/menu`)).json();
    const menuItems: any[] = menuList.data;
    if (!menuItems.length) fail('GET /menu — no items', menuList);
    pass(`GET /menu — ${menuList.pagination.total} items`);

    const newItemR = await fetch(`${B}/menu`, {
      method: 'POST', headers: headers(staff.token),
      body: JSON.stringify({ name: 'Test Soup', description: 'A test soup item for validation', price: 199, category: 'Starters' }),
    });
    const newItem = await json(newItemR);
    if (newItemR.status !== 201) fail('POST /menu', newItem);
    pass('POST /menu (create item)');

    const updateItemR = await fetch(`${B}/menu/${newItem.data.id}`, {
      method: 'PATCH', headers: headers(staff.token),
      body: JSON.stringify({ available: false }),
    });
    if (updateItemR.status !== 200) fail('PATCH /menu/:id', await json(updateItemR));
    pass('PATCH /menu/:id (toggle availability)');

    const delItemR = await fetch(`${B}/menu/${newItem.data.id}`, { method: 'DELETE', headers: headers(staff.token) });
    if (delItemR.status !== 200) fail('DELETE /menu/:id', await json(delItemR));
    pass('DELETE /menu/:id');

    // ── Reservations ─────────────────────────────────────────────────────
    console.log('\nMODULE: Reservations');
    const tablesR = await fetch(`${B}/reservations/tables`, { headers: headers(customer.token) });
    const tablesD = await json(tablesR);
    if (tablesR.status !== 200 || !tablesD.data.length) fail('GET /reservations/tables', tablesD);
    pass(`GET /reservations/tables — ${tablesD.data.length} tables`);

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(20, 0, 0, 0);
    const resvR = await fetch(`${B}/reservations`, {
      method: 'POST', headers: headers(customer.token),
      body: JSON.stringify({ time: tomorrow.toISOString(), partySize: 2 }),
    });
    const resvD = await json(resvR);
    if (resvR.status !== 201) fail('POST /reservations', resvD);
    pass(`POST /reservations — table auto-assigned: ${resvD.data.tableId.slice(0, 8)}...`);

    const cancelR = await fetch(`${B}/reservations/${resvD.data.id}/cancel`, {
      method: 'POST', headers: headers(customer.token),
    });
    if (cancelR.status !== 200) fail('POST /reservations/:id/cancel', await json(cancelR));
    pass('POST /reservations/:id/cancel');

    // ── Orders ───────────────────────────────────────────────────────────
    console.log('\nMODULE: Orders');
    const dish = menuItems[0];
    const orderR = await fetch(`${B}/orders`, {
      method: 'POST', headers: headers(customer.token),
      body: JSON.stringify({ items: [{ menuItemId: dish.id, quantity: 1 }] }),
    });
    const orderD = await json(orderR);
    if (orderR.status !== 201) fail('POST /orders', orderD);
    pass(`POST /orders — total: ₹${orderD.data.total}`);

    const statusR = await fetch(`${B}/orders/${orderD.data.id}/status`, {
      method: 'PATCH', headers: headers(staff.token),
      body: JSON.stringify({ status: 'preparing' }),
    });
    if (statusR.status !== 200) fail('PATCH /orders/:id/status', await json(statusR));
    pass('PATCH /orders/:id/status (placed → preparing)');

    const listOrdR = await fetch(`${B}/orders`, { headers: headers(customer.token) });
    const listOrdD = await json(listOrdR);
    if (listOrdR.status !== 200) fail('GET /orders', listOrdD);
    pass(`GET /orders — ${listOrdD.pagination.total} orders`);

    // ── Inventory ────────────────────────────────────────────────────────
    console.log('\nMODULE: Inventory');
    const invListR = await fetch(`${B}/inventory`, { headers: headers(staff.token) });
    const invListD = await json(invListR);
    if (invListR.status !== 200) fail('GET /inventory', invListD);
    pass(`GET /inventory — ${invListD.pagination.total} items`);

    const lowStockR = await fetch(`${B}/inventory/low-stock`, { headers: headers(staff.token) });
    const lowStockD = await json(lowStockR);
    if (lowStockR.status !== 200) fail('GET /inventory/low-stock', lowStockD);
    pass(`GET /inventory/low-stock — ${lowStockD.data.length} items below threshold`);
    lowStockD.data.forEach((item: any) => console.log(`     ⚠  ${item.name}: ${item.quantity} ${item.unit} (threshold ${item.reorderThreshold})`));

    const invCreateR = await fetch(`${B}/inventory`, {
      method: 'POST', headers: headers(staff.token),
      body: JSON.stringify({ name: 'Test Butter', quantity: 2.0, unit: 'kg', reorderThreshold: 1.0 }),
    });
    const invCreateD = await json(invCreateR);
    if (invCreateR.status !== 201) fail('POST /inventory', invCreateD);
    pass(`POST /inventory — created: ${invCreateD.data.name}, isLowStock: ${invCreateD.data.isLowStock}`);

    const invUpdateR = await fetch(`${B}/inventory/${invCreateD.data.id}`, {
      method: 'PATCH', headers: headers(staff.token),
      body: JSON.stringify({ quantity: 0.5 }),
    });
    const invUpdateD = await json(invUpdateR);
    if (invUpdateR.status !== 200) fail('PATCH /inventory/:id', invUpdateD);
    pass(`PATCH /inventory/:id — quantity updated, isLowStock: ${invUpdateD.data.isLowStock}`);

    // Test: negative stock rejected
    const invNegR = await fetch(`${B}/inventory/${invCreateD.data.id}`, {
      method: 'PATCH', headers: headers(staff.token),
      body: JSON.stringify({ quantity: -5 }),
    });
    if (invNegR.status !== 400) fail('PATCH /inventory/:id (negative quantity should be rejected)', await json(invNegR));
    pass('PATCH /inventory/:id (negative quantity correctly rejected)');

    const invDelR = await fetch(`${B}/inventory/${invCreateD.data.id}`, {
      method: 'DELETE', headers: headers(admin.token),
    });
    if (invDelR.status !== 200) fail('DELETE /inventory/:id', await json(invDelR));
    pass('DELETE /inventory/:id');

    // ── Staff ────────────────────────────────────────────────────────────
    console.log('\nMODULE: Staff');
    const staffListR = await fetch(`${B}/staff`, { headers: headers(admin.token) });
    const staffListD = await json(staffListR);
    if (staffListR.status !== 200) fail('GET /staff', staffListD);
    pass(`GET /staff — ${staffListD.pagination.total} staff members`);
    staffListD.data.forEach((s: any) => console.log(`     👤 ${s.name} — role: ${s.role}, shift: ${s.shift}`));

    const staffItem = staffListD.data[0];
    const staffUpdateR = await fetch(`${B}/staff/${staffItem.id}`, {
      method: 'PATCH', headers: headers(admin.token),
      body: JSON.stringify({ shift: 'night' }),
    });
    if (staffUpdateR.status !== 200) fail('PATCH /staff/:id', await json(staffUpdateR));
    pass('PATCH /staff/:id (shift updated to night)');

    // Test: customer cannot access staff (RBAC guard)
    const staffUnauthorizedR = await fetch(`${B}/staff`, { headers: headers(customer.token) });
    if (staffUnauthorizedR.status !== 403) fail('GET /staff as customer (should be 403)', await json(staffUnauthorizedR));
    pass('GET /staff as customer correctly returns 403 FORBIDDEN');

    // ── Notifications ────────────────────────────────────────────────────
    console.log('\nMODULE: Notifications');
    const notifCreateR = await fetch(`${B}/notifications`, {
      method: 'POST', headers: headers(staff.token),
      body: JSON.stringify({ userId: customer.userId, message: 'Your order is being prepared!', channel: 'in_app' }),
    });
    const notifCreateD = await json(notifCreateR);
    if (notifCreateR.status !== 201) fail('POST /notifications', notifCreateD);
    pass('POST /notifications — created notification for customer');

    const notifListR = await fetch(`${B}/notifications`, { headers: headers(customer.token) });
    const notifListD = await json(notifListR);
    if (notifListR.status !== 200) fail('GET /notifications', notifListD);
    pass(`GET /notifications — ${notifListD.pagination.total} notifications`);

    const notifReadR = await fetch(`${B}/notifications/${notifCreateD.data.id}/read`, {
      method: 'PATCH', headers: headers(customer.token),
    });
    const notifReadD = await json(notifReadR);
    if (notifReadR.status !== 200 || !notifReadD.data.read) fail('PATCH /notifications/:id/read', notifReadD);
    pass('PATCH /notifications/:id/read — notification marked as read');

    const markAllR = await fetch(`${B}/notifications/read-all`, {
      method: 'PATCH', headers: headers(customer.token),
    });
    if (markAllR.status !== 200) fail('PATCH /notifications/read-all', await json(markAllR));
    pass('PATCH /notifications/read-all');

    // ── Billing ──────────────────────────────────────────────────────────
    console.log('\nMODULE: Billing');
    // Create a fresh order for billing test
    const billOrderR = await fetch(`${B}/orders`, {
      method: 'POST', headers: headers(customer.token),
      body: JSON.stringify({ items: [{ menuItemId: dish.id, quantity: 3 }] }),
    });
    const billOrderD = await json(billOrderR);
    if (billOrderR.status !== 201) fail('POST /orders (for billing)', billOrderD);

    const billR = await fetch(`${B}/billing/generate`, {
      method: 'POST', headers: headers(staff.token),
      body: JSON.stringify({ orderId: billOrderD.data.id, discountPercentage: 10, includeServiceCharge: true }),
    });
    const billD = await json(billR);
    if (billR.status !== 200 || !billD.data.receiptId) fail('POST /billing/generate', billD);
    const fin = billD.data.financials;
    pass(`POST /billing/generate — Receipt: ${billD.data.receiptId}`);
    console.log(`     💰 Subtotal: ₹${fin.subtotal}  Discount: ₹${fin.discount}  GST: ₹${fin.taxes.totalGst}  Service: ₹${fin.serviceChargeAmount}  Grand Total: ₹${fin.grandTotal}`);

    const receiptR = await fetch(`${B}/billing/receipt/${billOrderD.data.id}`, {
      headers: headers(customer.token),
    });
    if (receiptR.status !== 200) fail('GET /billing/receipt/:orderId', await json(receiptR));
    pass('GET /billing/receipt/:orderId');

    // ── Done ─────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TESTS PASSED — SmartDine Backend is 100% Operational!');
    console.log('='.repeat(50) + '\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('\n' + err.message);
  process.exit(1);
});
