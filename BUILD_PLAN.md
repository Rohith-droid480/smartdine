# BUILD_PLAN.md — Smart Restaurant Management System (VibeAthon 6.0)

**Duration:** 72 hours (25 Jul 10:00 AM IST → 27 Jul 11:49 PM IST)
**Team:** 3 (1 lead builder, 2 low/mid-experience builders)
**Target:** Platinum + Bonus (User Stories 1–5, done well, not just done)

---

## 0. Non-negotiable strategic framing

Platinum is **not** a separate feature set — it's Bronze→Gold executed cleanly, with a real AI layer on top (User Story 5). Teams fail Platinum by:
- Building Gold badly (buggy dashboards) and hoping AI distracts judges.
- Bolting on an AI chatbot that doesn't touch real data ("GPT wrapper" smell).
- Having a broken or slow live deployment on demo day.

So the plan is **demo-first**: every hour block below produces something you could show a judge *right now*, even if incomplete. Never enter a "big bang integration" phase at the end.

**Chosen AI differentiator (recommend locking this in Hour 1):**
1. **Demand forecasting + inventory prediction** — simple time-series/statistical model on order history predicting next-day demand per dish and flagging low-stock ingredients.
2. **AI customer assistant** — recommends dishes based on order history/preferences + answers menu/availability questions, grounded in real live-menu data (not hallucinated).
3. **Operational insights panel** — auto-generated plain-English summary for staff ("Table 4 has been waiting 22 min", "Paneer Tikka demand up 40% vs last Friday").

These three cover all of User Story 5's examples with only two real backend concepts (forecasting + RAG-lite assistant) — depth over breadth.

---

## 1. Team Roles (fixed for the whole hackathon)

| Role | Person | Owns |
|---|---|---|
| **Lead Builder (you)** | You | Architecture, auth, DB schema, AI pipeline, backend business logic, integration, deployment, final polish, demo script |
| **Builder A** | Teammate 1 (low/mid) | Customer-facing frontend screens (menu, reservation, order, notifications UI) — built from your specs via Gemini Flash |
| **Builder B** | Teammate 2 (low/mid) | Staff dashboard frontend (orders, tables, inventory, staff, analytics UI) — built from your specs via Gemini Flash |

**Rule:** Teammates never make architecture or schema decisions. They implement UI/CRUD against an API contract you define upfront (see ARCHITECTURE.md). This is what makes low/mid-experience teammates productive instead of a bottleneck.

---

## 2. Hour-by-Hour Plan

### Day 1 (Hours 0–24) — Foundation + Bronze/Silver

**H0–H1 — Kickoff & Lock Decisions**
- Attend kickoff, confirm PS matches what's expected.
- Lock: restaurant concept/theming (pick something memorable, e.g. a real cuisine niche), tech stack, AI differentiator (above), DB schema v1, API contract v1.
- Create GitHub repo (private until final hours, or public per rules — check submission rules; make public before deadline), branch strategy (see Git Workflow below).

**H1–H3 — Scaffolding**
- Lead: initialize backend (Node/Express) + frontend (Next.js) monorepo, connect DB (Postgres/Supabase recommended for structured relational data — orders, inventory, tables), set up auth skeleton (email/OTP + Google OAuth).
- Builder A & B: receive component specs, start static UI shells in parallel (no real data yet — mock JSON).

**H3–H8 — Core Auth + Digital Menu (Silver start)**
- Lead: finish auth (email/password + OTP, Google OAuth), role-based access (customer vs staff vs admin).
- Builder A: digital menu UI + live availability toggle UI.
- Builder B: staff login/dashboard shell + table management UI skeleton.
- **Checkpoint (H8): demo-able — user can sign up, log in, see a live menu.**

**H8–H14 — Reservations, Orders, Queue (Silver core)**
- Lead: order model, reservation model, queue logic (backend), wires to DB.
- Builder A: reservation flow UI, order placement UI, notification UI (toast/SMS-mock).
- Builder B: staff-side order queue view, table status view.
- **Checkpoint (H14): demo-able — customer can reserve a table and place an order; staff sees it appear live.**

**H14–H20 — Billing + Notifications (finish Silver)**
- Lead: billing calculation logic, notification service (email or in-app; keep SMS mocked unless time allows).
- Builder A: billing/receipt UI, customer notification center.
- Builder B: staff notification triggers, order status updates.
- **Checkpoint (H20): Silver fully demoable end-to-end.**

**H20–H24 — Buffer + Silver polish**
- Fix bugs surfaced in checkpoints. Do NOT start Gold features yet if Silver is shaky.
- Commit + push, write interim README notes.

---

### Day 2 (Hours 24–48) — Gold + AI groundwork

**H24–H30 — Management Dashboard Core (Gold)**
- Lead: analytics data aggregation endpoints (sales, order volume, inventory levels).
- Builder B: dashboard UI — orders, tables, inventory, staff, customers views (tables/lists, filters).
- Builder A: polish customer-side UI, start on AI-recommendation display slots (empty state ready for backend).

**H30–H36 — Inventory + Staff Management (Gold)**
- Lead: inventory CRUD + stock-level logic, staff shift/assignment model.
- Builder B: inventory management UI, staff management UI.
- Builder A: customer profile/order history UI (needed as input data for AI recommendations).
- **Checkpoint (H36): Gold dashboard demoable — staff can manage orders, tables, inventory, staff from one place.**

**H36–H42 — AI Pipeline Part 1: Forecasting**
- Lead (critical path — do this yourself, don't delegate): build demand forecasting using historical/seed order data (simple moving-average or lightweight regression is fine — judges reward *working and explained*, not exotic ML). Feed into inventory prediction flags.
- Builder A/B: continue polishing Gold UI, seed realistic demo data (fake 2–3 weeks of order history) — **this seed data is critical, forecasting is meaningless without it.**

**H42–H48 — AI Pipeline Part 2: Assistant + Insights**
- Lead: build AI assistant endpoint (recommendations grounded in menu + order history; Q&A grounded in live availability data — retrieval, not hallucination). Build operational insights generator (plain-English summaries from live dashboard data).
- Builder A: wire assistant chat UI into customer app.
- Builder B: wire insights panel into staff dashboard.
- **Checkpoint (H48): Platinum feature set functionally present, even if rough.**

---

### Day 3 (Hours 48–72) — Polish, Hardening, Deployment, Demo

**H48–H54 — Integration Pass**
- Lead: full end-to-end walkthrough as a customer AND as staff. List every bug. Fix P0s (breaks the demo) first, P1s (visible but non-blocking) second.
- Builder A/B: assist with bug fixes in their owned areas, add loading/error states everywhere.

**H54–H60 — Deployment**
- Deploy backend + frontend + DB to production (Vercel/Railway/Render + managed Postgres). **Do this early on Day 3, never in the last 6 hours.**
- Verify: fresh incognito session, full signup→order→AI-recommendation→staff-dashboard flow works on the *public* URL, not just localhost.
- Set up environment variables/secrets properly (never hardcode keys).

**H60–H66 — UX Polish Pass**
- Empty states, loading skeletons, error messages, mobile responsiveness check, consistent spacing/typography (see PLAYBOOK.md for UI rules).
- Remove console.logs, dead code, placeholder text ("Lorem ipsum", "TODO").
- Re-seed demo data cleanly (fresh, realistic, no test junk visible).

**H66–H70 — Documentation + Submission Prep**
- Write README (Team Name, Tech Stack, User Stories Completed with explicit Bronze/Silver/Gold/Platinum labels, AI Usage disclosure, Hosted Application Link).
- Prepare the required PPT→PDF submission format (confirm the template drops on Day 3 as stated in rules — check for it).
- Record a 2–3 min backup demo video (protects against live-demo failure/wifi issues).

**H70–H72 — Final Checklist + Submit**
- Run the Final Polishing Checklist below.
- Submit well before 11:49 PM IST deadline — do not submit at 11:48 PM.

---

## 3. Priority Order (what to build if time runs short)

**Must build (non-negotiable for Platinum):**
1. Working auth (email/OTP + Google OAuth) with roles
2. Digital menu + live availability
3. Order + reservation flow (customer)
4. Staff dashboard: orders, tables, inventory (minimum viable, not all 7 Gold categories need to be deep)
5. ONE working AI feature end-to-end (forecasting OR assistant — pick forecasting if forced to choose, it's more "intelligent operations" per the rubric wording)
6. Public deployment that works

**Should build if on schedule:**
- Full Gold dashboard (staff, customers, sales, analytics all present)
- Both AI features (forecasting + assistant)
- Billing/receipts

**Can skip or fake if time-constrained:**
- SMS notifications (mock as in-app/email only)
- Complex staff scheduling logic
- Real payment integration (mock checkout is fine, judges care about the flow)
- Advanced ML (a well-labeled moving-average forecast beats a broken "AI model")

**Never skip:** working deployment, working auth, no crashes in the core demo path.

---

## 4. Demo-First Development Strategy

- After every checkpoint above, do a literal 3-minute run-through as if presenting to a judge. If you can't demo it, it's not done.
- Keep a running **"demo script"** doc from Hour 8 onward — the exact click-path you'll show. Update it as features land. This becomes your Day 3 presentation script for free.
- Seed realistic data early (fake restaurant name, fake menu, fake 2-3 weeks of orders) — generic "test123" data kills demo credibility and breaks the forecasting feature.

---

## 5. Risk Management

| Risk | Mitigation |
|---|---|
| Teammates blocked waiting on API | Define API contract (routes + request/response shapes) at H1, mock endpoints immediately so frontend never waits on backend |
| AI feature doesn't work in time | Forecasting has a dead-simple fallback (moving average); assistant has a fallback (keyword-based FAQ + rule-based recommendation) — always ship *a* working version, upgrade only if time allows |
| Deployment breaks late | Deploy a skeleton app on Day 1 (H3) and redeploy continuously (CI-lite), never a single big deploy at the end |
| Scope creep | Anything not in "Must build" needs explicit lead approval before anyone spends time on it |
| Google OAuth setup friction | Set up OAuth credentials/consent screen on Day 1 morning — these can have approval delays |
| Lost work / merge conflicts | Small, frequent commits; teammates work in separate feature branches/files (see Git Workflow) |

---

## 6. Testing Strategy

- No formal test suite required at this pace — prioritize **manual checkpoint testing** (see Hour blocks) over unit tests.
- Exception: write a handful of quick tests for the forecasting logic and billing calculation, since silent math errors are embarrassing in a demo and hard to spot visually.
- Every checkpoint = manual test of the full flow relevant to that stage, done by someone who didn't build that feature (fresh eyes catch more).

---

## 7. Git Workflow

- `main` = always deployable. Never commit broken code directly to `main`.
- Branches: `feature/auth`, `feature/menu-ui`, `feature/dashboard-ui`, `feature/forecasting`, `feature/assistant`, etc.
- Commit early, commit often (small commits > one giant commit) — judges may review commit history as "Proof of Development."
- Commit messages: `[area] short description` e.g. `[auth] add Google OAuth callback handler`.
- Lead reviews/merges PRs from teammates before merging to `main`, even informally (quick read-through), to catch integration issues early.

---

## 8. Time Allocation Summary

| Phase | Hours | % of total |
|---|---|---|
| Foundation + Silver | 0–24 | 33% |
| Gold + AI groundwork | 24–48 | 33% |
| AI completion + polish + deploy + submit | 48–72 | 33% |

Roughly even thirds — resist the urge to over-invest in Day 1 polish at the expense of Day 3 buffer time. Day 3 buffer is what separates "impressive" from "broken during judging."

---

## 9. Final Polishing Checklist (run before submission)

- [ ] Public GitHub repo, clean commit history, no secrets committed
- [ ] Live app loads on a fresh incognito window (no localhost dependency)
- [ ] Full customer flow works: signup → browse menu → reserve/order → get notification
- [ ] Full staff flow works: login → see live orders/tables → view inventory → see AI insights
- [ ] AI feature(s) demonstrably use real data, not hardcoded fake output
- [ ] No placeholder text, broken images, or console errors visible
- [ ] Mobile/responsive check on at least one real device
- [ ] README complete per submission requirements (Team Name, Tech Stack, User Stories Completed, AI Usage, Hosted Link)
- [ ] PPT/PDF submission format prepared per Day-3 template
- [ ] Backup demo video recorded
- [ ] Submitted with time to spare before 27 Jul 11:49 PM IST
