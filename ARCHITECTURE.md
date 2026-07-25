# ARCHITECTURE.md — Smart Restaurant Management System

Production-inspired, hackathon-realistic. Every decision below optimizes for: **fast parallel building by a 3-person team of mixed skill, and a demo that doesn't break.**

---

## 1. High-Level Architecture

```
┌─────────────────────┐        ┌─────────────────────┐
│   Customer Web App   │        │   Staff Dashboard     │
│   (Next.js, /app)     │        │   (Next.js, /admin)   │
└──────────┬───────────┘        └──────────┬───────────┘
           │                                │
           └──────────────┬─────────────────┘
                          │  REST/JSON (or tRPC)
                ┌─────────▼─────────┐
                │   API Server        │
                │  Node.js + Express  │
                │  ── Auth service    │
                │  ── Orders service  │
                │  ── Menu service    │
                │  ── Reservation svc │
                │  ── Inventory svc   │
                │  ── Billing service │
                │  ── AI service ─────┼──┐
                └─────────┬──────────┘  │
                          │             │
                ┌─────────▼─────────┐   │
                │   PostgreSQL /     │   │
                │   Supabase          │   │
                └───────────────────┘   │
                                         │
                         ┌───────────────▼───────────────┐
                         │   AI Pipeline                   │
                         │  ── Forecasting (stat model)     │
                         │  ── Recommendation engine         │
                         │  ── Assistant (Gemini/Claude API) │
                         │  ── Insights generator             │
                         └────────────────────────────────┘
```

Single shared backend, two frontend surfaces (customer + staff), one database, one AI service module. Keep it monolithic — a hackathon microservices split wastes hours on infra with zero judge-visible payoff.

---

## 2. Component Breakdown

| Component | Responsibility |
|---|---|
| **Customer App** | Auth, menu browsing, reservations, ordering, order tracking, notifications, AI assistant chat |
| **Staff Dashboard** | Orders queue, table status, inventory, staff management, sales/analytics, AI insights panel |
| **API Server** | All business logic, auth, validation, orchestration between DB and AI pipeline |
| **Database** | Source of truth: users, menu items, orders, reservations, tables, inventory, staff, transactions |
| **AI Service** | Forecasting model, recommendation logic, assistant (LLM-backed, grounded in live DB data), insight generation |
| **Auth Provider** | Email/password + OTP verification, Google OAuth, JWT session issuance |

---

## 3. Folder Structure

```
smart-restaurant/
├── apps/
│   ├── web/                     # Next.js customer app
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── menu/
│   │   │   ├── reservations/
│   │   │   ├── orders/
│   │   │   └── assistant/
│   │   ├── components/
│   │   └── lib/
│   └── admin/                   # Next.js staff dashboard
│       ├── app/
│       │   ├── orders/
│       │   ├── tables/
│       │   ├── inventory/
│       │   ├── staff/
│       │   ├── analytics/
│       │   └── insights/
│       ├── components/
│       └── lib/
├── server/                      # Node.js + Express API
│   ├── src/
│   │   ├── routes/              # auth.ts, menu.ts, orders.ts, reservations.ts,
│   │   │                        # inventory.ts, staff.ts, billing.ts, ai.ts
│   │   ├── services/            # business logic per domain
│   │   ├── models/              # DB schema/ORM models
│   │   ├── middleware/          # auth guard, error handler, role check
│   │   ├── ai/                  # forecasting.ts, recommend.ts, assistant.ts, insights.ts
│   │   └── config/
│   ├── seed/                    # demo data seeding scripts (critical, see BUILD_PLAN)
│   └── tests/
├── shared/
│   └── types/                   # shared TS types / API contract (source of truth)
├── docs/
│   └── README.md
└── .env.example
```

**Rule:** `shared/types` is written first (H1) and is the contract both frontends and backend build against. This is what unblocks parallel work by low/mid-experience teammates.

---

## 4. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React) | Fast scaffolding, great with Gemini/Claude code generation, easy Vercel deploy |
| Styling | Tailwind CSS | Fast, consistent, avoids bikeshedding on CSS |
| Backend | Node.js + Express | Matches suggested stack, simple mental model for less experienced teammates reading the code |
| Database | PostgreSQL (via Supabase) | Relational data (orders, inventory, tables) fits SQL well; Supabase gives instant hosted DB + built-in auth helpers, saving hours |
| ORM | Prisma | Type-safe queries, fast schema iteration, auto-generates types matching `shared/types` |
| Auth | Supabase Auth or custom JWT + OTP (email) + Google OAuth | Supabase Auth handles OTP + OAuth out of the box — use it unless you need custom flows |
| AI (LLM) | Claude or Gemini API (via Antigravity access) | Assistant + insight generation (grounded, structured prompts) |
| AI (forecasting) | Simple JS/Python moving-average or lightweight regression (e.g. `simple-statistics` npm package) | Fast, explainable, robust — no ML infra needed |
| Deployment | Vercel (frontends) + Railway/Render (API) + Supabase (DB) | Fastest path to a public URL, minimal DevOps |
| Version control | GitHub | Required by submission rules |

---

## 5. AI Pipeline (the Platinum differentiator)

### 5a. Demand Forecasting + Inventory Prediction
- **Input:** seeded historical order data (item, quantity, date/time, day-of-week).
- **Method:** moving average per dish, adjusted by day-of-week multiplier. (Upgrade to simple linear regression only if time allows — judges reward correctness and clear explanation over model sophistication.)
- **Output:** predicted demand for next day per dish → compared against current inventory levels → flags ("Chicken stock likely insufficient for tomorrow's predicted demand").
- **Where it shows up:** staff dashboard "Insights" panel + inventory page warning badges.

### 5b. AI Assistant / Recommendations
- **Grounding is mandatory** — the assistant must query live menu + availability + (optionally) customer order history before generating a response. Never let it free-hallucinate menu items.
- **Pattern:** retrieval-lite — fetch relevant DB rows, inject into the LLM prompt as context, constrain the response to only reference provided data.
- **Where it shows up:** customer app chat widget ("What do you recommend today?" / "Is the paneer tikka available?").

### 5c. Operational Insights Generator
- Aggregate live dashboard stats (wait times, order volume, top sellers) → feed as structured data to LLM → generate a short plain-English summary refreshed periodically.
- **Where it shows up:** top of staff dashboard, "Today's Insights" card.

---

## 6. Data Model (core entities)

- **User** (id, role: customer/staff/admin, auth provider info)
- **Restaurant** (id, name, config) — supports future multi-tenant, single row for hackathon
- **MenuItem** (id, name, price, available: bool, category)
- **Table** (id, capacity, status: free/reserved/occupied)
- **Reservation** (id, userId, tableId, time, partySize, status)
- **Order** (id, userId, tableId?, items[], status, createdAt, total)
- **OrderItem** (orderId, menuItemId, quantity, price)
- **InventoryItem** (id, name, quantity, unit, reorderThreshold)
- **Staff** (id, userId, role, shift)
- **Notification** (id, userId, message, read, channel)

---

## 7. Data Flow (example: customer orders a dish)

1. Customer browses `/menu` → API returns live `MenuItem` list with `available` flags.
2. Customer places order → API creates `Order` + `OrderItem` rows, decrements relevant `InventoryItem` quantities.
3. API triggers `Notification` for staff dashboard (new order appears in orders queue in near-real-time via polling or a lightweight websocket).
4. Forecasting job (can run on a schedule or on-demand for demo) reads recent `Order`/`OrderItem` history to update predictions.
5. Staff dashboard "Insights" panel calls AI service, which pulls current `Order`, `Table`, `InventoryItem` state and generates a summary.

---

## 8. Security Considerations

- Passwords never stored in plaintext — rely on Supabase Auth / bcrypt if custom.
- Role-based access control enforced server-side (middleware), never trust frontend role checks alone.
- Environment variables for all secrets (DB URL, JWT secret, OAuth client secret, AI API keys) — never hardcoded, `.env` gitignored, `.env.example` committed instead.
- Input validation on all API routes (e.g. Zod schemas) to prevent malformed data reaching the DB or AI prompts (prompt-injection-lite risk if user text is echoed into assistant prompts — sanitize/constrain).
- Rate-limit the AI assistant endpoint to avoid runaway API costs during demo/judging traffic.

---

## 9. Scalability Considerations (mention in docs, don't over-build)

- Current design: single restaurant tenant. Schema supports adding a `restaurantId` foreign key everywhere for multi-tenant SaaS as a "future improvement."
- DB indexes on frequently queried columns (`orders.status`, `orders.createdAt`, `menuItems.available`).
- AI forecasting job is designed to run as a background/cron job in production (for hackathon, on-demand trigger or simple interval is fine).
- Stateless API server design (JWT-based auth) means it can scale horizontally behind a load balancer in a real deployment.

---

## 10. Deployment Approach

- Frontend (`web`, `admin`): Vercel — two projects from the same monorepo, or two separate Vercel deployments pointing at different subfolders.
- Backend: Railway or Render — single Node service, environment variables configured in platform dashboard.
- Database: Supabase managed Postgres — no separate DB hosting needed.
- Deploy early (Day 1) with a skeleton, redeploy continuously — never a single deploy at the end (see BUILD_PLAN.md Risk Management).

---

## 11. Future Improvements (for README/pitch — shows judges you understand production concerns)

- Multi-tenant support (multiple restaurants on one platform)
- Real payment gateway integration (Stripe/Razorpay)
- SMS notifications via Twilio (currently mocked as in-app/email)
- More sophisticated ML forecasting (proper time-series model, e.g. Prophet) as order history data accumulates
- Real-time updates via WebSockets instead of polling
- Kitchen display system (KDS) integration
- Loyalty/rewards program tied into the recommendation engine
