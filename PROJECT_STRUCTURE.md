# Project Structure & Best Practices Guide

## Current Architecture (Next.js 16.1.6)

### ✅ Folder Structure Overview

```
frontend/
├── app/                              # App Router (File-based routing)
│   ├── layout.tsx                   # Root layout (HTML, Body, Providers)
│   ├── globals.css                  # Global styles
│   ├── [lang]/                      # Language dynamic route
│   │   ├── layout.tsx               # Lang layout (TopNav, BottomNav)
│   │   ├── page.tsx                 # Home page
│   │   ├── components/              # Shared UI components
│   │   │   ├── atoms/               # Smallest UI units (Button, Input, etc.)
│   │   │   ├── molecules/           # Composable units (Form, Card, etc.)
│   │   │   └── organisms/           # Complex sections (TopNav, Footer, etc.)
│   │   ├── bookings/                # Feature route
│   │   │   └── page.tsx
│   │   ├── profile/                 # Feature route
│   │   │   └── page.tsx
│   │   ├── vendor/                  # Feature route
│   │   │   ├── dashboard/
│   │   │   ├── services/
│   │   │   └── ...
│   │   └── ...
│   └── fonts/                       # Optimized fonts
├── contexts/                        # React Context (Global state)
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   ├── LocalizationContext.tsx
│   ├── NotificationContext.tsx
│   ├── TripPlannerContext.tsx
│   └── VendorContext.tsx
├── services/                        # API & Business logic
│   ├── authService.ts
│   ├── bookingService.ts
│   ├── catalogService.ts
│   ├── paymentService.ts
│   ├── searchService.ts
│   ├── userService.ts
│   ├── vendorService.ts
│   └── ...
├── lib/                             # Utilities & Helpers
│   ├── apiClient.ts
│   ├── apiHelper.ts
│   ├── authHelper.ts
│   ├── intl.ts
│   ├── pwaConfig.ts
│   └── ...
├── store/                           # Zustand stores (Client state)
│   ├── useBookingStore.ts
│   ├── useServiceStore.ts
│   ├── useUserStore.ts
│   ├── useVendorStore.ts
│   └── useWishlistStore.ts
├── types/                           # TypeScript types
│   ├── api.ts
│   ├── userTypes.ts
│   └── ...
├── utils/                           # Pure utility functions
│   ├── constants.ts
│   ├── excludeRoutes.ts
│   └── validation.ts
├── public/                          # Static assets
│   ├── icons/
│   ├── images/
│   ├── offline.html
│   ├── sw.js                        # Service worker
│   └── ...
├── dictionaries/                    # i18n translations
│   ├── de.json
│   ├── en.json
│   ├── es.json
│   ├── fr.json
│   ├── he.json
│   └── hi.json
├── app.tsx files                    # Config files
├── package.json
├── tsconfig.json
├── next.config.mjs
└── tailwind.config.ts
```

---

## ⚡ Performance & Load Time Optimization

### 1. **Code Splitting & Dynamic Imports**
- Use dynamic imports for heavy components
- Example: `const HeavyComponent = dynamic(() => import('./HeavyComponent'), { loading: () => <Skeleton /> })`

### 2. **Image Optimization**
- All images should use Next.js `<Image>` component (already done via `LocalImage`)
- Keep resolution appropriate for viewport
- Use WebP format where possible

### 3. **CSS Optimization**
- ✅ Using Tailwind CSS (production-ready, tree-shakes unused styles)
- Keep utility usage consistent
- No duplicate class definitions
- Use CSS variables for theme colors

### 4. **Font Loading**
- ✅ Using `next/font/local` (self-hosted, zero layout shift)
- Preload critical fonts in `next.config.mjs`

### 5. **Context Provider Ordering**
✅ Current order is optimal for performance:
```
Root Layout → AuthProvider → NotificationProvider → TripPlannerProvider 
→ CartProvider → LocalizationProvider → Children
```
- Essential contexts first (Auth)
- UI feedback (Notification)
- Feature contexts (TripPlanner, Cart)
- Finally, localization

---

## 📁 Recommended Future Structure (Future-Proof)

### For Scaling:

1. **Private Folders for Organization** (not routable)
   ```
   [lang]/
   ├── _shared/              # Shared utilities across features
   │   ├── hooks/
   │   ├── utils/
   │   └── constants/
   ├── _components/          # Shared UI components
   │   ├── atoms/
   │   ├── molecules/
   │   └── organisms/
   ├── components/           # EXISTS - keep as is
   ├── bookings/
   ├── profile/
   └── vendor/
   ```

2. **Feature-Based Organization Option** (Future)
   ```
   features/
   ├── bookings/
   │   ├── components/
   │   ├── hooks/
   │   ├── services/
   │   ├── [id]/page.tsx
   │   └── page.tsx
   ├── vendor/
   │   ├── dashboard/
   │   ├── services/
   │   ├── components/
   │   └── ...
   └── profile/
   ```

3. **Hooks Library** (Future)
   ```
   hooks/
   ├── useAuth.ts            # Already exists as context
   ├── useCart.ts            # Already exists as context
   ├── useForm.ts            # Reusable form logic
   ├── useDebounce.ts        # Performance utilities
   ├── useFetch.ts           # Data fetching
   └── useLocalStorage.ts    # Local state
   ```

---

## 🎯 Best Practices Implemented

### ✅ Current Strengths
1. **Layout Separation**: TopNavigation and BottomNavigation in layout.tsx (shared, not duplicated)
2. **Context Providers**: Proper ordering and nesting
3. **Component Hierarchy**: Atoms → Molecules → Organisms (proven UI pattern)
4. **Dynamic Routing**: Language-based routing with `[lang]` parameter
5. **Type Safety**: TypeScript throughout
6. **Localization**: i18n with multiple language support
7. **State Management**: Mix of Context API and Zustand stores

### ⚠️ Areas to Monitor
1. **Provider Nesting**: Consider memoization for deeply nested components
2. **Re-renders**: Monitor Context consumers to avoid unnecessary re-renders
3. **Bundle Size**: Regularly analyze with `npm run build`
4. **API Calls**: Implement caching strategies

---

## 🚀 Optimization Checklist

### Immediate (Quick Wins)
- [ ] Add `"use memo"` to heavy components
- [ ] Implement lazy loading for images below fold
- [ ] Use Next.js `<Script>` for analytics (defer/async)
- [ ] Add dynamic imports for modal/drawer components

### Short Term (1-2 weeks)
- [ ] Create reusable hooks library in `hooks/` folder
- [ ] Add error boundaries for feature sections
- [ ] Implement request deduplication in services
- [ ] Add route prefetching for critical paths

### Medium Term (1-3 months)
- [ ] Migrate to Server Components where possible
- [ ] Implement Suspense boundaries
- [ ] Add React Query/SWR for data fetching
- [ ] Create private folders for better organization

### Long Term (3-6 months)
- [ ] Feature-based folder structure
- [ ] Monorepo setup if scaling to multiple apps
- [ ] GraphQL integration (if applicable)
- [ ] Micro-frontends architecture (if needed)

---

## 📋 File Naming Conventions

### ✅ Current Standard (Good)
- Components: PascalCase (`TopNavigation.tsx`)
- Utilities: camelCase (`apiClient.ts`)
- Constants: UPPER_SNAKE_CASE
- Folders: lowercase with hyphens for routes, camelCase for feature folders

### Examples
```
✅ Good
app/[lang]/bookings/page.tsx     # Route
contexts/AuthContext.tsx          # Context provider
services/authService.ts           # Service
lib/apiHelper.ts                  # Helper
utils/validation.ts               # Utility
hooks/useAuth.ts                  # Hook (future)
stores/useUserStore.ts            # Zustand store

❌ Avoid
app/[lang]/Bookings/page.tsx      # Inconsistent capitalization
services/AuthService.ts           # Service files use camelCase + Service suffix
helper/API_CLIENT.ts              # Avoid UPPER_CASE for files
```

---

## 🔄 Import Path Aliases

✅ Already configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Usage**:
```tsx
// ✅ Good - Always use alias for imports
import { Button } from "@/app/[lang]/components/atoms/Button";
import { authService } from "@/services/authService";

// ❌ Avoid relative paths
import { Button } from "../../../components/atoms/Button";
```

---

## 🎨 CSS & Tailwind Best Practices

### ✅ Current Setup
- Tailwind CSS for utility-first styling
- No custom CSS files needed for most cases
- Responsive design with Tailwind breakpoints

### Examples
```tsx
// ✅ Good
<div className="flex justify-center items-center w-full h-screen bg-slate-50 hover:bg-slate-100 transition-all duration-300">

// ❌ Avoid mixing utility and custom CSS
<div className="flex custom-class" style={{ color: 'red' }}>

// ✅ Good - Responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

---

## 🔐 Security Best Practices

1. **Environment Variables**: Use `.env.local` for secrets (not tracked in git)
2. **API Calls**: Always validate data from backend
3. **Form Validation**: Implement on both client and server
4. **Authentication**: Use secure cookies, not localStorage for tokens
5. **XSS Prevention**: Sanitize user input, especially in `dangerouslySetInnerHTML`

---

## 📊 Performance Metrics to Monitor

- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTL** (Time to Interactive): < 3.8s
- **Bundle Size**: Monitor with `npm run analyze`

---

## 🛠️ Development Workflow

### Commands
```bash
npm run dev       # Start dev server with hot reload
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run type-check # Type check with TypeScript
```

### Code Quality Tools
- **ESLint**: Already configured (enabled with `eslint.config.mjs`)
- **TypeScript**: Type safety throughout
- **Tailwind**: CSS linting built-in
- **Next.js**: Built-in performance analysis

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Patterns](https://react.dev)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)

---

**Last Updated**: February 22, 2026
**Status**: Ready for validation and future scaling
