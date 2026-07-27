import { signAccessToken } from './src/utils/jwt';
import http from 'http';

const staffToken = signAccessToken({
  sub: 'usr_staff_sync_001',
  email: 'staff_sync@smartdine.com',
  role: 'staff',
});

async function apiCall(method: string, path: string, token?: string, body?: any): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:4000${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 500, data: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode || 500, data: raw });
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

async function runCrossSystemAudit() {
  console.log('====================================================');
  console.log('PART 1: CUSTOMER -> STAFF SYNCHRONIZATION');
  console.log('====================================================');

  // 1. Fetch Staff Queue before & get existing user ID
  const staffBefore = await apiCall('GET', '/api/v1/orders', staffToken);
  const queueBeforeCount = staffBefore.data?.data?.length || 0;
  const existingOrder = staffBefore.data?.data[0];
  const validUserId = existingOrder?.userId || 'usr_customer_1';
  console.log(`[Staff Queue BEFORE]: Total Orders in Queue = ${queueBeforeCount}`);
  console.log(`[Valid User ID from DB]: ${validUserId}`);

  const customerToken = signAccessToken({
    sub: validUserId,
    email: 'customer_sync@smartdine.com',
    role: 'customer',
  });

  // 2. Fetch Menu and Tables to get valid IDs
  const menuRes = await apiCall('GET', '/api/v1/menu');
  const availableItems = menuRes.data?.data || [];
  const testItem = availableItems[0];

  const tablesRes = await apiCall('GET', '/api/v1/reservations/tables', customerToken);
  const validTable = (tablesRes.data?.data || []).find((t: any) => t.status === 'free') || tablesRes.data?.data[0];
  console.log(`[Selected Menu Item]: ${testItem.name} (ID: ${testItem.id}, Price: ₹${testItem.price})`);
  console.log(`[Selected Table]: Table #${validTable?.number} (ID: ${validTable?.id})`);

  // 3. Customer places real order
  const orderPayload = {
    tableId: validTable.id,
    items: [
      { menuItemId: testItem.id, quantity: 2 }
    ]
  };
  const createRes = await apiCall('POST', '/api/v1/orders', customerToken, orderPayload);
  console.log(`[Customer Order POST Response (Status ${createRes.status})]:`);
  console.log(JSON.stringify(createRes.data, null, 2));

  const newOrderId = createRes.data?.data?.id;
  if (!newOrderId) {
    console.error('FAILED TO CREATE ORDER');
    return;
  }

  // 4. Fetch Staff Queue after
  const staffAfter = await apiCall('GET', '/api/v1/orders', staffToken);
  const queueAfterCount = staffAfter.data?.data?.length || 0;
  const createdInQueue = (staffAfter.data?.data || []).find((o: any) => o.id === newOrderId);
  console.log(`[Staff Queue AFTER]: Total Orders in Queue = ${queueAfterCount} (Diff: +${queueAfterCount - queueBeforeCount})`);
  console.log(`[Order #${newOrderId.substring(0, 8)} in Staff Queue]: Status = "${createdInQueue?.status}"`);

  console.log('\n====================================================');
  console.log('PART 2: STAFF -> CUSTOMER SYNCHRONIZATION');
  console.log('====================================================');

  const transitions = ['preparing', 'ready', 'served', 'billed'];
  for (const nextStatus of transitions) {
    // Staff updates status
    const updateRes = await apiCall('PATCH', `/api/v1/orders/${newOrderId}/status`, staffToken, { status: nextStatus });
    console.log(`[Staff PATCH /orders/${newOrderId.substring(0,8)}/status -> "${nextStatus}" (Status ${updateRes.status})]:`);

    // Customer checks tracker immediately
    const customerTracker = await apiCall('GET', `/api/v1/orders/${newOrderId}`, customerToken);
    console.log(`  └─► [Customer GET /orders/${newOrderId.substring(0,8)} Tracker]: Status = "${customerTracker.data?.data?.status}"`);
  }

  console.log('\n====================================================');
  console.log('PART 3: RESERVATION SYNCHRONIZATION');
  console.log('====================================================');

  // 1. Fetch tables layout before
  const freeTable = (tablesRes.data?.data || []).find((t: any) => t.status === 'free');
  console.log(`[Table Selected for Booking]: Table #${freeTable?.number} (ID: ${freeTable?.id}, Status: "${freeTable?.status}")`);

  // 2. Customer creates reservation
  const reservationTime = new Date(Date.now() + 86400000).toISOString();
  const resBooking = await apiCall('POST', '/api/v1/reservations', customerToken, {
    tableId: freeTable.id,
    partySize: 4,
    time: reservationTime
  });
  console.log(`[Reservation POST Response (Status ${resBooking.status})]: ID = ${resBooking.data?.data?.id}`);

  // 3. Verify Table is reserved
  const tablesDuring = await apiCall('GET', '/api/v1/reservations/tables', customerToken);
  const reservedTable = (tablesDuring.data?.data || []).find((t: any) => t.id === freeTable.id);
  console.log(`[Table Status DURING Reservation]: Table #${reservedTable?.number} Status = "${reservedTable?.status}"`);

  // 4. Cancel Reservation
  const reservationId = resBooking.data?.data?.id;
  const cancelRes = await apiCall('DELETE', `/api/v1/reservations/${reservationId}`, customerToken);
  console.log(`[Reservation DELETE Response (Status ${cancelRes.status})]: Message = "${cancelRes.data?.message}"`);

  // 5. Verify Table status restored
  const tablesAfter = await apiCall('GET', '/api/v1/reservations/tables', customerToken);
  const restoredTable = (tablesAfter.data?.data || []).find((t: any) => t.id === freeTable.id);
  console.log(`[Table Status AFTER Cancellation]: Table #${restoredTable?.number} Status = "${restoredTable?.status}"`);

  console.log('\n====================================================');
  console.log('PART 4: ANALYTICS SYNCHRONIZATION');
  console.log('====================================================');

  const insightsBefore = await apiCall('GET', '/api/v1/ai/insights', staffToken);
  const salesInsightBefore = (insightsBefore.data?.data || []).find((i: any) => i.id.startsWith('ins_rev'));
  console.log(`[Analytics BEFORE New Order]: "${salesInsightBefore?.description}"`);

  // Create and complete another order to test analytics update
  const tempOrder = await apiCall('POST', '/api/v1/orders', customerToken, {
    tableId: validTable.id,
    items: [{ menuItemId: testItem.id, quantity: 1 }]
  });
  const tempOrderId = tempOrder.data?.data?.id;
  await apiCall('PATCH', `/api/v1/orders/${tempOrderId}/status`, staffToken, { status: 'billed' });

  const insightsAfter = await apiCall('GET', '/api/v1/ai/insights', staffToken);
  const salesInsightAfter = (insightsAfter.data?.data || []).find((i: any) => i.id.startsWith('ins_rev'));
  console.log(`[Analytics AFTER Order Billed]: "${salesInsightAfter?.description}"`);

  console.log('\n====================================================');
  console.log('PART 5: INVENTORY SYNCHRONIZATION');
  console.log('====================================================');

  const invRes = await apiCall('GET', '/api/v1/inventory', staffToken);
  console.log(`[Inventory Check]: Total Items = ${invRes.data?.data?.length || 0}`);
  if (invRes.data?.data?.length > 0) {
    console.log(`[Sample Item]: ${invRes.data.data[0].name} - Stock: ${invRes.data.data[0].quantity} ${invRes.data.data[0].unit}`);
  }

  console.log('\n====================================================');
  console.log('PART 6: FAILURE SYNCHRONIZATION');
  console.log('====================================================');

  // Duplicate status update test
  const dupUpdate = await apiCall('PATCH', `/api/v1/orders/${tempOrderId}/status`, staffToken, { status: 'billed' });
  console.log(`[Duplicate Status Update (Already Billed) Response (Status ${dupUpdate.status})]:`);
  console.log(JSON.stringify(dupUpdate.data, null, 2));

  // Expired Token test
  const badTokenRes = await apiCall('GET', '/api/v1/orders', 'invalid_expired_token_123');
  console.log(`[Expired/Invalid JWT Request (Status ${badTokenRes.status})]: Error = "${badTokenRes.data?.error || badTokenRes.data?.message}"`);
}

runCrossSystemAudit().catch(console.error);
