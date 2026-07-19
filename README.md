<div align="center">

# 🏔️ PahariYatri — Local Connect Network

**Connecting travellers with authentic local experiences across the Himalayas**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## 📖 Overview

**PahariYatri Local Connect** is a community-driven travel marketplace that bridges the gap between adventurous travellers and trusted local service providers across Himalayan regions. The platform enables locals to list services (guides, homestays, transport, experiences) while giving travellers a curated, verified directory with real-time chat, booking, and payment support.

> 🗂 **This repo** contains the **Next.js frontend**. The backend REST API lives in a separate repository.

---

## ✨ Features

- 🔍 **Discover Local Services** — Browse verified guides, homestays, transport & experiences
- 💬 **Real-time Chat** — Connect with service providers directly in-app
- 🔔 **Push Notifications** — Stay updated on bookings, messages & offers
- 🌐 **Multilingual (i18n)** — Supports Hindi (`hi`) and English (`en`) out of the box
- 💳 **Razorpay Payments** — Seamless INR checkout for bookings
- 📱 **PWA-ready** — Installable on mobile, works offline
- 🗺️ **SEO & Sitemap** — Auto-generated sitemaps and robots.txt

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, standalone output) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand 5 |
| i18n | `next-intl` + dictionary files |
| Payments | Razorpay |
| Push | Web Push / VAPID |
| Runtime | Node 22 (see `.nvmrc`) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>=22` (use `nvm use` if you have nvm)
- **npm** `>=10`
- A running instance of the **Local Connect backend API**

### 1 — Clone & Install

```bash
git clone git@github.com:pahariyatri/local-connect-app.git
cd local-connect-app
npm install --legacy-peer-deps
```

### 2 — Configure Environment

```bash
cp .env.example .env.local
# Open .env.local and fill in your values
```

> **Tip:** The API client automatically appends `/api/v1` to `NEXT_PUBLIC_API_BASE_URL`.
> Set only the bare host — e.g. `http://localhost:4000`, **not** `http://localhost:4000/api/v1`.

### 3 — Start the Dev Server

```bash
npm run dev
# → http://localhost:3000
```

---

## ⚙️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server with hot-reload |
| `npm run build` | Create optimised production build (standalone) |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## 🌿 Environment Variables

Copy `.env.example` → `.env.local` and configure:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | ✅ | Base URL of the backend API (no `/api/v1` suffix) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ✅ | Razorpay public key for checkout |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Optional | Web Push public key |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics measurement ID |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Sentry DSN for error monitoring |
| `NEXT_PUBLIC_ENABLE_CHAT` | Optional | Feature flag — enable real-time chat (default: `true`) |
| `NEXT_PUBLIC_ENABLE_NOTIFICATIONS` | Optional | Feature flag — enable push notifications (default: `true`) |

> ⚠️ All `NEXT_PUBLIC_*` variables are **baked in at build time**. When building the Docker image, pass them as build args (see below).

---

## 🐳 Docker

### Build & Run

```bash
# Build — inject the API URL at build time
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.pahariyatri.com \
  -t pahariyatri-local-connect .

# Run
docker run -p 3000:3000 pahariyatri-local-connect
```

### Docker Compose

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.pahariyatri.com docker compose up --build
```

The Docker image uses **Next.js standalone output** for a minimal runtime footprint and runs as a **non-root user** with a healthcheck on `/`.

---

## 🌐 Deployment

| Platform | How |
|---|---|
| **Vercel** | Import repo → set `NEXT_PUBLIC_*` env vars → deploy. No Dockerfile needed. |
| **Fly.io / Render / ECS / K8s** | Build the image with the correct `NEXT_PUBLIC_API_BASE_URL` build arg → deploy the container. |

> **CORS:** The origin this frontend is served from must be whitelisted in the backend's `CORS_ORIGIN` setting. Update it in the backend repo when deploying to a new domain.

---

## 📁 Project Structure

```
local-connect-app/
├── app/                    # Next.js App Router pages & layouts
│   ├── [lang]/             # Locale-scoped routes (en / hi)
│   ├── api/                # API route handlers
│   └── globals.css         # Global styles
├── components/             # Reusable UI components
├── contexts/               # React context providers
├── dictionaries/           # i18n translation files (en.json, hi.json)
├── lib/                    # API client, helpers, utilities
├── services/               # Business-logic service layer
├── store/                  # Zustand state stores
├── types/                  # Shared TypeScript type definitions
├── utils/                  # Pure utility functions
├── public/                 # Static assets (images, icons, manifest)
├── .env.example            # Environment variable template
├── i18n-config.ts          # Locale configuration
├── middleware.ts            # Next.js middleware (auth, i18n routing)
├── next.config.mjs         # Next.js configuration
└── tailwind.config.ts      # Tailwind CSS configuration
```

---

## 🤝 Contributing

We welcome contributions from the community! Please follow these steps:

1. **Fork** this repository
2. **Create a feature branch** — `git checkout -b feat/your-feature-name`
3. **Commit your changes** — use [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add homestay search filters
   fix: resolve payment gateway redirect loop
   docs: update environment variable table
   ```
4. **Push** your branch — `git push origin feat/your-feature-name`
5. **Open a Pull Request** against `main` with a clear description

### Branch Naming Convention

| Prefix | Purpose |
|---|---|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code refactoring (no feature change) |
| `chore/` | Build, config, dependency updates |
| `hotfix/` | Critical production fixes |

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by the **PahariYatri Team** · [pahariyatri.com](https://pahariyatri.com)

</div>
