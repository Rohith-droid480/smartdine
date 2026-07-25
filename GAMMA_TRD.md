# GAMMA_TRD.md — Technical Requirements Document
## Builder: GAMMA | Project: Smart Restaurant Management System | VibeAthon 6.0

**Give this entire file to your ChatGPT as the project brief.** ChatGPT will use it to generate Antigravity prompts (mostly Gemini 3.6 Flash — see Section 5). Alpha (lead) and Beta are working in parallel on their own tracks with their own ChatGPT sessions.

**Important:** Section 3 below (Shared API Contract) is identical to what Alpha and Beta have. Do not rename fields or restructure it — if it seems wrong, flag it to Alpha, don't change it unilaterally, or the three codebases won't merge.

---

## 1. Your Scope (what YOU build)

You own the **staff dashboard** (`apps/admin`). Specifically:
- Staff login (uses same auth system, staff/admin role)
- Orders queue view (live incoming orders, status updates)
- Table management view (table statuses, reservations overview)
- Inventory management view (stock levels, low-stock flags)
- Staff management view (staff list, roles, shifts)
- Sales/analytics view (charts/summary of sales data)
- AI operational insights panel (plain-English summary card)
- AI inventory prediction display (forecast flags on inventory view)

**You do NOT build:** any backend/API code (Alpha owns `server/`), and not the customer-facing app (Beta owns `apps/web`). Build entirely against the contract below — start with mock data, swap to Alpha's real endpoints as he ships them (see sync schedule, Section 7).

---

## 2. Context

Smart Restaurant Management System SaaS for VibeAthon 6.0. Tiers: Bronze (UX) → Silver (Beta's track) → **Gold (staff dashboard — this is entirely YOUR track)** → Platinum (AI features — your insights panel and forecast display are the staff-facing half of this). Your screens are what judges will use to evaluate "does this actually reduce manual effort for restaurant staff" — the Gold-tier judging criterion directly.

Stack: Next.js + TypeScript + Tailwind CSS. You're building `apps/admin`. Charts: use `recharts` (simple, works well with React, no extra setup pain).

---

## 3. Shared API Contract (IDENTICAL for Alpha/Beta/Gamma)

### Core Types

```typescript
export type UserRole = 'customer' | 'staff' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl?: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'free' | 'reserved' | 'occupied';
}

export interface Reservation {
  id: string;
  userId: string;
  tableId: string;
  time: string;
  partySize: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  priceAtOrder: number;
}

export interface Order {
  id: string;
  userId: string;
  tableId?: string;
  items: OrderItem[];
  status: 'placed' | 'preparing' | 'ready' | 'served' | 'billed';
  total: number;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  reorderThreshold: number;
}

export interface Staff {
  id: string;
  userId: string;
  role: string;
  shift: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Endpoints YOU consume (built by Alpha — mock these until his are live)

```
POST   /api/auth/login             { email, password }        -> ApiResponse<User>
GET    /api/auth/me                -> ApiResponse<User>

GET    /api/menu                   -> ApiResponse<MenuItem[]>
PATCH  /api/menu/:id/availability   { available }               -> ApiResponse<MenuItem>

GET    /api/reservations           -> ApiResponse<Reservation[]>  (all, staff view)
PATCH  /api/reservations/:id        { status }                  -> ApiResponse<Reservation>

GET    /api/orders                 -> ApiResponse<Order[]>       (all, staff view)
PATCH  /api/orders/:id/status       { status }                  -> ApiResponse<Order>

GET    /api/inventory               -> ApiResponse<InventoryItem[]>
PATCH  /api/inventory/:id           { quantity }                -> ApiResponse<InventoryItem>

GET    /api/staff                   -> ApiResponse<Staff[]>
POST   /api/staff                   { userId, role, shift }    -> ApiResponse<Staff>

GET    /api/analytics/sales         -> ApiResponse<{ date: string, total: number }[]>

GET    /api/ai/forecast             -> ApiResponse<{ menuItemId: string, predictedDemand: number }[]>
GET    /api/ai/insights              -> ApiResponse<{ summary: string }>
```

**Mock strategy:** Until Alpha's endpoints are live, create a `lib/mockApi.ts` returning realistic fake data matching these exact shapes (make table statuses, order queues, and inventory levels look like a real busy restaurant — this makes your dashboard demo compelling even before real data is wired in). Build all UI against `lib/api.ts` (thin wrapper) so swapping mock → real is a one-file change.

---

## 4. Your Hour-by-Hour Schedule (72 hours)

**H0–H2:** Kickoff, get repo access, confirm `shared/types` from Alpha, set up `apps/admin` skeleton (Next.js + Tailwind + recharts), set up `lib/mockApi.ts` with realistic fake staff-side data.
**H2–H8:** Build staff login screen + basic dashboard shell/navigation (sidebar or tabs: Orders, Tables, Inventory, Staff, Analytics, Insights).
**H8–H14:** Build Orders queue view (list of live orders, status badges, action to advance status: placed → preparing → ready → served).
**H14–H20:** Build Table management view (table grid/list with status: free/reserved/occupied, linked reservation info).
**H20–H24:** Build Inventory management view (list, quantity, low-stock highlight based on `reorderThreshold`).
**H24–H30 (Day 2 start):** Switch to Alpha's real endpoints where live (auth, menu availability toggle should be real by now per his schedule).
**H30–H36:** Build Staff management view (list staff, roles, shifts, simple add-staff form).
**H36–H42:** Build Sales/Analytics view — chart (recharts line/bar) of sales over time using `/api/analytics/sales`, plus a few summary stat cards (today's revenue, order count, avg order value — computed client-side from the data if no dedicated endpoint).
**H42–H48:** Build Inventory Prediction display — add forecast flags to the Inventory view using `/api/ai/forecast` (e.g. a badge: "Predicted shortfall tomorrow" next to low-projected-stock items).
**H48–H54:** Build the AI Operational Insights panel — a prominent card at the top of the dashboard showing `/api/ai/insights` summary, with a refresh button and loading state.
**H54–H60:** Hand off for integration with Alpha — be reachable, fix any issues found. Full staff-side flow test (login → see orders → advance status → check inventory → see insights).
**H60–H66:** UX polish pass: loading skeletons, error toasts, empty states, mobile/tablet responsiveness (staff dashboards are often used on tablets), remove placeholder/test data and console.logs.
**H66–H70:** Support README/demo script writing for your screens (Gold + Platinum staff-facing user stories).
**H70–H72:** Final smoke test on the deployed public URL.

---

## 5. Model Prompting Rules for This Track

**Use Gemini 3.6 Flash for almost everything** — dashboard tables, lists, and forms are exactly the well-specified, repetitive UI work Flash is fast at.

**Use Claude only when:** designing how to present something genuinely ambiguous (e.g. "how should the AI insights summary be visually framed so staff trust and act on it, not ignore it as noise") or reviewing your own code before merge.

**Prompt template (Flash, dashboard table/list):**
```
Build a React (Next.js App Router, TypeScript, Tailwind) component: [e.g. OrdersQueueTable].
Data shape: [paste relevant type, e.g. Order]
Must include: loading state, empty state, error state, uses `lib/api.ts` for fetching.
Include an action button to [e.g. advance order status] calling [relevant PATCH endpoint].
Style: clean data-dense dashboard aesthetic — [pick and stay consistent: e.g. neutral background, colored status badges, compact rows].
```

**Prompt template (Flash, replicate pattern for similar screens):**
```
Here's an existing dashboard table component I built: [paste component]
Build a similar one for [Inventory / Staff / etc.], same structure, adapted to this data shape: [paste type].
```

**Prompt template (Flash, chart):**
```
Build a sales analytics component using recharts, showing [date, total] data over time as a [line/bar] chart, plus 3 summary stat cards above it (total revenue, order count, average order value) computed from the same data array. TypeScript, Tailwind for surrounding layout.
```

**Prompt template (Claude, ambiguous presentation decision):**
```
I need to design how staff see [AI insights / forecast flags] in a way that's immediately useful in a 2-second glance, not just data dumped on screen.
Data available: [paste type/example response]
Explain the reasoning for the presentation approach, then describe (or code) the component.
```

**Escalate to Alpha (not Claude) if:** an endpoint doesn't return data in the shape you expect, or you need a field that isn't in the contract. Don't invent a workaround on your side.

---

## 6. UI/UX Standards (must follow)

- Data-dense but scannable — staff need to act fast; prioritize clarity over decoration.
- Consistent status badge colors across Orders/Tables/Inventory (e.g. same "warning" color for low stock everywhere).
- Every list/table: loading, empty, and populated states.
- Real, restaurant-appropriate placeholder data (a real fake menu/inventory list), never generic test data in what a judge will see.
- Tablet/mobile responsive minimum viable — staff dashboards are plausibly used on tablets in a real restaurant, and this is worth mentioning in the demo.
- The AI insights card should look intentional and trustworthy (clear labeling as AI-generated, a timestamp/refresh action) — not a gimmick.

---

## 7. Sync Points With Alpha (check in at these hours)

- **H2:** Confirm you have `shared/types` and repo access.
- **H18:** Alpha's Inventory/Staff endpoints should be going live — confirm and start switching from mocks.
- **H24:** Confirm auth is fully real by this point.
- **H30:** Alpha's Analytics endpoint should be live — confirm.
- **H48:** Alpha's AI endpoints (forecast, insights) should be live — confirm and wire in.
- **H54–60:** Active integration window with Alpha — be reachable.

If any sync point slips, keep building against mocks and flag it — don't block yourself waiting.

---

## 8. Definition of Done (Gamma)

- [ ] All staff dashboard screens built and using real (not mock) API data
- [ ] Orders, Tables, Inventory, Staff, Analytics views all functional
- [ ] AI insights panel and inventory forecast flags wired to real endpoints, with proper loading/error states
- [ ] Consistent, scannable dashboard design across all views
- [ ] No console errors, no placeholder text, tablet/mobile-responsive
- [ ] Verified working on the actual deployed public URL, not just localhost
