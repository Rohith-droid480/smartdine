# MODEL_PROMPTING_GUIDE.md — Using Claude & Gemini 3.6 Flash via Antigravity

**Audience:** ChatGPT, deciding which model to prompt and how, for each task in the build.

---

## Core division of labor

**Claude → heavy, ambiguous, architecture-critical, or high-stakes work.**
**Gemini 3.6 Flash → fast, well-specified, medium-to-easy work, and frontend/boilerplate generation.**

The reasoning: Claude is stronger at holding a large context and reasoning through ambiguous or interconnected decisions correctly the first time — expensive to get wrong (schema, auth, AI pipeline). Flash is fast and cheap — ideal once ChatGPT has already made the decisions and just needs code produced from a clear spec (UI components, CRUD boilerplate).

---

## Claude — What It Should Handle

- Database schema design and changes
- Auth flow implementation (email/OTP + Google OAuth) — security-sensitive, one mistake here blocks the whole team
- The AI pipeline itself: forecasting logic, recommendation/assistant grounding logic, insights generation
- API contract design (`shared/types`) — this is the source of truth other work depends on, must be right
- Code reviews of teammate-generated code before merging into `main`
- Refactoring when architecture drift is detected
- System design questions ("how should orders and inventory decrement interact?")
- Debugging cross-cutting or hard-to-reproduce bugs (auth failures, data inconsistency, race conditions)
- Documentation that requires understanding the whole system (README, architecture write-ups)

### Prompt templates for Claude

**Architecture/schema decision:**
```
Context: [paste relevant ARCHITECTURE.md section]
Current state: [what exists now]
Task: [specific decision or code needed]
Constraints: must fit existing schema/contract in [paste shared/types relevant section]
Walk through your reasoning for the approach before writing code, then provide the implementation.
```

**Code review:**
```
Here is generated code for [feature]: [paste code]
Review against these standards: [paste PLAYBOOK.md Section 3 + 5]
Flag any deviations from our folder structure, naming conventions, or architecture rules.
Then provide a corrected version if needed.
```

**Debugging:**
```
Bug: [describe symptom precisely]
Relevant code: [paste]
Relevant schema/flow: [paste]
Walk through what could cause this, check the most likely causes first, then confirm before proposing a fix.
```

**Chain-of-thought-friendly prompting (without requesting hidden reasoning):**
Ask Claude to reason *visibly*, in the response, before the final answer — e.g. "Explain your reasoning for this schema choice, then give the final schema" — rather than asking it to "think silently." This keeps ChatGPT (and you) able to review *why* a decision was made, which matters for catching mistakes with less-experienced teammates in the loop.

---

## Gemini 3.6 Flash — What It Should Handle

- UI component generation from a clear spec (menu card, reservation form, dashboard table)
- Boilerplate (CRUD route skeletons once the pattern is established by Claude for the first one)
- Repetitive component generation across similar screens (once one dashboard table component is right, Flash can replicate the pattern for the other 5 dashboard sections)
- Quick, low-stakes debugging (a broken CSS layout, a typo-level bug, a missing import)
- Fast iteration on visual polish (spacing, responsive tweaks, loading/empty states)
- Quick research/lookups (library API syntax, "how do I do X in Next.js App Router")

### Fast iteration workflow for Flash

1. ChatGPT (or Claude) defines the pattern once for a category (e.g. "here's the shape of one dashboard table component").
2. Flash is prompted to replicate that pattern across the remaining similar screens, one prompt per screen, always referencing the established pattern explicitly.
3. Flash output goes through the Review Checklist (PLAYBOOK.md Section 9) before merge — even fast-generated code gets checked.

### Prompt templates for Flash

**Component generation:**
```
Build a React (Next.js, TypeScript, Tailwind) component: [component name].
Follow this exact pattern from an existing component: [paste example component]
Props/data shape: [paste from shared/types]
Must include: loading state, empty state, error state.
Keep styling consistent with: [paste design tokens/Tailwind classes used elsewhere]
```

**Boilerplate CRUD route:**
```
Generate an Express route file for [entity] following this existing pattern exactly: [paste an existing route file, e.g. menu.ts]
Entity shape: [paste from shared/types]
Include: input validation (Zod), consistent {success, data, error} response shape, role-based access check where relevant.
```

**Quick debugging:**
```
This component throws/renders incorrectly: [paste code + error/screenshot description]
Fix the minimum necessary to resolve it, don't restructure the component.
```

**Quick research:**
```
What's the correct syntax/approach for [specific narrow question] in [library/framework version]? Give a short code example only.
```

---

## How ChatGPT Should Decide Which Model to Prompt

Ask, in order:

1. **Is this a decision that other teammates' work depends on (schema, contract, auth, AI logic)?** → Claude.
2. **Is this ambiguous, high-risk, or hard to reverse if wrong?** → Claude.
3. **Is this a clear, well-specified, isolated task following an established pattern?** → Flash.
4. **Is this frontend/UI/boilerplate volume work?** → Flash.
5. **Is this reviewing or refactoring existing code for correctness/architecture-fit?** → Claude.

**Rule of thumb:** Claude designs the pattern once; Flash replicates the pattern many times. This maximizes output while minimizing Claude token usage — the expensive, limited resource — for the calls that actually need its reasoning depth.

---

## Dividing Work Across the Team Using This Split

- **Lead builder's prompts → mostly Claude** (architecture, auth, AI pipeline, reviews).
- **Teammates' prompts (via ChatGPT) → mostly Flash**, for their owned UI/CRUD areas, using patterns and contracts the lead already established via Claude.
- Whenever a teammate's Flash-generated code needs a decision Flash isn't suited for (e.g. "how should this UI reflect the reservation state machine?"), that's a signal to escalate that one question to Claude, get the pattern/decision, then return to Flash for the repetitive implementation.

## Minimizing Token Usage / Limits

- Don't re-explain the whole project to Claude every prompt — maintain a short "context snippet" (key schema + contract excerpts) that ChatGPT reuses across prompts, only including what's relevant to the current task.
- Batch related Flash requests (e.g. "generate these 3 similar dashboard table components in one go, here's the pattern") rather than one call per near-identical component.
- Reserve Claude for the ~10-15 genuinely hard decisions across the whole hackathon (schema, auth, AI pipeline, contract, key reviews) rather than routine implementation — this keeps Claude usage sustainable across 72 hours.
