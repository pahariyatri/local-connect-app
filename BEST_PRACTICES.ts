/**
 * Performance & Best Practices Configuration
 * This file documents optimization strategies and checklist
 * Last Updated: February 22, 2026
 */

// ============================================
// IMPORT ORGANIZATION BEST PRACTICES
// ============================================

/**
 * ✅ RECOMMENDED IMPORT ORDER:
 * 1. React & Next.js core
 * 2. Third-party packages
 * 3. Context & Providers
 * 4. Hooks (custom & third-party)
 * 5. Components (Organisms → Molecules → Atoms)
 * 6. Services & Utils
 * 7. Types
 * 8. Styles (CSS modules, globals)
 */

// Example:
// import React, { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import dynamic from "next/dynamic";
// import { useAuth } from "@/contexts/AuthContext";
// import TopNavigation from "@/app/[lang]/components/organisms/TopNavigation";
// import Button from "@/app/[lang]/components/atoms/Button";
// import { authService } from "@/services/authService";
// import type { User } from "@/types/userTypes";
// import "@/app/page.css";

// ============================================
// COMPONENT FILE NAMING CONVENTIONS
// ============================================

/**
 * Directory Structure Examples:
 * 
 * ✅ CORRECT PATHS:
 * - app/[lang]/bookings/page.tsx              (Route page)
 * - app/[lang]/components/atoms/Button.tsx    (Atom component)
 * - contexts/AuthContext.tsx                  (Context provider)
 * - services/authService.ts                   (API service)
 * - lib/apiHelper.ts                          (Utility helper)
 * - types/userTypes.ts                        (Type definitions)
 * - utils/validation.ts                       (Pure functions)
 * - hooks/useAuth.ts                          (Custom hook - future)
 * 
 * ❌ INCORRECT PATHS:
 * - app/[lang]/Bookings/page.tsx              (Route should be lowercase)
 * - components/atoms/button.tsx               (Component should be PascalCase)
 * - Services/AuthService.ts                   (Folder should be lowercase)
 * - lib/API_CLIENT.ts                         (Constants use UPPER_CASE only)
 */

// ============================================
// DYNAMIC IMPORT PATTERN (Heavy Components)
// ============================================

/**
 * Use for:
 * - Modal dialogs
 * - Chart libraries
 * - Rich text editors
 * - Video players
 * - PDF viewers
 * 
 * Benefits:
 * - Reduces initial bundle size
 * - Faster page load
 * - Better performance on slow networks
 */

// Example:
// import dynamic from "next/dynamic";
// import Skeleton from "@/app/[lang]/components/atoms/Skeleton";
// 
// const HeavyModal = dynamic(() => import("./HeavyModal"), {
//   loading: () => <Skeleton />
// });
//
// export default function Page() {
//   return <HeavyModal />;
// }

// ============================================
// CONTEXT PROVIDER ORDERING (Performance)
// ============================================

/**
 * OPTIMAL ORDER (Current Implementation):
 * 
 * Root Layout
 *   └─ AuthProvider (Essential - check user)
 *       └─ NotificationProvider (Quick feedback)
 *           └─ TripPlannerProvider (Feature state)
 *               └─ CartProvider (Feature state)
 *                   └─ LocalizationProvider (i18n)
 *                       └─ Children
 * 
 * REASONING:
 * 1. AuthProvider first: Determines if user can access content
 * 2. NotificationProvider early: Shows alerts/toasts quickly
 * 3. Feature providers last: Heavy computation happens later
 * 4. LocalizationProvider: Applied to all, so goes last
 * 
 * WHY ORDER MATTERS:
 * - Reduces re-render cascades
 * - Essential data loads before features
 * - UI feedback appears quickly
 * - Localization wraps everything
 */

// ============================================
// COMPONENT MEMOIZATION PATTERNS
// ============================================

/**
 * Use React.memo for:
 * - Atoms (Button, Input, Label)
 * - Components with expensive renders
 * - Components receiving object/array props
 * 
 * Pattern:
 * export default React.memo(Component, (prevProps, nextProps) => {
 *   return prevProps.id === nextProps.id; // Return true if same
 * });
 */

// Example:
// import React from "react";
//
// interface ButtonProps {
//   label: string;
//   onClick: () => void;
// }
//
// const Button = React.memo(({ label, onClick }: ButtonProps) => (
//   <button onClick={onClick} className="px-4 py-2 bg-blue-500">
//     {label}
//   </button>
// ));
//
// export default Button;

// ============================================
// LAZY LOADING & SUSPENSE
// ============================================

/**
 * Use Suspense for:
 * - Route transitions
 * - Data loading states
 * - Progressive rendering
 * 
 * Pattern with loading.tsx:
 * app/[lang]/bookings/loading.tsx (Automatically used by Suspense)
 */

// ============================================
// API SERVICE ORGANIZATION
// ============================================

/**
 * Pattern for services:
 * - ONE service file per feature (userService, bookingService)
 * - Use shared apiClient from lib/
 * - Return typed responses
 * - Handle errors consistently
 */

// Example:
// // services/bookingService.ts
// import { apiClient } from "@/lib/apiClient";
// import type { Booking } from "@/types/api";
//
// export const bookingService = {
//   getBookings: async (userId: string): Promise<Booking[]> => {
//     try {
//       return await apiClient.get(`/bookings?userId=${userId}`);
//     } catch (error) {
//       console.error("Failed to fetch bookings:", error);
//       throw error;
//     }
//   },
//
//   createBooking: async (data: Booking): Promise<Booking> => {
//     try {
//       return await apiClient.post("/bookings", data);
//     } catch (error) {
//       console.error("Failed to create booking:", error);
//       throw error;
//     }
//   }
// };

// ============================================
// RESPONSIVE DESIGN (Mobile-First)
// ============================================

/**
 * Always use this order:
 * base → sm → md → lg → xl → 2xl
 * 
 * Example:
 * className="text-sm sm:text-base md:text-lg lg:text-xl"
 * className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
 * className="px-4 sm:px-6 md:px-10 lg:px-12"
 */

// ============================================
// TYPESCRIPT BEST PRACTICES
// ============================================

/**
 * ✅ DO:
 * - Use strict mode: "strict": true in tsconfig.json
 * - Define interfaces for all props
 * - Use union types for enums
 * - Type function parameters and returns
 * 
 * ❌ DON'T:
 * - Use 'any' type
 * - Create unnamed types: (props: { name: string })
 * - Ignore TypeScript errors
 * - Use 'Object' type
 */

// Example:
// ✅ Good
// interface BookingProps {
//   bookingId: string;
//   onCancel: (id: string) => Promise<void>;
//   status: "pending" | "confirmed" | "completed";
// }
//
// export default function BookingCard({ bookingId, onCancel, status }: BookingProps) {
//   // ...
// }

// ❌ Bad
// export default function BookingCard(props: any) {
//   // ...
// }

// ============================================
// ENV VARIABLES ORGANIZATION
// ============================================

/**
 * Files (in priority order):
 * 1. .env.local (LOCAL ONLY - secrets, not in git)
 * 2. .env.development (development specific)
 * 3. .env.production (production specific)
 * 4. .env (shared defaults, tracked in git)
 */

// Pattern in code:
// const apiUrl = process.env.NEXT_PUBLIC_API_URL;
// const apiKey = process.env.API_SECRET; // Only available on server

// ============================================
// URL ASSET ORGANIZATION
// ============================================

/**
 * PUBLIC FOLDER STRUCTURE:
 * public/
 * ├── icons/           (SVG icons, favicons)
 * ├── images/          (PNG, JPG, WebP)
 * ├── fonts/           (WOFF2, TTF - if self-hosting)
 * ├── offline.html     (PWA fallback)
 * ├── sw.js            (Service worker)
 * ├── robots.txt       (SEO)
 * └── sitemap.xml      (SEO)
 */

// ============================================
// NAMING CONVENTIONS SUMMARY
// ============================================

/**
 * Type of Item          | Convention          | Example
 * ────────────────────────────────────────────────────────────
 * Component Files       | PascalCase          | TopNavigation.tsx
 * Component Functions   | PascalCase          | function Button() {}
 * Folders (routes)      | lowercase-kebab     | app/[lang]/bookings/
 * Folders (features)    | camelCase           | contexts/, services/
 * Service Files         | camelCase+Service   | authService.ts
 * Hook Files            | camelCase+use       | useAuth.ts
 * Context Files         | PascalCase+Context  | AuthContext.tsx
 * Store Files           | camelCase+use       | useUserStore.ts
 * Utility Files         | camelCase           | validation.ts
 * Constants/Enums       | UPPER_SNAKE_CASE    | MAX_FILE_SIZE
 * Variables/Functions   | camelCase           | getUserId()
 * Hooks/Custom          | camelCase+use       | useFetchData()
 * Props Interfaces      | PascalCase+Props    | ButtonProps
 * State Interfaces      | PascalCase+State    | UserState
 * Types/Interfaces      | PascalCase          | User, Booking
 */

// ============================================
// PERFORMANCE MONITORING CHECKLIST
// ============================================

/**
 * Core Web Vitals Targets:
 * - FCP (First Contentful Paint): < 1.8s ✅
 * - LCP (Largest Contentful Paint): < 2.5s 
 * - CLS (Cumulative Layout Shift): < 0.1
 * - TTFB (Time to First Byte): < 0.6s
 * - TTI (Time to Interactive): < 3.8s
 * 
 * Measurement Tools:
 * - Google Lighthouse
 * - WebPageTest
 * - Chrome DevTools
 * - Next.js Analytics
 */

// ============================================
// COMMON PITFALLS TO AVOID
// ============================================

/**
 * ❌ AVOID:
 * 1. Importing entire Context - use custom hooks
 * 2. Creating contexts for single values
 * 3. Updating Context from multiple places
 * 4. Storing server data in Context
 * 5. Using 'use client' unnecessarily
 * 6. Prop drilling deeply (> 3 levels)
 * 7. Inline event handlers in loops
 * 8. Not memoizing expensive computations
 * 9. Missing error boundaries for features
 * 10. Over-fetching or under-fetching data
 * 
 * ✅ INSTEAD:
 * 1. Create custom hooks to abstract Context
 * 2. Use Zustand stores for client state
 * 3. Use reducer pattern for complex state
 * 4. Cache server data with React Query/SWR
 * 5. Only use 'use client' for interactive components
 * 6. Use composition or Context to avoid prop drilling
 * 7. Use useCallback for handlers in loops
 * 8. Use useMemo and useCallback appropriately
 * 9. Wrap features in error.tsx or Error Boundary
 * 10. Implement request deduplication and caching
 */

// ============================================
// SECURITY CHECKLIST
// ============================================

/**
 * ✅ DO:
 * - Validate all user input
 * - Use HTTPS only
 * - Implement rate limiting
 * - Use secure cookie flags (HttpOnly, Secure, SameSite)
 * - Sanitize HTML if rendering user content
 * - Use Content Security Policy
 * - Store secrets in environment variables
 * - Implement CSRF protection
 * - Validate on both client AND server
 * - Use TypeScript for type safety
 * 
 * ❌ DON'T:
 * - Store sensitive data in localStorage
 * - Use dangerouslySetInnerHTML with user input
 * - Expose API keys in client code
 * - Trust client-side validation alone
 * - Store passwords in plain text
 * - Implement custom authentication
 * - Use eval() or similar
 * - Disable CORS without reason
 */

export const PERFORMANCE_CHECKLIST = {
  optimization: [
    "Use dynamic imports for heavy components",
    "Implement image lazy loading",
    "Minify and compress assets",
    "Setup CDN for static assets",
    "Implement request caching",
    "Use production builds for testing"
  ],
  
  codeQuality: [
    "Run ESLint before commit",
    "Maintain TypeScript strict mode",
    "Write tests for critical features",
    "Use meaningful variable names",
    "Keep functions small and focused",
    "Document complex logic"
  ],
  
  monitoring: [
    "Setup error tracking (e.g., Sentry)",
    "Monitor Core Web Vitals",
    "Track API response times",
    "Log user interactions",
    "Setup alerts for errors",
    "Review logs regularly"
  ]
};

/**
 * Last Updated: February 22, 2026
 * Status: Production Ready
 * Version: 1.0.0
 */
