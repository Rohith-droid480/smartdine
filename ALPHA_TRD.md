# ALPHA_TRD.md — Technical Requirements Document
## Builder: ALPHA (Lead) | Project: Smart Restaurant Management System | VibeAthon 6.0

**Give this entire file to your ChatGPT as the project brief.** ChatGPT will use it to generate Antigravity prompts (Claude for heavy work, Gemini 3.6 Flash for boilerplate/UI) per the Model Prompting rules in Section 8.

**Your teammates (Beta, Gamma) have their own TRDs and are working in parallel, independently, each with their own ChatGPT session.** The only thing that MUST stay identical across all three of you is Section 3 (Shared API Contract) — do not let your ChatGPT/Claude "improve" or rename anything in it without telling Beta and Gamma to update their copies too.

---

## 1. Your Scope (what YOU build — nothing outside this list unless asked)

- Project scaffolding (monorepo structure, both frontend apps' skeletons so Beta/Gamma can start immediately)
- Database schema + migrations (PostgreSQL via Supabase, Prisma ORM)
- Authentication (email/password + OTP, Google OAuth), role-based access middleware
- ALL backend API routes (you own the entire `server/` — Beta and Gamma only build frontend, calling your endpoints)
- AI pipeline: demand forecasting, recommendation/assistant logic, operational insights generator
- Demo data seeding (fake 2–3 weeks of realistic restaurant order history — this is critical, not optional)
- Deployment (backend + DB + both frontends)
- Integration: merging Beta's and Gamma's frontend code against your live API
- Final code review of all merged code
- README, submission packaging

**You do NOT build:** customer-facing UI screens (Beta owns this) or staff dashboard UI screens (Gamma owns this). You build the API they call and provide mock-matching contracts early so they're never blocked on you.

---

## 2. Problem Statement (context for your ChatGPT)

Building a Smart Restaurant Management System SaaS. Judging tiers: Bronze (UX) → Silver (auth + digitized workflows: menu, availability, reservations, orders, queue, billing, notifications) → Gold (staff dashboard: orders, tables, inventory, staff, customers, sales, analytics) → Platinum (AI: recommendations, inventory prediction, demand forecasting, smart notifications, operational insights, AI assistance). Do not build a generic clone — the differentiator is a well-executed AI layer grounded in real data, not a bolt-on chatbot.

Tech stack: Next.js (both frontends), Node.js + Express (API), PostgreSQL via Supabase, Prisma ORM, Tailwind CSS, Claude/Gemini APIs for AI features, Vercel + Railway/Render + Supabase for deployment.

---

## 3. Shared API Contract (IDENTICAL across Alpha/Beta/Gamma — do not modify unilaterally)

### Core Types (`shared/types/index.ts`)

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
  time: string; // ISO datetime
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
  role: string; // e.g. 'waiter', 'chef', 'manager'
  shift: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  channel: 'in-app' | 'email';
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### API Endpoints (you build ALL of these)

```
Auth:
  POST   /api/auth/signup            { email, password, name }
  POST   /api/auth/verify-otp        { email, otp }
  POST   /api/auth/login             { email, password }
  GET    /api/auth/google/callback
  GET    /api/auth/me                -> User

Menu:
  GET    /api/menu                   -> MenuItem[]
  PATCH  /api/menu/:id/availability  { available }  [staff only]

Reservations:
  GET    /api/reservations           -> Reservation[] (own, or all if staff)
  POST   /api/reservations           { tableId, time, partySize }
  PATCH  /api/reservations/:id       { status }  [staff only for confirm/cancel]

Orders:
  GET    /api/orders                 -> Order[] (own, or all if staff)
  POST   /api/orders                 { tableId?, items: [{menuItemId, quantity}] }
  PATCH  /api/orders/:id/status      { status }  [staff only]

Inventory:
  GET    /api/inventory              -> InventoryItem[]  [staff only]
  PATCH  /api/inventory/:id          { quantity }  [staff only]

Staff:
  GET    /api/staff                  -> Staff[]  [admin only]
  POST   /api/staff                  { userId, role, shift }  [admin only]

Notifications:
  GET    /api/notifications          -> Notification[] (own)
  PATCH  /api/notifications/:id/read

AI:
  GET    /api/ai/recommendations     -> MenuItem[] (personalized, for logged-in user)
  POST   /api/ai/assistant           { message }  -> { reply: string }
  GET    /api/ai/forecast            -> { menuItemId, predictedDemand }[]  [staff only]
  GET    /api/ai/insights            -> { summary: string }  [staff only]

Analytics:
  GET    /api/analytics/sales        -> { date, total }[]  [staff only]
```

All responses wrapped in `ApiResponse<T>`. All routes except `/api/auth/*` and `GET /api/menu` require a valid session (JWT/cookie).

**Give Beta and Gamma a running URL + these exact contracts within the first 2 hours so they can build against mocks immediately, then swap to your live endpoints as you ship them.**

---

## 4. Your Hour-by-Hour Schedule (72 hours)

**H0–H2:** Kickoff, lock stack decisions, init monorepo (`apps/web`, `apps/admin`, `server`, `shared/types`), push `shared/types` to repo immediately — this unblocks Beta/Gamma.
**H2–H6:** DB schema + Prisma migrations, Supabase project setup, seed script skeleton.
**H6–H12:** Auth: email/password + OTP + Google OAuth, role middleware, `/api/auth/*` live.
**H12–H18:** Menu, Reservation, Order routes live (real DB-backed, not mocks) — this is the critical unblock for Beta.
**H18–H24:** Inventory, Staff routes live — unblock for Gamma. Deploy skeleton to production (even if incomplete) — get a public URL working end to end today.
**H24–H30:** Billing logic, Notification routes, real-time-ish order status updates (polling endpoint is fine).
**H30–H36:** Analytics/sales aggregation endpoint (Gold, for Gamma's dashboard).
**H36–H42:** Seed realistic 2–3 week fake order history dataset (must be genuinely realistic — this feeds forecasting).
**H42–H48:** Build forecasting (`/api/ai/forecast`) — moving average per dish, day-of-week adjusted, compared to inventory.
**H48–H54:** Build AI assistant (`/api/ai/assistant`) — grounded in live menu/availability data, and insights generator (`/api/ai/insights`).
**H54–H60:** Integration: pull Beta's and Gamma's frontend branches, connect to your live API, fix contract mismatches.
**H60–H66:** Full end-to-end bug bash across both apps. Redeploy final version.
**H66–H70:** README, AI usage documentation, PPT/PDF submission prep, backup demo video.
**H70–H72:** Final checklist, submit early.

---

## 5. Model Prompting Rules for This Track

**Use Claude for:** schema design, auth implementation, AI pipeline (forecasting/assistant/insights logic), API contract enforcement, code review of Beta/Gamma pull requests, debugging integration issues.

**Use Gemini 3.6 Flash for:** repetitive CRUD route boilerplate once you've established the pattern with Claude for the first route, quick syntax lookups, minor bug fixes.

**Prompt template (Claude, schema/logic work):**
```
Context: [paste Section 3 contract + relevant existing code]
Task: [specific backend feature]
Constraints: must match shared/types exactly, use Prisma, follow {success,data,error} response shape, enforce role-based access.
Explain your approach, then provide the implementation.
```

**Prompt template (Flash, CRUD boilerplate):**
```
Generate an Express route file for [entity], following this existing pattern exactly: [paste an existing route file you already built]
Entity shape: [paste from Section 3]
Include Zod validation, matching response shape, role check per Section 3 endpoint list.
```

---

## 6. Coding & Review Standards

- TypeScript everywhere. Business logic in `services/`, routes stay thin.
- Every route: input validation, try/catch, consistent `ApiResponse<T>` shape, correct HTTP status codes.
- No secrets hardcoded — `.env` only, `.env.example` committed.
- When reviewing Beta/Gamma PRs: check they're calling real endpoints (not leftover mocks) before merge, check they match Section 3 types exactly.

---

## 7. Sync Points With Beta & Gamma (put these in your calendar/reminders)

- **H2:** Confirm Beta and Gamma both have `shared/types` and the repo URL.
- **H12:** Beta needs real Menu/Reservation/Order endpoints — confirm live.
- **H18:** Gamma needs real Inventory/Staff endpoints — confirm live.
- **H30:** Gamma needs Analytics endpoint — confirm live.
- **H48:** Both need AI endpoints (recommendations, assistant, forecast, insights) — confirm live.
- **H54–60:** Active integration window — expect to be reachable for both teammates.

---

## 8. Definition of Done (Alpha)

- [ ] All endpoints in Section 3 live and tested against real DB
- [ ] Auth fully functional (OTP + Google OAuth) with role enforcement
- [ ] Forecasting, assistant, and insights all return real, data-grounded output (no hardcoded fake responses)
- [ ] Realistic seed data in place
- [ ] Beta's and Gamma's frontends successfully integrated and deployed
- [ ] Public deployment verified working in incognito
- [ ] README + submission materials complete
