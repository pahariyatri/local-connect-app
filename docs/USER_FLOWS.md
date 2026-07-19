# User Flows

## Traveller: plan & customise a trip

The core promise — *a few clicks, a fully customised route with verified services*.

```mermaid
flowchart TD
    S["Landing /"] -->|"Start Planning"| B1["Step 1 · Origin + destinations"]
    B1 --> B2["Step 2 · Dates"]
    B2 --> B3["Step 3 · Traveling party"]
    B3 --> B4["Step 4 · Interests"]
    B4 --> B5["Step 5 · Stops on the route"]
    B5 --> ORD["Arrange stops (drag / arrows)<br/>sets day-wise order"]
    ORD --> B6["Step 6 · Build package<br/>pick vendors per day"]
    B6 --> R["/results — plan ready"]
    R --> BK["Book verified services"]
```

**Step 5 detail — customising stops:**

```mermaid
flowchart LR
    D["Live discovery<br/>towns on the corridor"] --> PICK["Tap to add a stop"]
    PICK --> LIST["Ordered itinerary list"]
    LIST -->|"drag handle (desktop)"| REORD["Reorder"]
    LIST -->|"▲ ▼ arrows (mobile)"| REORD
    LIST -->|"✕"| REMOVE["Remove stop"]
    REORD --> POS["Position = day-wise sequence<br/>Start → 1 → 2 → … → Final"]
```

## Authentication

```mermaid
flowchart TD
    L["/auth/login — enter mobile"] --> CHK{"account has PIN?"}
    CHK -->|"yes"| PIN["/auth/pin — login with PIN"]
    CHK -->|"no / new"| OTP["/auth/send-otp → /auth/verify-otp"]
    OTP --> SETPIN["Create PIN"]
    PIN --> OK["Authenticated → redirectTo | /profile"]
    SETPIN --> OK
```

Input UX: single-purpose fields, `autoComplete`, numeric keypad on mobile,
focus ring, inline validation only after the field is touched.

## Booking & payment

```mermaid
flowchart LR
    R["/results plan"] --> CO["/checkout — lock inventory"]
    CO --> PAY["Razorpay (server-verified)"]
    PAY -->|"verified"| SUC["/bookings/[id]/success"]
    PAY -->|"cancelled"| BACK["back to idle, no booking"]
    SUC --> ST["/bookings/[id]/status"]
```

> Payment is always verified server-side; the client never trusts the redirect alone.

## Community (travellers + vendors)

One shared feed. Travellers share tips and moments; verified hosts answer and post
updates. Role is derived from the signed-in user; posts and comments carry a role chip.

```mermaid
flowchart TD
    C["/community"] --> F{"Signed in?"}
    F -->|"no"| J["Sign-in prompt<br/>(read freely, post after login)"]
    F -->|"yes"| COMP["Composer — share a thought"]
    C --> TABS["Filter: Everyone · Travellers · Hosts"]
    COMP --> POST["createPost → prepend to feed"]
    C --> CARD["PostCard"]
    CARD --> LIKE["Like (optimistic toggle)"]
    CARD --> CMT["Expand → CommentThread → addComment"]
```

- Data: `services/communityService.ts` (in-memory store now; maps to `/community/*`).
- Reached from the bottom nav — Community tab for both travellers and vendors.

## Vendor onboarding

```mermaid
flowchart TD
    V0["/vendor/onboarding"] --> V1["Personal info"]
    V1 --> V2["Business info + location"]
    V2 --> V3["Service details"]
    V3 --> V4["Documentation + KYC"]
    V4 --> V5["Payment info"]
    V5 --> V6["Agreement + terms"]
    V6 --> V7["Confirmation → Verified badge"]
    V7 --> DASH["/vendor/dashboard"]
```
