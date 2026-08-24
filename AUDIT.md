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
| AUDIT-002 | P0 | Direct Searcher | Search results | Two differently-titled, differently-priced result cards ("Mountain View Stay (kasol)" and "Resort in the Hills (kasol)") both link to the SAME real vendor ("Dhauladhar Homestay & Treks"), whose actual recorded location is Dharamshala, not Kasol. Card content (title/price/category) appears to be decorative/placeholder, disconnected from the real vendor record. | Open — likely explained by AUDIT-001's root cause (see note below); needs its own re-verification pass now that AUDIT-001 is fixed before treating as still-open |
| AUDIT-003 | P1 | Direct Searcher | Add to Trip | Clicking "Add to Trip" on one specific listing forces the full 6-step multi-day Trip Builder wizard (origin/dates/party/interests) instead of a direct booking/reservation form. A Direct Searcher persona should never be routed through the Trip Planner flow. | Open |
| AUDIT-004 | P1 | Direct Searcher / Trip Planner | Trip Builder | The specific item the user picked doesn't survive the wizard: after completing the trip-builder steps, the final package auto-selected a different item ("Guided Kheerganga Trek & Hot Springs") under the wrong category ("STAY" for a trek), and demoted the homestay the user explicitly chose to an unselected alternate. | Open |
| AUDIT-005 | P1 (suspected — confirm before fixing) | All | Trust signals | Every listing/vendor profile card shows identical "★5.0 · 100% Acceptance Rate." Confirm whether `Vendor.trustScore` is a real computed field or a schema default never overwritten by real reviews — if the latter, this is fabricated trust data and violates CLAUDE.md's no-fabrication rule; must show "Not yet rated" or similar until real data exists. | Open |
| AUDIT-006 | P2 | All | Search UI | Date-preset buttons ("This Week...", "Next Wee...") are text-truncated. | Open |

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
