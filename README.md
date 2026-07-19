# Local Connect Portal — Frontend

Next.js (App Router) frontend for the Local Connect Portal travel marketplace.
The API/backend lives in a separate repository.

- **Framework:** Next.js 16 (App Router, standalone output)
- **Node:** 22 (see `.nvmrc`)
- **Styling:** Tailwind CSS
- **i18n:** dictionary-based (`dictionaries/`, `i18n-config.ts`)

## Getting started

```bash
npm install --legacy-peer-deps
cp .env.example .env.local     # then edit values
npm run dev                    # http://localhost:3000
```

> The API client appends `/api/v1` to `NEXT_PUBLIC_API_BASE_URL`, so set the
> bare host, e.g. `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`.

## Scripts

| Command         | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start the dev server            |
| `npm run build` | Production build (standalone)   |
| `npm run start` | Serve the production build      |
| `npm run lint`  | Lint                            |

## Environment

Copy `.env.example` → `.env.local`. All client-exposed variables are prefixed
`NEXT_PUBLIC_` and are **baked in at build time** — when building the Docker
image, pass the API URL as a build arg (see below).

## Docker

```bash
# Build (bake the API URL your deployment will talk to)
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.example.com \
  -t local-connect-frontend .

# Run
docker run -p 3000:3000 local-connect-frontend

# Or with compose
NEXT_PUBLIC_API_BASE_URL=https://api.example.com docker compose up --build
```

The image uses Next.js standalone output for a small runtime footprint and runs
as a non-root user with a healthcheck on `/`.

## Deployment

- **Vercel:** import the repo, set `NEXT_PUBLIC_*` env vars, deploy. No Dockerfile needed.
- **Container host (Fly/Render/ECS/K8s):** build the image with the correct
  `NEXT_PUBLIC_API_BASE_URL` build arg and deploy. CI builds the image on every push.

## CORS

Whatever origin this frontend is served from must be allowed by the backend's
`CORS_ORIGIN`. Update that in the backend repo when you deploy to a new domain.
