# Landing page redesign — 27 September 2026

## Audit and design plan

The previous landing page led with decorative gradient mountains, hid reveal content before hydration, depended on client inventory for discovery, and used unrelated stock portraits when vendors had no uploaded image. The homepage inherited a generic description containing unsubstantiated “no agency markup” messaging. Search suggestions lacked arrow-key selection, and shortening a query did not invalidate an in-flight request.

Build a clear travel journey: mountain-photo hero and destination search → three service-category paths → visual trip planner → real destination discovery → local partners → concise booking questions → final exploration CTA. Use warm ivory, forest green and pale lime, generous desktop spacing, stacked phone cards and a consistent action hierarchy. Preserve existing booking routes, locale prefixes, analytics and recent history.

## Implementation

- Responsive local hero photography with Next Image, priority loading and explicit sizes; other photos lazy-load. Decorative category illustrations are lightweight SVG, not inventory.
- Native scroll with a CSS scroll-driven photo effect where supported. One-time section reveals use IntersectionObserver and Web Animations. Content is visible in server HTML and without animation APIs; reduced-motion preferences suppress effects, including preference changes during a reveal.
- Search supports Enter, Escape and arrow keys, an accessible combobox and stale-request invalidation. Existing destination search and planner entry points remain connected.
- Crawlable links replace navigation-only buttons throughout discovery. Server homepage metadata adds a relevant title, description, canonical and WebSite JSON-LD without invented ratings, prices or availability.
- Provider avatars use actual uploads or initials; keep the supplied business name. Discovery destinations come from the API and are restricted to the current Parvati Valley focus. API failures render explicit unavailable states.
- New editorial text lives in the existing English dictionary, with English fallback for locales lacking translations. Other-language editorial translations remain outstanding.
- Native details/summary FAQs, visible focus outlines, touch-friendly primary actions and a skip-to-explore link.

## Verification

- Production build passed; final rerun recorded in session response.
- TypeScript passed. ESLint has no errors; the shared Header retains one pre-existing set-state-in-effect warning, confirmed against HEAD.
- Browser reviewed at 1440px desktop and 390px phone. Overflow checked at 320px, 390px and desktop; 768px tablet also passed. Tablet navigation now uses the compact menu to prevent label wrapping.
- Search for Kasol reached `/en/explore?q=Kasol` with the query preserved; mobile menu opened with expected navigation; booking FAQ expanded; hero trip CTA reached the builder.
- Canonical, page title, description and WebSite JSON-LD verified in browser DOM. HTTP HTML contains the hero, FAQ copy and exactly one H1.
- Local backend inventory is unavailable: validated error states, not real listings or completed booking/payment. Browser extension console noise is unrelated to the page.
- No deployment, commits or production mutations. No claim of measured Core Web Vitals or a Lighthouse score.

## Reference principles

- [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [W3C: reduced-motion support](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)

Photography is downloaded from the existing project's Unsplash sources (`photo-1626621341517-bbf3d9990a23`, `photo-1571401835393-8c5f35328320`). These are editorial mountain images, not photos of listed vendors or proof of a destination's current conditions.
