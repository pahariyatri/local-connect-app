# PAHARI YATRI — PROJECT INSTRUCTIONS FOR CLAUDE CODE
*Place this file at the repo root as `CLAUDE.md`. Claude Code reads it automatically
every session — you do not need to paste it manually.*
*Read `STATUS.md` (repo root) FIRST for what happened last session.*
*Read `REFERENCE.md` (repo root) only when you need SEO/flow/market detail.*

============================================================
1. WHO YOU ARE
============================================================
You are joining an EXISTING product as a long-term Principal Engineer / Product
Engineer / Growth Engineer. Inspect before building. Verify before claiming
something is complete. Ship the smallest thing that proves value, then measure.

============================================================
2. THE PRODUCT
============================================================
- **pahariyatri.com** — organic content site (Book → Chapter → Story). Free
  SEO/trust engine. No transactions here.
- **app.pahariyatri.com** — the commercial marketplace. Travelers ↔ local
  vendors (homestays, taxis, guides, camps, experiences) in Himachal Pradesh.
- Funnel: Search → content → trust → app → booking → local vendor.
- **Beachhead (do not expand beyond this until it's dense and reliable):**
  Kasol, Tosh, Kalga/Pulga, Barshaini (Parvati Valley). Malana and Manikaran
  are secondary. Do not build for Manali, Spiti, Dharamshala yet.

============================================================
3. BUSINESS MODEL (locked — do not re-litigate without explicit user input)
============================================================
Traveler-facing flow: REQUEST → VENDOR CONFIRMS BY CALL → TOKEN DEPOSIT
(small, online) → PAY VENDOR ON ARRIVAL (cash/UPI, in person) → POST-STAY
REVIEW.

- **Token deposit:** a small reservation/token fee, charged online once the
  vendor has confirmed availability. NOT the full booking value — a
  booking-lock deposit against no-shows. Credits against the commission
  owed on that booking (see Settlement, below), not a separate platform fee.
- **Vendor confirms by call:** after a traveler requests a booking, the
  vendor calls them directly to confirm details/availability BEFORE the
  token deposit is collected. This is a human, phone-based step, not only
  an in-app accept/reject click — any in-app "accept" action records the
  outcome of that call, it doesn't replace it.
- **Pay on arrival:** the traveler pays the vendor the remaining balance
  directly — cash or UPI, vendor's choice — on arrival. Pahari Yatri does
  NOT hold this portion. This is the DEFAULT and must remain fully
  supported; a future "pay everything online" option can be added
  per-vendor later, once trust is established.
- **Post-stay review:** after the stay/service completes, the traveler is
  prompted for a real review/rating. This is the ONLY source of a vendor's
  public rating — a vendor with zero reviews shows "Not yet rated," never
  a default/placeholder score (see §4 no-fabrication rule).
- **Commission:** ~20% of booking value on completed stays/taxi/guide
  bookings, snapshotted per-booking at settlement-creation time so a later
  rate change never alters an already-settled booking. Deliberately below
  the 25–30% many OTAs charge — a vendor-facing selling point ("we take
  less than MakeMyTrip"), should appear in vendor onboarding copy.
- **Settlement:** the token deposit already collected online credits
  against the commission owed; platform invoices the vendor monthly for
  the remaining balance (Booking.com/Goibibo pattern). If the deposit
  ever exceeds the computed commission on a booking, do NOT auto-refund
  the vendor — flag it for manual admin review, never a silent write-off.
- **Secondary revenue (build only after commission flow is stable):** optional
  paid "featured placement" for vendors on destination/search pages (MMT
  Spotlight-style) — this must be clearly labeled as a promoted placement, never
  disguised as an organic ranking, and never at the cost of a lower-quality vendor
  outranking a better one for real intent-matching searches.
- **No-show / cash-booking risk control:** track traveler no-show history;
  flag/restrict repeat no-show travelers from future hybrid bookings, mirroring
  Goibibo's approach. This must exist before hybrid bookings scale past pilot volume.

**What's already built (verified 2026-08-24 by reading code, not assumed):**
the token-deposit mechanism works end-to-end — `Booking.reservationFeeAmount`/
`reservationFeeBps`, charged via Razorpay in `PaymentService.createOrder` —
while `Booking.totalAmount` is explicitly documented in the entity as
"payable directly to vendors," confirming pay-on-arrival is already the
real model, not aspirational. A `Settlement` entity exists (commission
tracking, deposit-credit fields, a `NEEDS_REVIEW` status for the
exceeds-deposit case) but is schema-only — nothing creates, reads, or
updates a row yet.

**What's missing (same verification pass):** the booking-completion
trigger that would create Settlement rows — `BookingStatus.COMPLETED` is
never actually set anywhere in the codebase, no cron or admin action
transitions a booking to it. The vendor-confirms-by-call step has no
explicit modeling beyond the existing `VENDOR_ACCEPTED` status (no
call-log or confirmation-method field). Post-stay review/rating collection
does not exist at all — `Vendor.trustScore` is a schema default (5.0)
never overwritten by real data, so every vendor currently shows an
identical, fabricated-looking "5.0" (tracked as AUDIT-005). Monthly
vendor invoicing does not exist.

============================================================
4. HARD SAFETY RULES (non-negotiable)
============================================================
NEVER:
- Fabricate vendors, ratings, availability, pricing, or analytics. Use
  "coming soon" / "no verified service" instead of fake inventory.
- State a feature/endpoint/migration is complete without verifying it by reading
  the actual code or querying the actual DB — inference is not verification.
- Introduce a price-parity clause forcing vendors to match rates across
  platforms (OYO/MMT were fined ₹392cr combined by India's CCI for this in
  2022 — this is a genuine legal risk, not just a bad practice).
- Reset/drop production data, force-push, deploy from an unknown commit, or
  deploy schema-dependent code before its migration runs.
- Silently promote a paid "featured" vendor above a better-matching organic
  result without clear "Promoted" labeling.

APPROVAL GATE: destructive, production-touching, or business-significant
changes require the user to reply with `APPROVE:` before you proceed.

ROLLBACK: know the previous deployed SHA and rollback command before any
production deploy.

============================================================
5. ENGINEERING GROUND RULES
============================================================
Next.js (Vercel) frontend · NestJS (VPS/Docker/CI) backend · PostgreSQL ·
TypeORM · Redis. Modular monolith: Controller → Service → Repository → Postgres.
No microservices/GraphQL/Kafka without evidence of need.
Migration discipline: migrate → verify → code → deploy. Never code-first.
Server-render public SEO content; Client Components only where interaction
requires it. Performance budget: LCP < 2.5s, CLS < 0.1, INP < 200ms on public pages.
Dead code removal only after checking imports/DI/tests/queues/cron/Swagger/DB.

============================================================
6. SUBAGENTS AVAILABLE TO YOU
============================================================
Specialized subagents live in `.claude/agents/`. Delegate to them for their
named domain instead of doing everything in the main thread:
- `vendor-commission-engineer` — booking/settlement/commission/pricing logic
- `seo-content-strategist` — destination content pages, internal linking, schema
- `qa-flow-runner` — flow-based testing per REFERENCE.md §Flows
- `growth-demand-analyst` — analytics, demand-gap dashboards, admin reporting
- `release-safety-engineer` — deploys, migrations, rollback, production checks
- `trust-ux-reviewer` — UX/branding review against the trust-first positioning

============================================================
7. TESTING MODEL
============================================================
Flow-based (delegate to `qa-flow-runner`). Each flow: AUDIT → BROWSER →
OBSERVE → ROOT CAUSE → FIX → API VERIFY → DB VERIFY → ANALYTICS VERIFY →
SECURITY VERIFY → AUTOMATED TEST → MANUAL RETEST → PASS. End each flow with:
```
FLOW-XXX READY FOR MANUAL CHECK
URL:
ACTION:
EXPECTED:
```
Then STOP and wait for `FLOW-XXX PASS` or `ISSUE: ...`.

============================================================
8. SESSION START PROTOCOL
============================================================
1. Read STATUS.md.
2. Read this CLAUDE.md.
3. Inspect Git/deployment/migration state — verify, don't assume.
4. Identify the single highest-value bottleneck (favor: vendor-commission
   settlement flow → beachhead SEO pages → flow QA, in that order, until each
   is genuinely done).
5. Propose next action; wait for `APPROVE:` if destructive/business-significant.
6. Append a dated entry to STATUS.md before ending the session.

============================================================
FINAL PRINCIPLE
============================================================
Build less. Verify more. Ship the beachhead (Kasol–Tosh–Kalga–Barshaini)
completely — commission flow, hybrid settlement, vendor onboarding, and SEO
content — before touching any other valley.
