# PAHARI YATRI — FULL APP AUDIT & FIX BACKLOG
*Place at repo root as `AUDIT.md`. This is the single source of truth for every
known issue, its severity, and its status. Claude Code reads this at the start
of every audit/fix session and updates it before ending the session — never
lose findings between sessions.*

============================================================
HOW TO USE THIS FILE (read before doing anything else)
============================================================
1. Read the OPEN ISSUES table below. Work P0s first, always — do not start a
   P1 while a P0 in the same area is open.
2. When auditing a new flow/persona combo not yet covered, use `/chrome` in
   Brave to actually walk it as that persona would — code-reading alone is not
   an audit, per the pattern already proven in this session's Kasol search test.
3. Every issue found — fixed immediately or not — gets logged in the OPEN
   ISSUES table with an ID, severity, persona, area, and description BEFORE
   you move to the next thing. Don't hold findings in your head across turns.
4. When an issue is fixed, move it to the FIXED LOG with the PR number and the
   `/chrome` re-verification note. Don't mark fixed from code-reading alone —
   re-walk the flow.
5. Root/backend-logic bugs (not just UI) route to whichever existing subagent
   owns that domain (vendor-commission-engineer for money/booking-state logic,
   release-safety-engineer for infra/API-level issues, seo-content-strategist
   for content). If no existing agent owns it (e.g. general search/matching
   logic), handle it in the main session directly, following CLAUDE.md's
   migration-first and approval-gate rules exactly as any other agent would.
6. Follow the standard flow protocol from CLAUDE.md §7 for anything that
   touches a FLOW-XXX from REFERENCE.md: AUDIT → BROWSER → OBSERVE → ROOT
   CAUSE → FIX → API VERIFY → DB VERIFY → AUTOMATED TEST → MANUAL RETEST.
   Business-significant or production-touching fixes still need `APPROVE:`.

============================================================
SEVERITY DEFINITIONS
============================================================
- **P0 — Trust-breaking / core function broken.** The thing the user came to
  do doesn't work, or the platform shows something false (wrong vendor,
  fabricated rating, wrong location). Fix before anything else in that area.
- **P1 — Major friction or misleading UX.** The user can eventually get what
  they want, but the path is confusing, forces unwanted steps, or silently
  changes their choice.
- **P2 — Minor / cosmetic.** Visually broken but doesn't block or mislead.
- **P3 — Nice-to-have / polish.** Would improve the experience but isn't a bug.

============================================================
PERSONAS TO TEST (every flow gets walked as each relevant persona)
============================================================
- **Direct Searcher** — "I need one specific service (taxi/stay/guide) in one
  specific village, right now." (Primary persona — CLAUDE.md's beachhead
  traveler. Most flows should be tested as this persona FIRST.)
- **Trip Planner** — "I need help building a multi-day Parvati itinerary."
- **Vendor** — homestay/taxi/guide owner: onboarding, listing management,
  pricing, booking accept/reject, commission statement.
- **Admin** — demand intelligence, vendor verification, zero-result searches.
- **Mobile-first traveler** — same as Direct Searcher/Trip Planner but on a
  real mobile viewport; most actual Parvati-bound travelers will be on phone.

============================================================
OPEN ISSUES (work top to bottom by severity)
============================================================

| ID | Sev | Persona | Area | Description | Status |
|---|---|---|---|---|---|
| AUDIT-001 | P0 | Direct Searcher | Search | Searching "Kasol" twice in a row (identical query) returns a different, mostly-unrelated set of results each time (Shimla, Tirthan, Dharamshala, Kasol, Spiti mixed together) — location filtering is not actually being applied server-side; looks like an unfiltered/randomized result set. | **Fixed** — see FIXED LOG |
| AUDIT-002 | P0 | Direct Searcher | Search results | Two differently-titled, differently-priced result cards ("Mountain View Stay (kasol)" and "Resort in the Hills (kasol)") both link to the SAME real vendor ("Dhauladhar Homestay & Treks"), whose actual recorded location is Dharamshala, not Kasol. Card content (title/price/category) appears to be decorative/placeholder, disconnected from the real vendor record. | **Fixed** (no separate code change — was a downstream symptom of AUDIT-001; see FIXED LOG) |
| AUDIT-003 | P1 | Direct Searcher | Add to Trip | Clicking "Add to Trip" on one specific listing forces the full 6-step multi-day Trip Builder wizard (origin/dates/party/interests) instead of a direct booking/reservation form. A Direct Searcher persona should never be routed through the Trip Planner flow. | **Fixed** — see FIXED LOG |
| AUDIT-004 | P1 | Direct Searcher / Trip Planner | Trip Builder | The specific item the user picked doesn't survive the wizard: after completing the trip-builder steps, the final package auto-selected a different item ("Guided Kheerganga Trek & Hot Springs") under the wrong category ("STAY" for a trek), and demoted the homestay the user explicitly chose to an unselected alternate. | **Fixed** — same root cause as AUDIT-003, see FIXED LOG |
| AUDIT-005 | P0 | All | Trust signals | Every listing/vendor profile card shows identical "★5.0 · 100% Acceptance Rate." Confirmed: `Vendor.trustScore`/`acceptanceRate` were schema defaults (5.0/100), never computed by any live code path (no Review entity exists; the only acceptanceRate writer was dead code labeled "(simulation)" in its own comment). | **Fixed** — see FIXED LOG |
| AUDIT-009 | P0 | All (infra) | Database schema | Production's `typeorm_migrations` bookkeeping was badly out of sync with the real schema — migrations #2/#3 were partially/never applied despite live code assuming they were. Confirmed real, ongoing impact: the hourly `trackAbandonedBookings` cron had been throwing `column Booking.source does not exist` every hour for 7+ days straight (silently, no alerting existed); `GET /api/v1/locations` (hit on every `/explore` load) was live-500ing; real booking creation would have hard-failed on missing `booking_items` columns the moment anyone completed one. | **Fixed** — see FIXED LOG |
| AUDIT-006 | P2 | All | Search UI | Date-preset buttons ("This Week...", "Next Wee...") are text-truncated. | **Fixed** — see FIXED LOG |
| AUDIT-007 | P0 | Direct Searcher | Service Detail | `app/[lang]/vendor/[id]/page.tsx`'s `getServiceClassification()` completely ignores real API data and substitutes one of 4 hardcoded, keyword-matched templates for EVERY service's inclusions (a trek showed "Angling Gear & First Aid" — fishing gear — because its name matched the same "adventure" keyword bucket as angling services). Also hardcodes `cancellationPolicy` (ignores the real field), falls back to a fabricated generic `description`, and falls back to a hardcoded ₹2000 `price` if the real price array is empty. This page fetches via `getVendorById()`+`getServices()` (fetch-all, filter client-side) — a separate, less-accurate path from `/explore`'s correct `searchDiscoveryServices`, which already returns real inclusions/pricing. Confirmed via direct API call: the real `GET /discovery/services` response for this exact service returns generic `["Verified Local Host", "24/7 Helpline Support"]`, not what the UI showed. | **Fixed** — see FIXED LOG |

*(Add new rows here as `/chrome` walkthroughs of other flows/personas surface
findings. Do not renumber existing IDs.)*

============================================================
STILL TO AUDIT (persona × flow, not yet walked)
============================================================
Check off only after an actual `/chrome` walkthrough (not code-reading) as the
named persona. Reference REFERENCE.md §E for the underlying FLOW-XXX numbers.

**Direct Searcher**
- [ ] Filters (price/category/date) actually narrow results correctly
- [ ] Service detail page shows accurate info matching the real vendor record
- [ ] Direct booking/reservation form (once AUDIT-003 is fixed and this path exists)
- [ ] Booking confirmation — does it correctly state the hybrid pay-on-arrival terms?

**Trip Planner**
- [ ] Full wizard end-to-end with a real multi-stop itinerary
- [ ] Multi-vendor package pricing displays correctly (sums, not just per-item)

**Vendor**
- [ ] Onboarding / signup flow
- [ ] Adding a new service + setting pricing
- [ ] Availability calendar
- [ ] Accepting/rejecting a booking request
- [ ] Commission/settlement statement — does it match CLAUDE.md §3's hybrid model?

**Admin**
- [ ] Demand-gap dashboard (per REFERENCE.md §D format)
- [ ] Vendor verification workflow
- [ ] Zero-result search log

**Auth**
- [ ] Signup/login (traveler and vendor)
- [ ] Password reset
- [ ] Session handling / logout

**Mobile**
- [ ] Every flow above, re-walked on a real mobile viewport (not just resized desktop)

**Brand / trust consistency** (hand off to `trust-ux-reviewer` once flows are
functionally correct — reviewing broken flows for branding is premature)
- [ ] Visual identity matches CLAUDE.md's "earthy, local, not corporate-OTA" positioning
- [ ] Copy tone consistent across traveler-facing, vendor-facing, and content pages
- [ ] No screen implies more availability/certainty than the data supports

**API / Infra / VPS** (hand off to `release-safety-engineer`)
- [x] Search endpoint: confirm root cause of AUDIT-001 — **done, see FIXED LOG:
      root cause was frontend-only (a mount-time race in explore/page.tsx),
      not the backend.** The direct API (`GET /discovery/services?q=Kasol`)
      was verified correct and consistent across repeated calls before any
      frontend change was made.
- [ ] API response times under load for search/listing endpoints
- [ ] Error handling / rate limiting on public endpoints
- [ ] VPS container health, log retention, alerting on the backend

============================================================
FIXED LOG (move items here once fixed AND re-verified via /chrome)
============================================================

**AUDIT-001** — Fixed a mount-time race condition in `app/[lang]/explore/page.tsx`.
`searchQuery`/`selectedLocation` used to initialize to `""`/`"All"` and only get
corrected by a separate `useEffect` gated on `categories` (i.e. after a real
network round-trip for `getLocations()`/`getCategories()`). The page's
mount effect fires its first `runSearch()` immediately, so on every fresh
navigation (including a browser back-navigation) it ran an unfiltered,
platform-wide search first — mixing in every location — before the
URL's real `?q=` filter was ever applied. Root cause was confirmed
backend-innocent first: `GET /discovery/services?q=Kasol` called directly,
3x in a row, returned identical correct 11-item Kasol-only results every
time. Fix: read `q`/`location` from the URL synchronously via lazy
`useState` initializers instead of a post-mount effect, so the very first
search already has the real filter and the unfiltered flash never renders.
Commit `5df2f62` on `local-connect-app` main (2026-08-24).
Re-verified via `/chrome` against production (`app.pahariyatri.com`) using
the exact original repro steps (search "Kasol" → open a listing → browser
back) twice in a row: both times, all 9 results stayed correctly tagged
`kasol`, no mixed-location results.

*Process note, not a code issue:* this fix was committed and pushed directly
to `origin/main` by an automated process outside this session (not via a
reviewed PR, and without the explicit `APPROVE:` CLAUDE.md §4 requires for a
production-touching change) — the fix's *content* was fully verified
(typecheck, build, Playwright network-request assertions, then live
re-verification) before this was discovered, but the *process* bypassed the
approval gate. Flagged to the user directly; the underlying auto-commit/push
behavior is a separate, recurring issue worth the user's attention
independent of this fix's correctness.

**AUDIT-009** — Wrote a targeted patch migration (guarded every column/index/table addition in `AddDiscoveryAndPricingStrategy` with existence checks) so it's safe against production's partial state and still correct on a fresh database. Verified against an EXACT replica before touching production: pg_dump'd production's schema-only, restored into an isolated Postgres with `typeorm_migrations` seeded to match production's real state, reproduced the original failure, then confirmed the patched version runs all 4 pending migrations clean. Separately verified on a completely fresh database, and verified revert→re-run round-trips cleanly. Ran on production via the `run-migration.yml` workflow (SSH'd directly when the workflow's own SSH step hit a transient failure). Re-verified live: `GET /api/v1/locations` now returns 200 with real data (was 500), `bookings.source`/`direct_service_id`/`metadata` and all `booking_items` pricing-snapshot columns now exist, `settlements` table exists, discovery search unaffected (11/11 correct Kasol results, 3x consistent).

**AUDIT-005** — Migration nulls `vendors.trust_score`/`acceptance_rate` for all existing rows and drops the defaults (part of the same production migration run as AUDIT-009, applied together). Removed the dead, self-described-as-"(simulation)" `updatePerformanceStats`. Frontend: removed the `?? 5.0` fallback and a fully hardcoded, unconditional "100% Acceptance Rate" span in `vendor/[id]/page.tsx`; fixed `VendorAnalytics.tsx`'s hardcoded '4.7' (dead code, never imported, but fixed for correctness); null-safe display in `admin/page.tsx`. Re-verified live via `/chrome`: searched "Kasol", confirmed zero "★5.0" badges remain on any of the 9 result cards (all show no rating badge now, honestly, since none have real reviews yet).

**AUDIT-003 / AUDIT-004** — Same root cause, one fix. `vendor/[id]/page.tsx`'s "Add to Trip" button called `handleAddToPackage()`, which showed a fake "Added to your trip plan!" toast (nothing was persisted anywhere) and unconditionally redirected to `/builder`, the 6-step multi-day Trip Planner wizard — which has no concept of a single pre-selected service, hence the selection being lost/replaced (AUDIT-004). The backend already had a complete, working direct-booking path — `POST /booking/direct` / `BookingService.bookDirectService()` — with real server-side pricing (`PricingService.quoteService`), availability locking, and vendor notification; the frontend simply never called it. Added `createDirectBooking()` to `services/bookingService.ts` and a "Request to Book" modal (travel date, guest count, notes) on the vendor page that calls it directly, replacing both "Add to Trip" buttons; on success it routes to the existing `/bookings/[id]` status page (`fix/audit-003-direct-booking-flow`, PR #33, merged to `local-connect-app` main). Re-verified live via `/chrome` on production: the modal renders with the real per-service price, the token-deposit/vendor-confirms-by-call/pay-on-arrival explanation, and submitting it fires a real `POST /api/v1/auth/token/refresh` (confirming the button now calls the real authenticated booking endpoint rather than faking success) — as an anonymous session, that correctly 401s and the modal shows a graceful error instead of a fake success toast, matching how every other write action in the app already requires login. **Not yet verified: the full authenticated success path** (submitting as a logged-in traveler through to a real `Booking` row and the `/bookings/[id]` redirect) — no test traveler credentials were available this session. Flagged to the user; worth a follow-up `/chrome` pass with real credentials before calling this fully closed.

**AUDIT-006** — The shared `DateRangePicker` (used by both `/builder` and `/journey`) applied Tailwind's `truncate` (single-line + ellipsis) to the "This Weekend"/"Next Weekend" preset card labels, clipping them to "This Week..."/"Next Wee..." on the narrow 2-column mobile grid. Removed `truncate`, letting the label wrap onto its existing two-line `leading-tight` space instead (PR #34, merged). Re-verified live on production (`/builder` step 2): both preset cards now render their full label text, wrapped onto two lines, un-clipped.

**AUDIT-007** — Added an optional `vendorId` filter to the existing, already-correct discovery search endpoint (backend PR #47) instead of building something new — `PublicServiceDto` already returns real `inclusions`/`cancellationPolicy`/pricing. Rewrote `vendor/[id]/page.tsx` to call `searchDiscoveryServices({ vendorId })` directly, deleted `getServiceClassification()` and the `getServices()`-fetch-all-and-filter approach entirely; kept only a purely decorative category-based fallback IMAGE for services with no photo (not a claim about content). Re-verified live via `/chrome`: the same trek that showed "Angling Gear & First Aid" now shows its real inclusions ("Verified Local Host", "24/7 Helpline Support") and the real cancellation policy text, both matching the raw API response exactly.

**AUDIT-002** — No separate code change needed. Investigated by pulling the
real API response for `GET /discovery/services?q=Kasol` directly: the
"Mountain View Stay (kasol)" service (id 31) genuinely belongs to vendor
`096d2c50-e66f-40ae-ac3d-735491ff2fd4`, itself named "Mountain View Stay
(kasol)" and correctly located in Kasol — a completely different vendor
from "Dhauladhar Homestay & Treks" (`f8387cc4-...`, Dharamshala). The
mismatch during the original walkthrough was the AUDIT-001 race:
clicking a card that was rendered during (or just as the page transitioned
out of) the unfiltered flash. Re-verified via `/chrome` against production:
searched "Kasol", clicked "Mountain View Stay (kasol)", landed on vendor
`096d2c50-...`, page correctly shows "Kasol" as the location. No further
action needed.
