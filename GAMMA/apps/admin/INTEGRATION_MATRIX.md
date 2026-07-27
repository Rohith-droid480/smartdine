# SmartDine GAMMA — Alpha Backend Integration Traceability Matrix (RC2)

**Project:** Smart Restaurant Management System (GAMMA Track)  
**Target Application:** `apps/admin` (Staff Dashboard)  
**Version:** Release Candidate 2 (RC2)  
**Date:** July 26, 2026  

---

## 1. Traceability Matrix Overview

This matrix maps every frontend API method defined in [`lib/api.ts`](file:///d:/GAMMA/apps/admin/lib/api.ts) directly to its corresponding shared TypeScript interface, expected Alpha backend endpoint, HTTP method, authentication requirements, and integration readiness status.

| API Method | Shared TypeScript Interface | Backend Endpoint | HTTP Method | Auth Required | Status / Integration Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `login(credentials)` | `LoginCredentials`, `AuthResponse` | `/api/auth/login` | `POST` | Public | **Ready**. Returns JWT token + User object. Token saved in localStorage. |
| `getCurrentUser()` | `User` | `/api/auth/me` | `GET` | Bearer JWT | **Ready**. Fetches active staff profile context. |
| `getMenu()` | `MenuItem[]` | `/api/menu` | `GET` | Bearer JWT | **Ready**. Fetches menu categories and availability. |
| `updateMenuItemAvailability(id, isAvailable)` | `MenuItem` | `/api/menu/:id/availability` | `PATCH` | Bearer JWT | **Ready**. Updates item availability flag. |
| `getOrders()` | `Order[]` | `/api/orders` | `GET` | Bearer JWT | **Ready**. Fetches live dine-in, takeaway, and delivery orders. |
| `updateOrderStatus(id, status)` | `Order` | `/api/orders/:id/status` | `PATCH` | Bearer JWT | **Ready**. Advances status (`placed`, `preparing`, `ready`, `served`, `billed`). |
| `getReservations()` | `Reservation[]` | `/api/reservations` | `GET` | Bearer JWT | **Ready**. Fetches table reservations. |
| `updateReservation(id, updates)` | `Reservation` | `/api/reservations/:id` | `PATCH` | Bearer JWT | **Ready**. Updates reservation status and details. |
| `getInventory()` | `InventoryItem[]` | `/api/inventory` | `GET` | Bearer JWT | **Ready**. Fetches ingredient stock levels and thresholds. |
| `updateInventoryItem(id, updates)` | `InventoryItem` | `/api/inventory/:id` | `PATCH` | Bearer JWT | **Ready**. Updates stock quantity and threshold values. |
| `getStaff()` | `StaffMember[]` | `/api/staff` | `GET` | Bearer JWT | **Ready**. Fetches employee roster and shift statuses. |
| `createStaffMember(data)` | `StaffMember` | `/api/staff` | `POST` | Bearer JWT | **Ready**. Creates new staff account. |
| `getSalesAnalytics()` | `SalesAnalytics` | `/api/analytics/sales` | `GET` | Bearer JWT | **Ready**. Fetches total sales, order counts, AOV, and daily trends. |
| `getAIForecast()` | `AIForecast` | `/api/ai/forecast` | `GET` | Bearer JWT | **Ready**. Fetches hourly demand forecast. |
| `getAIInsights()` | `AIInsight[]` | `/api/ai/insights` | `GET` | Bearer JWT | **Ready**. Fetches operational risk alerts and recommendations. |

---

## 2. API Contract Compliance & Uncertainty Analysis

1. **Order Status Normalization**:
   - Shared Type: `OrderStatus = 'placed' | 'preparing' | 'ready' | 'served' | 'billed' | 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'`
   - **Note**: The frontend normalizer ([`lib/order-utils.ts`](file:///d:/GAMMA/apps/admin/lib/order-utils.ts)) gracefully maps legacy uppercase database statuses (`PENDING` -> `placed`, `CANCELLED` -> `billed`) to prevent runtime crashes if Alpha emits uppercase enum strings.

2. **Table Derivation from Reservations**:
   - Alpha contract does not expose `GET /api/tables`.
   - **Frontend Architecture**: [`hooks/useTables.ts`](file:///d:/GAMMA/apps/admin/hooks/useTables.ts) derives table seating states (`free`, `reserved`, `occupied`) dynamically from `api.getReservations()`. No custom endpoints invented.

3. **Bearer Token Headers**:
   - During mock phase, `lib/api.ts` simulates async network latency (150ms).
   - Upon Alpha deployment, replace mock handlers with `fetch(url, { headers: { Authorization: 'Bearer ' + token } })`.
