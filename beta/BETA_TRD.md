# BETA_TRD.md — Technical Requirements Document
## Builder: BETA | Project: Smart Restaurant Management System | VibeAthon 6.0

**Give this entire file to your ChatGPT as the project brief.** ChatGPT will use it to generate Antigravity prompts (mostly Gemini 3.6 Flash — see Section 5). Alpha (lead) and Gamma are working in parallel on their own tracks with their own ChatGPT sessions.

**Important:** Section 3 below (Shared API Contract) is identical to what Alpha and Gamma have. Do not rename fields or restructure it — if it seems wrong, flag it to Alpha, don't change it unilaterally, or the three codebases won't merge.

---

## 1. Your Scope (what YOU build)

You own the **customer-facing web app** (`apps/web`). Specifically:
- Auth screens (signup, login, OTP verification, Google OAuth button)
- Digital menu browsing with live availability
- Reservation flow (browse tables/times, book, view/cancel own reservations)
- Order placement + order tracking/status view
- Billing/receipt view
- Notification center (in-app)
- AI assistant chat widget (recommendations + Q&A)

**You do NOT build:** any backend/API code (Alpha owns `server/`), and not the staff dashboard (Gamma owns `apps/admin`). Build entirely against the contract below — start with mock data, swap to Alpha's real endpoints as he ships them (see sync schedule, Section 7).

---

## 2. Context

Smart Restaurant Management System SaaS for VibeAthon 6.0. Tiers: Bronze (UX quality) → Silver (auth + digitized workflows — this is mostly YOUR track) → Gold (staff dashboard, Gamma's track) → Platinum (AI features layered on top — your assistant/recommendation UI is part of this). Judges see your screens as the primary "customer experience" — this is a big part of the demo.

Stack: Next.js + TypeScript + Tailwind CSS. You're building `apps/web`.

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

### Endpoints YOU consume (built by Alpha — mock these until his are live)

```
POST   /api/auth/signup            { email, password, name }
POST   /api/auth/verify-otp        { email, otp }
POST   /api/auth/login             { email, password }
GET    /api/auth/google/callback
GET    /api/auth/me                -> ApiResponse<User>

GET    /api/menu                   -> ApiResponse<MenuItem[]>

GET    /api/reservations           -> ApiResponse<Reservation[]>   (own only)
POST   /api/reservations           { tableId, time, partySize }    -> ApiResponse<Reservation>
PATCH  /api/reservations/:id       { status: 'cancelled' }

GET    /api/orders                 -> ApiResponse<Order[]>          (own only)
POST   /api/orders                 { tableId?, items: [{menuItemId, quantity}] } -> ApiResponse<Order>

GET    /api/notifications          -> ApiResponse<Notification[]>
PATCH  /api/notifications/:id/read

GET    /api/ai/recommendations     -> ApiResponse<MenuItem[]>
POST   /api/ai/assistant           { message } -> ApiResponse<{ reply: string }>
```

**Mock strategy:** Until Alpha's endpoints are live, create a `lib/mockApi.ts` returning realistic fake data matching these exact shapes. Build all UI against `lib/api.ts` (a thin wrapper) so swapping mock → real later is a one-file change, not a rewrite.

---

## 4. Your Hour-by-Hour Schedule (72 hours)

**H0–H2:** Kickoff, get repo access, confirm `shared/types` from Alpha, set up `apps/web` skeleton (Next.js + Tailwind), set up `lib/mockApi.ts` with fake data for all endpoints above.
**H2–H8:** Build auth screens (signup, login, OTP input, Google OAuth button) against mock responses.
**H8–H14:** Build digital menu browsing screen (list, filter by category, availability badges).
**H14–H20:** Build reservation flow (pick table/time, confirm, view/cancel own reservations).
**H20–H24:** Build order placement flow (add items, cart, place order) + basic order status view.
**H24–H30 (Day 2 start):** Switch to Alpha's real endpoints where live (check sync schedule) — auth and menu should be real by now. Fix any contract mismatches immediately, don't work around them silently.
**H30–H36:** Build billing/receipt view, notification center UI (list, mark read).
**H36–H42:** Polish order tracking (status updates: placed → preparing → ready → served).
**H42–H48:** Build AI assistant chat widget UI — message input, chat bubbles, loading state while waiting for `/api/ai/assistant`, and a recommendations carousel/section using `/api/ai/recommendations`.
**H48–H54:** Switch all remaining mocks to real endpoints (AI endpoints should be live by now per Alpha's schedule). Full flow test as a real user.
**H54–H60:** Hand off for integration with Alpha — be reachable, fix any issues found.
**H60–H66:** UX polish pass: loading skeletons, error toasts, empty states, mobile responsiveness, remove all placeholder/test data and console.logs.
**H66–H70:** Support README/demo script writing for your screens (describe what you built, in plain language, for the AI Usage + user story sections).
**H70–H72:** Final smoke test on the deployed public URL.

---

## 5. Model Prompting Rules for This Track

**Use Gemini 3.6 Flash for almost everything** — your track is well-specified UI work against a fixed contract, exactly what Flash is fast at.

**Use Claude only when:** a UI flow has real ambiguity (e.g. "how should the reservation UI represent a pending vs confirmed state visually and functionally") or when reviewing your own code against standards before merge.

**Prompt template (Flash, component generation):**
```
Build a React (Next.js App Router, TypeScript, Tailwind) component: [component name, e.g. MenuItemCard].
Data shape: [paste relevant type from Section 3, e.g. MenuItem]
Must include: loading state, empty state, error state, and use the `lib/api.ts` wrapper for data fetching.
Style: clean, modern restaurant app aesthetic — [describe: warm/neutral tones, card-based layout, etc. — pick something and stay consistent across all your screens]
```

**Prompt template (Flash, replicate a pattern):**
```
Here's an existing component I built: [paste component]
Build a similar one for [new entity/screen], following the exact same structure/styling pattern.
```

**Prompt template (Claude, ambiguous UX decision):**
```
I need to design the UI/UX for [flow, e.g. order tracking through 4 statuses].
Data available: [paste Order type]
What's the clearest way to represent this to a customer? Explain the reasoning, then describe (or code) the component structure.
```

**Escalate to Alpha (not Claude) if:** the contract itself seems to be missing a field you need, or an endpoint doesn't return what you expect. Don't invent a workaround field on your side — that breaks integration.

---

## 6. UI/UX Standards (must follow)

- Consistent design system across all your screens (same button styles, spacing, color palette) — don't let each screen look like a different app.
- Every list view: loading, empty, and populated states — never a blank white screen.
- Real, restaurant-appropriate placeholder copy (a real fake restaurant name/menu), never "Lorem ipsum" or "test123" in what a judge will see.
- Mobile-responsive minimum viable.
- AI assistant chat must show a visible "thinking" state — never a silent hang while waiting for a response.

---

## 7. Sync Points With Alpha (check in at these hours)

- **H2:** Confirm you have `shared/types` and repo access.
- **H12:** Alpha's Menu/Reservation/Order endpoints should be going live — confirm and start switching from mocks.
- **H24:** Confirm auth is fully real (not mocked) by this point.
- **H48:** Alpha's AI endpoints (assistant, recommendations) should be live — confirm and wire in.
- **H54–60:** Active integration window with Alpha — be reachable.

If any sync point slips, keep building against mocks and flag it — don't block yourself waiting.

---

## 8. Definition of Done (Beta)

- [ ] All customer screens built and using real (not mock) API data
- [ ] Auth flow works end-to-end (signup, OTP, Google OAuth, login)
- [ ] Menu, reservation, order, billing, notification flows all functional
- [ ] AI assistant widget and recommendations wired to real endpoints, with proper loading/error states
- [ ] No console errors, no placeholder text, mobile-responsive
- [ ] Verified working on the actual deployed public URL, not just localhost
