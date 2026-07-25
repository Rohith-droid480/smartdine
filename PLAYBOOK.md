# PLAYBOOK.md — Project Constitution

**Audience:** ChatGPT, acting as execution orchestrator, generating prompts for Antigravity (Claude + Gemini 3.6 Flash).
**Status:** Binding. Do not deviate without explicit sign-off from the lead builder.

This playbook exists because two of three builders are low/mid-experience. Consistency and guardrails matter more than cleverness. When in doubt, choose the boring, explicit option.

---

## 1. Decision-Making Hierarchy

When any conflict arises (design choice, library choice, "should we do X"), resolve in this order:

1. **Does BUILD_PLAN.md's "Must build" list cover this?** If not in scope, don't build it without lead approval.
2. **Does ARCHITECTURE.md already specify this?** If yes, follow it exactly — don't re-litigate tech choices mid-build.
3. **Does this playbook's rules below cover it?** Follow them.
4. **If genuinely undecided:** default to the simplest option that is demoable, and flag it to the lead builder rather than silently deciding.

ChatGPT must never unilaterally change the tech stack, folder structure, or data model defined in ARCHITECTURE.md. If a limitation is hit, surface it as a question, don't route around it silently.

---

## 2. Development Rules

- Every feature must be buildable and demoable independently — no feature should require three other unfinished features to show value.
- Build against the API contract in `shared/types` — frontend work must never block on backend completion; use mock data matching the contract shape until the real endpoint exists.
- No feature ships without: a happy path working + at least one visible loading state + at least one visible error state.
- Seed data is a first-class deliverable, not an afterthought — realistic fake restaurant data must exist before Day 2 ends (needed for AI forecasting/recommendations to look credible).

---

## 3. Coding Standards

- TypeScript everywhere (frontend and backend) — catches mistakes for less-experienced teammates before runtime.
- Consistent naming: camelCase for variables/functions, PascalCase for components/types, kebab-case for file names (except React components, which are PascalCase files).
- No magic numbers/strings — extract to named constants when a value is reused or business-meaningful (e.g. `RESERVATION_BUFFER_MINUTES`).
- Every API route: validate input (Zod or equivalent), handle errors explicitly, return consistent response shape `{ success, data, error }`.
- Keep functions short and single-purpose — if a function needs a comment explaining "then it also does X", split it.

---

## 4. Folder Organization

Follow ARCHITECTURE.md Section 3 exactly. Rules:
- Route handlers stay thin — business logic lives in `services/`, not inline in route files.
- Shared types live only in `shared/types` — never redefine the same shape independently in frontend and backend.
- AI logic isolated in `server/src/ai/` — never scatter LLM calls throughout unrelated route files.

---

## 5. Architecture Rules — What Never to Change

These are locked for the entire hackathon once set at Hour 1:
- Database choice (PostgreSQL/Supabase)
- Monolithic backend (no microservices split)
- Auth approach (email/OTP + Google OAuth via chosen provider)
- Core data model entity names/relationships (extending fields is fine; renaming/restructuring core entities mid-build is not)

If a teammate or ChatGPT-generated prompt suggests changing any of these mid-build, reject it and stay the course. Mid-hackathon architecture changes are the #1 cause of blown timelines.

---

## 6. UI/UX Principles

- Clarity over cleverness — a judge sees this for 2-3 minutes; every screen must be immediately understandable.
- Consistent design system: pick a component library approach once (e.g. Tailwind + a small set of reusable components) and reuse it everywhere — don't let two teammates build visually inconsistent screens.
- Every list/table view needs: empty state, loading state, and populated state — never let a judge see a blank white screen.
- Mobile-responsive minimum viable — doesn't need to be pixel-perfect, but must not visibly break.
- Real, restaurant-appropriate copy and data — no "Lorem ipsum," no "asdf" test data in the final build.

---

## 7. Performance Requirements

- Page loads under ~2s on the deployed environment (not localhost) — test on the real deployment, not just dev mode.
- AI assistant responses should return within a few seconds — if using a slower model/flow, show a visible "thinking" state, never a silent hang.
- Dashboard views with lists (orders, inventory) should paginate or limit results — don't render unbounded lists.

---

## 8. Prompting Workflow (how ChatGPT operates Antigravity)

1. Before prompting either model, ChatGPT must have: the relevant section of ARCHITECTURE.md, the specific file(s) being touched, and a clear one-sentence goal for the prompt.
2. Route the task to Claude or Gemini Flash per MODEL_PROMPTING_GUIDE.md — heavy/architectural/ambiguous work to Claude, fast/well-specified/frontend work to Flash.
3. Every generated code block must be reviewed against Section 3 (Coding Standards) and Section 5 (Architecture Rules) before being accepted into the codebase.
4. If generated code deviates from the folder structure or data model, regenerate with a corrected prompt rather than manually patching repeatedly — patching drifted output wastes more time than a clean re-prompt.

---

## 9. Review Checklist (apply before merging any generated code)

- [ ] Matches folder structure in ARCHITECTURE.md
- [ ] Uses shared types, doesn't redefine shapes
- [ ] Has loading + error + empty states (if UI)
- [ ] No hardcoded secrets/API keys
- [ ] No console.logs left in
- [ ] Follows naming conventions in Section 3
- [ ] Actually runs locally without new unexplained errors

---

## 10. Error Handling Strategy

- Backend: every route wrapped in try/catch (or centralized error middleware), consistent error response shape, meaningful HTTP status codes (400 validation, 401/403 auth, 404 not found, 500 server).
- Frontend: every data-fetching component handles the error case visibly (toast or inline message) — never a silent failure or raw crash.
- AI service calls: always have a fallback path (e.g. if the LLM call fails or times out, show a graceful "insights unavailable" message, don't crash the dashboard).

---

## 11. Testing Rules

- No comprehensive test suite expected — this is a hackathon.
- Do write quick tests for: forecasting math, billing calculation. These are the two places a silent bug is invisible until a judge does the math themselves.
- Otherwise: manual checkpoint testing per BUILD_PLAN.md's hour blocks is the primary QA method.

---

## 12. Git Commit Strategy

- Small, frequent commits, one logical change per commit.
- Format: `[area] short imperative description` (e.g. `[orders] add order status transition logic`).
- Never commit directly to `main` with untested code — use feature branches, quick self-review before merge.
- Commit history should tell a story — this doubles as your "Proof of Development" evidence.

---

## 13. Documentation Rules

- Every non-obvious function/module gets a one-line comment explaining *why*, not *what* (the code already shows what).
- README updated incrementally, not written from scratch at Hour 70 — keep a running "Progress Log" section from Day 1.
- AI Usage section in README must honestly describe what Claude/Gemini/other AI tools were used for (required by submission rules) — treat this as a feature to highlight (shows a mature AI-assisted workflow), not something to downplay.

---

## 14. When to Simplify

- Any feature not in "Must build" (BUILD_PLAN.md Section 3) gets simplified or cut the moment a checkpoint is at risk.
- Prefer a simple, correct, explainable implementation (e.g. moving-average forecasting) over an impressive-sounding but fragile one.
- If a UI feature can be a static/simple version now and dynamic later, ship static first, upgrade only if time remains.

---

## 15. When to Optimize

- Only optimize (performance, code elegance, extra features) after a checkpoint's "Must build" scope is fully working and demoable.
- Never optimize AI model sophistication before the basic grounded version works end-to-end.
- Optimize the demo path (the exact click-sequence judges will see) before optimizing anything off that path.

---

## 16. Final Reminder

This playbook's purpose is to keep two less-experienced teammates productive and the lead builder unblocked. Every rule above exists to prevent a specific, common hackathon failure mode: architecture drift, silent bugs, inconsistent UI, or a broken deploy at the last hour. Follow it strictly. If something in here is actively blocking real progress, flag it to the lead builder — don't quietly override it.
