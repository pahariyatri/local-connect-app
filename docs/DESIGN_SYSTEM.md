# Design System

Atomic design. Compose upward: **atoms → molecules → organisms → pages**.
A component never reaches "down" into a sibling's internals or "up" to the network.

```mermaid
flowchart BT
    subgraph Atoms["atoms/"]
        Button; Input; Select; Checkbox; Typography; Icon; Image; Modal; Toast; VerifiedBadge
    end
    subgraph Molecules["molecules/"]
        Card; SearchBar; Form; InputGroup; Badge; Avatar; Pagination; PackageSummary
    end
    subgraph Organisms["organisms/"]
        TopNavigation; BottomNavigation; BookingCard; BookingSummary; DashboardMetrics; UserProfile
    end
    Atoms --> Molecules --> Organisms --> Pages["app/[lang]/**/page.tsx"]
```

## Tokens (Tailwind)

```mermaid
flowchart LR
    subgraph Brand
        E["primary #10b981 emerald<br/>hover #059669"]
        I["secondary #6366f1 indigo"]
        A["accent #f59e0b amber"]
    end
    subgraph Neutrals
        S["slate scale — surfaces & text"]
    end
```

- **Primary action** = emerald. **Ink / surfaces** = slate. Keep accents rare.
- Rounded, soft-shadow cards; black uppercase italic display type for headings.
- All copy in `dictionaries/*.json`. **No em-dashes** in UI copy — use commas or periods.

## UX rules (portal, not a shop)

```mermaid
flowchart TD
    G["Goal: few clicks → customised, verified trip"] --> R1["No cart / e-commerce chrome in the header"]
    G --> R2["CTAs speak to planning: 'Start Planning', 'Add to Plan'"]
    G --> R3["Inputs: one purpose, autoComplete, mobile keypad,<br/>focus ring, validate after touch"]
    G --> R4["Customisation is first-class: drag/reorder stops day-wise"]
    G --> R5["Trust signals: verified badges, escrow, server-verified payment"]
```

## Accessibility & mobile

- Tap targets ≥ 40px; sticky bottom actions on wizard steps.
- `aria-invalid` / `aria-describedby` on validated inputs; `role="alert"` on errors.
- Drag-and-drop always has a keyboard/tap fallback (▲ ▼ buttons).
- Theme-aware, responsive; wide content scrolls in its own container.
