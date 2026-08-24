# STATUS LOG
*Read the most recent entries FIRST at the start of every session.
Append a new entry at the end of every session — never delete or rewrite history.*

---

## Entry template (copy this block for each new session)

### [YYYY-MM-DD] Session N
**Git/Deploy state:** branch=___ commit=___ deployed-SHA=___ migration-state=___
**Flows passed this session:** ___
**Flows blocked:** ___ (why)
**What worked:** ___
**What didn't:** ___
**Biggest bottleneck found:** ___
**Recommended next action:** ___ — why: ___
**How we'll measure it:** ___
**Decisions made (and why):** ___
**Anything the user still needs to confirm/provide:** ___

---

## Log

### [2026-08-24] Session 1
**Git/Deploy state:** backend: branch=fix/public-browse-throttle, local HEAD=d65e496, origin/main=e840365 (deployed, verified live). frontend: branch=fix/hydration-i18n-journey-redesign, local HEAD=ac93c62, origin/main=c77a61e (deployed, verified live). Both repos' local HEAD == origin/main content (no drift). Migration state: 3 migrations present (`InitialPahariYatriSchema`, `AddDiscoveryAndPricingStrategy`, `AddLocationHierarchy`) — `AddLocationHierarchy` was previously flagged dormant/not-run-on-prod (see prior-session memory, not re-verified against live DB this session).
**Flows passed this session:** FLOW-000 (environment/deploy smoke, extended with Playwright + build/typecheck) — production throttler bug found and fixed (PR #40, backend). Landing hero/copy/SEO pass shipped (PR #27, #29, frontend) — hydration-warning fix, hero i18n wiring, fabricated "local partner" personas removed from the journey section.
**Flows blocked:** none formally blocked; FLOW-000 was extended rather than strictly gated since work continued past it under explicit user direction.
**What worked:** browser-first verification (Playwright against a local prod build across en/hi/de/he) caught real issues before shipping — a mobile-viewport throttle 429, and confirmed translations actually render. Small scoped PRs with CI-gated merges kept each change reversible.
**What didn't:** two production deploys (frontend PR #27, backend PR #40) went out under a prior "no manual approval" instruction before this CLAUDE.md's `APPROVE:` gate was adopted mid-session — flagged transparently to the user rather than hidden. An external process auto-committed local edits mid-session under generic commit messages (matches a documented prior pattern) — verified content was correct, not corrupted, but worth the user's awareness.
**Biggest bottleneck found:** the vendor-commission settlement flow that CLAUDE.md §3 declares locked (~20% commission, hybrid pay-on-arrival, platform invoices vendor monthly) **does not exist in code at all** — verified by reading, not inferred:
  - `grep -rl "commission" src/` across the entire backend → zero matches. No commission-rate field anywhere (checked `vendor.entity.ts` directly).
  - The actual implemented payment flow (`payment.service.ts`) is full online prepayment via Razorpay (`createOrder` → `verifyPayment` → webhook), not the CLAUDE.md-mandated default of traveler-pays-vendor-directly-on-arrival. These are architecturally opposite money flows.
  - `payout.service.ts` (`createPayout`, `markAsPaid`) exists but its own docstring says "usually triggered after successful payment" — and it is **never called from anywhere** (`grep -rn "createPayout" src/` outside its own file/tests → zero). `processPaymentSuccess` only marks payment/booking status and sends a WhatsApp notification; it never creates a payout, computes a commission, or records what the platform owes a vendor.
  - Net: the core revenue mechanism is 0% built, not partially built. This is the single highest-value gap per CLAUDE.md's own stated priority order (§8: commission settlement → beachhead SEO → flow QA).
**Recommended next action:** do NOT start building the settlement engine without the user first resolving the model conflict — CLAUDE.md says hybrid pay-on-arrival is the *default*, but the only real payment code in the repo is full online prepayment. Before writing settlement code: (1) confirm with the user which model the product actually launches with (hybrid pay-on-arrival, online prepayment, or both — CLAUDE.md allows online as a later per-vendor option, not default), (2) design commission-rate storage (config vs. per-vendor override) and the monthly vendor invoicing job, (3) implement behind a migration-first discipline per CLAUDE.md §5. This is business-significant and needs `APPROVE:` before implementation starts, per CLAUDE.md §4.
**How we'll measure it:** once built — commission computed correctly per booking (spot-check against 20% of booking value), monthly vendor invoice total reconciles against sum of that vendor's completed bookings, zero bookings with a CONFIRMED/COMPLETED status and no corresponding settlement record.
**Decisions made (and why):** adopted the `APPROVE:` gate mid-session per the user's CLAUDE.md; two prior deploys already went out before that gate existed for this session, disclosed rather than hidden. Did not attempt to install `CLAUDE.md`/`REFERENCE.md`/`STATUS.md`/`.claude/agents/` into either repo's root yet — README says "repo root" but there are two repos (backend, frontend) and no monorepo root that's actually a git repository; asking the user rather than guessing which repo(s) or whether to duplicate into both.
**Anything the user still needs to confirm/provide:** (1) which settlement model actually ships first — hybrid pay-on-arrival (as CLAUDE.md states) or the online-prepayment flow that's actually built; (2) where to install `CLAUDE.md`/`REFERENCE.md`/`.claude/agents/` (backend repo root, frontend repo root, or both) and whether to commit them; (3) `REFERENCE.md` §H START DATE is still blank.
