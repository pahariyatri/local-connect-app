# Architecture

## Layered view

```mermaid
flowchart TD
    subgraph View["View — app/[lang]/**"]
        P["Pages (page.tsx)"]
        CMP["components/ atoms · molecules · organisms"]
    end
    subgraph State["Client state"]
        CTX["contexts/ — Auth, Localization, TripPlanner,<br/>Vendor, Notification, Cart"]
        Z["store/ — Zustand: trip, booking, user,<br/>service, vendor, wishlist"]
    end
    subgraph Data["Data access"]
        SVC["services/ — auth, booking, catalog, payment,<br/>vendor, search, package, session"]
        AC["lib/apiClient.ts"]
    end
    BE[("Backend REST /api/v1")]

    P --> CMP
    P --> CTX
    P --> Z
    CTX --> SVC
    Z --> SVC
    SVC --> AC
    AC --> BE
```

**Rule of thumb:** pages compose components and read state; only `services/*` talk to
`apiClient`; components never call the network directly.

## Routing & i18n

```mermaid
flowchart LR
    R["Request /path"] --> M{"middleware.ts"}
    M -->|"no locale prefix"| RED["redirect → /en/path"]
    M -->|"protected route<br/>& no accessToken"| AUTH["redirect → /{locale}/auth/send-otp"]
    M -->|"ok"| APP["app/[lang]/layout.tsx"]
    APP --> DICT["getDictionary(locale)<br/>dictionaries/{locale}.json"]
    DICT --> PAGE["page.tsx renders localized"]
```

- Locales: `en · hi · he · de · fr · es` (default `en`), from `i18n-config.ts`.
- Every user-facing string comes from `dictionaries/*.json` via the Localization context.
- Protected prefixes: `/{locale}/profile`, `/dashboard`, `/vendor`.

## Route groups

```mermaid
flowchart TD
    ROOT["/[lang]"] --> HOME["/ (landing)"]
    ROOT --> BUILD["/builder — 6-step trip planner"]
    ROOT --> RES["/results — generated plan"]
    ROOT --> DISC["/discover · /explore"]
    ROOT --> BOOK["/bookings/* — status, payment, success"]
    ROOT --> CHK["/checkout"]
    ROOT --> AUTHG["/auth — send-otp · verify-otp · pin · login"]
    ROOT --> PROF["/profile/*"]
    ROOT --> VEND["/vendor/* — onboarding, services, calendar,<br/>contracts, payouts, dashboard"]
```

## Request lifecycle through apiClient

```mermaid
sequenceDiagram
    participant Page
    participant Service as services/*
    participant Client as apiClient
    participant Cache as session cache
    participant BE as Backend

    Page->>Service: e.g. discoverServices(params)
    Service->>Client: request(path, opts)
    Client->>Client: inject auth token
    alt GET & cacheable
        Client->>Cache: lookup (TTL 30m)
        Cache-->>Client: hit → return
    end
    Client->>BE: fetch /api/v1/...
    BE-->>Client: JSON | error
    Client->>Client: retry on failure · normalize error
    Client-->>Service: typed data
    Service-->>Page: domain object
```

## State: Context vs Zustand

```mermaid
flowchart LR
    subgraph Context["Context — cross-cutting, session-scoped"]
        A["AuthContext — user, token"]
        L["LocalizationContext — dict, lang"]
        T["TripPlannerContext — builder wizard state"]
        No["NotificationContext — toasts"]
    end
    subgraph Zustand["Zustand — domain data, persisted"]
        TS["useTripStore"]
        BS["useBookingStore"]
        US["useUserStore"]
    end
    T -. "on submit" .-> TS
    A -. "hydrates" .-> US
```

Use **Context** for things every subtree needs (auth, language, active wizard).
Use **Zustand** for domain records that outlive a single screen (trip, bookings, user).
