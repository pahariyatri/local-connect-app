/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DESIGN PATTERNS & ARCHITECTURAL DECISIONS
 * Local Connect Portal - Why & When
 * February 22, 2026
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ===========================================================================
// TABLE OF CONTENTS
// ===========================================================================
// 1. Component Architecture (Atomic Design)
// 2. State Management Patterns
// 3. API & Data Fetching
// 4. Routing & Navigation
// 5. Error Handling
// 6. Performance Patterns
// 7. Security Patterns
// 8. Code Organization Patterns


// ===========================================================================
// 1. ATOMIC DESIGN PATTERN
// ===========================================================================

/**
 * WHY: Proven to scale from 10 to 1000+ components
 * WHEN: Always use this structure
 * 
 * HIERARCHY:
 * Atoms (Smallest) → Molecules → Organisms → Pages
 * 
 * ✅ ATOMS (Minimal, single responsibility)
 * Files: app/[lang]/components/atoms/
 * Examples: Button, Input, Label, Badge, Avatar, Icon
 * 
 * When to use:
 * - Single element UI
 * - No complex logic
 * - Reusable across many screens
 * - Examples: <Button />, <Input />, <Label />
 * 
 * Pattern:
 * ```tsx
 * interface ButtonProps {
 *   label: string;
 *   onClick: () => void;
 *   variant?: 'primary' | 'secondary';
 * }
 * 
 * export default React.memo(({ label, onClick, variant = 'primary' }: ButtonProps) => (
 *   <button className={`btn btn-${variant}`} onClick={onClick}>
 *     {label}
 *   </button>
 * ));
 * ```
 * 
 * Benefits:
 * - Fast renders (memoized)
 * - Type-safe props
 * - Highly reusable
 * - Easy to test
 * 
 * ---
 * 
 * ✅ MOLECULES (Combination of atoms)
 * Files: app/[lang]/components/molecules/
 * Examples: Form, Card, SearchBox, Avatar+Label
 * 
 * When to use:
 * - Combining 2-3 atoms
 * - Simple business logic
 * - Specific use case
 * - Examples: <SearchBox />, <UserCard />, <FormField />
 * 
 * Pattern:
 * ```tsx
 * interface FormFieldProps {
 *   label: string;
 *   input: string;
 *   onChange: (value: string) => void;
 *   error?: string;
 * }
 * 
 * export default function FormField({ label, input, onChange, error }: FormFieldProps) {
 *   return (
 *     <div>
 *       <Label text={label} />
 *       <Input value={input} onChange={onChange} />
 *       {error && <Error message={error} />}
 *     </div>
 *   );
 * }
 * ```
 * 
 * Benefits:
 * - Logical grouping
 * - Reduced duplication
 * - Easier to maintain
 * - Testable pieces
 * 
 * ---
 * 
 * ✅ ORGANISMS (Complex sections)
 * Files: app/[lang]/components/organisms/
 * Examples: TopNavigation, Card, List, Form sections
 * 
 * When to use:
 * - Multiple molecules/atoms
 * - Significant business logic
 * - Specific domain logic
 * - Examples: <TopNavigation />, <BookingCard />, <Dashboard />
 * 
 * Pattern:
 * ```tsx
 * interface TopNavigationProps {
 *   leftButton?: { label: string; onClick: () => void };
 *   rightButtons?: { label: string; onClick: () => void }[];
 * }
 * 
 * export default function TopNavigation({ leftButton, rightButtons }: TopNavigationProps) {
 *   const { user } = useAuth();
 *   
 *   return (
 *     <nav>
 *       {leftButton && <Button {...leftButton} />}
 *       <div>Logo</div>
 *       {rightButtons && rightButtons.map((btn, i) => <Button key={i} {...btn} />)}
 *     </nav>
 *   );
 * }
 * ```
 * 
 * Benefits:
 * - Complete features
 * - Clear responsibilities
 * - Can contain state/effects
 * - Easier to find bugs
 * 
 * ---
 * 
 * ✅ PAGES (Route components)
 * Files: app/[lang]/*/page.tsx
 * Examples: BookingsPage, ProfilePage, HomePage
 * 
 * When to use:
 * - One per route
 * - Layout + organisms
 * - Page-specific logic
 * - Examples: page.tsx with content
 * 
 * Pattern:
 * ```tsx
 * export default function BookingsPage() {
 *   const { bookings } = useCart();
 *   
 *   return (
 *     <div className="page-container">
 *       <Typography variant="h1">Your Bookings</Typography>
 *       <BookingsList bookings={bookings} />
 *     </div>
 *   );
 * }
 * ```
 * 
 * Benefits:
 * - Clear route structure
 * - App Router optimization
 * - Automatic code splitting
 * - Clean separation
 */

export const ATOMIC_DESIGN = {
  hierarchy: ['Atoms', 'Molecules', 'Organisms', 'Pages'],
  
  atomExamples: [
    'Button.tsx',
    'Input.tsx',
    'Label.tsx',
    'Badge.tsx',
    'Icon.tsx',
    'Avatar.tsx'
  ],
  
  moleculeExamples: [
    'FormField.tsx (Label + Input + Error)',
    'SearchBox.tsx (Icon + Input + Button)',
    'UserCard.tsx (Avatar + Name + Status)',
    'PriceDisplay.tsx (Currency + Amount + Discount)'
  ],
  
  organismExamples: [
    'TopNavigation.tsx',
    'BottomNavigation.tsx',
    'BookingCard.tsx',
    'UserProfile.tsx',
    'SearchResults.tsx'
  ]
};


// ===========================================================================
// 2. STATE MANAGEMENT PATTERNS
// ===========================================================================

/**
 * DECISION TREE:
 * 
 * Is it app state (auth, locale)?
 *   → YES: Use React Context (already have: AuthContext, LocalizationContext)
 *   → NO: Go to next question
 * 
 * Is it complex/changes frequently?
 *   → YES: Use Zustand store (already have: useUserStore, useBookingStore)
 *   → NO: Go to next question
 * 
 * Is it just for this component?
 *   → YES: Use useState/useReducer
 *   → NO: Use Context
 * 
 * Is it fetched from server?
 *   → YES: Use React Query or SWR (future: recommended)
 *   → NO: Use appropriate method above
 */

export const STATE_MANAGEMENT = {
  "React Context (Global)": {
    uses: [
      "Authentication (AuthContext) ✅ EXISTS",
      "Localization (LocalizationContext) ✅ EXISTS",
      "Theme/Dark mode",
      "Notifications (NotificationContext) ✅ EXISTS",
      "Trip Planner state (TripPlannerContext) ✅ EXISTS"
    ],
    
    pattern: `
      // Create context
      const AuthContext = createContext<AuthContextType | undefined>(undefined);
      
      // Provider component
      export function AuthProvider({ children }) {
        const [user, setUser] = useState(null);
        
        return (
          <AuthContext.Provider value={{ user, setUser }}>
            {children}
          </AuthContext.Provider>
        );
      }
      
      // Custom hook
      export function useAuth() {
        const context = useContext(AuthContext);
        if (!context) throw new Error('useAuth must be within AuthProvider');
        return context;
      }
    `,
    
    when: "App-wide state needed by multiple routes",
    benefit: "Built-in to React, no extra dependencies"
  },
  
  "Zustand (Local/Feature State)": {
    uses: [
      "User preferences (useUserStore) ✅ EXISTS",
      "Booking data (useBookingStore) ✅ EXISTS",
      "Service catalog (useServiceStore) ✅ EXISTS",
      "Vendor data (useVendorStore) ✅ EXISTS",
      "Wishlist (useWishlistStore) ✅ EXISTS"
    ],
    
    pattern: `
      // Create store
      import { create } from 'zustand';
      
      interface UserStore {
        user: User | null;
        setUser: (user: User) => void;
        logout: () => void;
      }
      
      export const useUserStore = create<UserStore>((set) => ({
        user: null,
        setUser: (user) => set({ user }),
        logout: () => set({ user: null })
      }));
      
      // Usage
      const { user, setUser } = useUserStore();
    `,
    
    when: "Feature or page-level state that's frequently updated",
    benefit: "Simple, lightweight, excellent performance"
  },
  
  "useState/useReducer (Component State)": {
    uses: [
      "Form inputs (currentStep, formData)",
      "UI state (isOpen, expanded)",
      "Loading state (isLoading, error)"
    ],
    
    pattern: `
      // Simple state
      const [count, setCount] = useState(0);
      
      // Complex state with reducer
      const [state, dispatch] = useReducer((prev, action) => {
        switch (action.type) {
          case 'INCREMENT': return { count: prev.count + 1 };
          case 'RESET': return { count: 0 };
          default: return prev;
        }
      }, initialState);
    `,
    
    when: "State only needed in one component",
    benefit: "Simple, no boilerplate"
  }
};


// ===========================================================================
// 3. API & DATA FETCHING PATTERNS
// ===========================================================================

/**
 * CURRENT APPROACH (Works well):
 * - Services layer: services/authService.ts, services/bookingService.ts
 * - Each service has one responsibility
 * - Returns typed data using TypeScript interfaces
 * 
 * PATTERN:
 * 1. Create service with typed methods
 * 2. Call from components using hooks
 * 3. Store result in Zustand or useState
 * 4. Handle errors with error boundaries
 * 
 * FUTURE IMPROVEMENT (Phase 3):
 * - Add React Query for automatic caching & deduplication
 * - Reduces manual state management
 * - Automatic refetch on focus
 */

export const API_PATTERNS = {
  "Service Layer (Current)": {
    why: "Centralized API calls, easy to mock in tests",
    
    example: `
      // services/bookingService.ts
      import { apiClient } from '@/lib/apiClient';
      import type { Booking } from '@/types/api';
      
      export const bookingService = {
        // Typed return
        getBookings: async (userId: string): Promise<Booking[]> => {
          try {
            return await apiClient.get(\`/bookings?userId=\${userId}\`);
          } catch (error) {
            console.error('Failed to fetch bookings:', error);
            throw error;
          }
        },
        
        createBooking: async (data: Booking): Promise<Booking> => {
          try {
            return await apiClient.post('/bookings', data);
          } catch (error) {
            console.error('Failed to create booking:', error);
            throw error;
          }
        }
      };
    `,
    
    usage: `
      // In component
      const [bookings, setBookings] = useState<Booking[]>([]);
      const [error, setError] = useState<string | null>(null);
      
      useEffect(() => {
        bookingService
          .getBookings(userId)
          .then(setBookings)
          .catch(err => setError(err.message));
      }, [userId]);
    `
  },
  
  "React Query (Recommended Future)": {
    why: "Automatic caching, deduplication, background refetch",
    
    example: `
      import { useQuery } from '@tanstack/react-query';
      
      function BookingsList() {
        const { data: bookings, isLoading, error } = useQuery({
          queryKey: ['bookings', userId],
          queryFn: () => bookingService.getBookings(userId)
        });
        
        if (isLoading) return <LoadingSkeleton />;
        if (error) return <ErrorMessage error={error} />;
        
        return <BookingsList bookings={bookings} />;
      }
    `,
    
    benefits: [
      "Automatic caching",
      "Request deduplication",
      "Background refetch",
      "Retry logic",
      "Pagination helpers"
    ]
  }
};


// ===========================================================================
// 4. ROUTING & NAVIGATION PATTERNS
// ===========================================================================

/**
 * NEXT.JS APP ROUTER (What we're using):
 * - File-system based routing
 * - [lang] for language segments
 * - Dynamic routes with [...slug]
 * - Automatic code splitting
 * - Server Components by default
 */

export const ROUTING_PATTERNS = {
  "Language Routing": {
    why: "Support i18n with clean URLs",
    structure: `
      app/
      ├── [lang]/                    # Dynamic language segment
      │   ├── layout.tsx             # Layout for entire app
      │   ├── page.tsx               # Home: /en, /fr, /de
      │   ├── bookings/
      │   │   └── page.tsx           # /en/bookings
      │   ├── profile/
      │   │   └── page.tsx           # /en/profile
      │   └── vendor/
      │       ├── dashboard/page.tsx # /en/vendor/dashboard
      │       └── services/page.tsx  # /en/vendor/services
    `,
    
    usage: `
      // Access language from params
      function Page(props: { params: Promise<{ lang: Locale }> }) {
        const { lang } = await props.params;
        
        return <div>Current language: {lang}</div>;
      }
    `,
    
    benefit: "Clean URLs, automatic i18n routing"
  },
  
  "Dynamic Routes": {
    why: "Generate pages from data",
    
    example: `
      // app/[lang]/bookings/[id]/page.tsx
      // Matches: /en/bookings/BK-9021
      
      export default function BookingDetail(props: { 
        params: Promise<{ lang: string; id: string }> 
      }) {
        const { lang, id } = await props.params;
        const booking = await fetchBooking(id);
        
        return <BookingDetailView booking={booking} />;
      }
    `,
    
    benefit: "Automatic route generation, type-safe params"
  },
  
  "Shared Layout": {
    why: "Avoid duplication, consistent UI",
    
    current: `
      // app/[lang]/layout.tsx - ONE PLACE
      export default function LangLayout({ children }) {
        return (
          <div>
            <TopNavigation />      {/* Shared */}
            {children}             {/* Page content */}
            <BottomNavigation />   {/* Shared */}
          </div>
        );
      }
    `,
    
    benefit: "No duplication, state preserved during navigation"
  }
};


// ===========================================================================
// 5. ERROR HANDLING PATTERNS
// ===========================================================================

/**
 * DEFENSIVE PROGRAMMING:
 * 1. Prevent errors (validation)
 * 2. Catch errors (boundaries)
 * 3. Recover gracefully (fallbacks)
 */

export const ERROR_PATTERNS = {
  "Error Boundaries": {
    why: "Prevent entire app crash from component errors",
    
    location: "app/[lang]/[route]/error.tsx",
    
    example: `
      // app/[lang]/bookings/error.tsx
      'use client';
      
      export default function Error({
        error,
        reset
      }: {
        error: Error & { digest?: string };
        reset: () => void;
      }) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                {error.message || 'Something went wrong'}
              </h2>
              <button 
                onClick={reset}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Try again
              </button>
            </div>
          </div>
        );
      }
    `,
    
    coverage: [
      "app/[lang]/bookings/error.tsx",
      "app/[lang]/profile/error.tsx",
      "app/[lang]/vendor/dashboard/error.tsx"
    ]
  },
  
  "Loading States": {
    why: "Show skeleton while loading",
    
    location: "app/[lang]/[route]/loading.tsx",
    
    example: `
      // app/[lang]/bookings/loading.tsx
      export default function Loading() {
        return (
          <div className="min-h-screen bg-slate-50">
            <div className="animate-pulse space-y-4 pt-24">
              <div className="h-8 bg-slate-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-48 bg-slate-200 rounded"></div>
                <div className="h-48 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        );
      }
    `,
    
    benefit: "Perceived faster load time"
  },
  
  "Form Validation": {
    why: "Prevent invalid data submission",
    
    pattern: `
      // Client-side validation
      function validateEmail(email: string): string | null {
        if (!email) return 'Email required';
        if (!email.includes('@')) return 'Invalid email';
        return null;
      }
      
      // Server-side validation (always needed!)
      // Implement in API route or server action
      export async function createBooking(data: Booking) {
        if (!data.userId) throw new Error('User ID required');
        if (data.amount < 0) throw new Error('Invalid amount');
        // Save to database
      }
    `,
    
    rule: "ALWAYS validate on server - never trust client"
  }
};


// ===========================================================================
// 6. PERFORMANCE PATTERNS
// ===========================================================================

export const PERFORMANCE_PATTERNS = {
  "Image Optimization": {
    why: "Images are usually bulk of page size",
    
    pattern: `
      // ALWAYS use Next.js Image component
      import Image from 'next/image';
      
      // ✅ GOOD
      <Image
        src="/image.jpg"
        alt="Description"
        width={800}
        height={600}
        priority={false}  // Set true for above-fold LCP images
        className="rounded"
      />
      
      // ❌ BAD - Don't use <img>
      <img src="/image.jpg" />
    `,
    
    benefits: [
      "Automatic AVIF/WebP conversion",
      "Responsive serving",
      "Lazy loading by default",
      "Prevents layout shift"
    ]
  },
  
  "Code Splitting": {
    why: "Load only code needed for current route",
    
    pattern: `
      // ✅ GOOD - Route-based (automatic)
      // Each route gets separate bundle via App Router
      
      // ✅ GOOD - Component-level (manual)
      import dynamic from 'next/dynamic';
      
      const Modal = dynamic(() => import('./Modal'), {
        loading: () => <LoadingSkeleton />,
        ssr: true  // Set false for client-only components
      });
    `,
    
    when: "Heavy components (modals, charts, editors)"
  },
  
  "Memoization": {
    why: "Prevent unnecessary re-renders",
    
    pattern: `
      // Memoize expensive atom components
      export default React.memo(function Button({ 
        label, 
        onClick 
      }: ButtonProps) {
        return <button onClick={onClick}>{label}</button>;
      });
      
      // Memoize expensive computations
      const expensiveValue = useMemo(
        () => computeExpensiveValue(input),
        [input]
      );
      
      // Memoize callbacks
      const handleClick = useCallback(() => {
        doSomething(value);
      }, [value]);
    `,
    
    when: "Components re-render too frequently"
  }
};


// ===========================================================================
// 7. SECURITY PATTERNS
// ===========================================================================

export const SECURITY_PATTERNS = {
  "Input Validation": {
    why: "Prevent injection attacks and invalid data",
    
    pattern: `
      // Always validate and sanitize
      function validateBookingInput(data: unknown): Booking {
        if (typeof data !== 'object' || !data) throw new Error('Invalid');
        const obj = data as Record<string, unknown>;
        
        if (typeof obj.userId !== 'string') throw new Error('Invalid userId');
        if (typeof obj.amount !== 'number') throw new Error('Invalid amount');
        
        return { userId: obj.userId, amount: obj.amount };
      }
    `,
    
    rules: [
      "Validate types",
      "Check ranges/lengths",
      "Sanitize strings",
      "Use TypeScript for compile-time safety"
    ]
  },
  
  "Authentication": {
    why: "Protect sensitive data and actions",
    
    pattern: `
      // In AuthContext or middleware
      function isAuthenticated(token?: string): boolean {
        return !!token && isValidToken(token);
      }
      
      // Use in components
      export default function ProtectedPage() {
        const { user } = useAuth();
        
        if (!user) {
          return <Redirect to="/login" />;
        }
        
        return <PageContent />;
      }
    `,
    
    rule: "Validate authentication on EVERY request"
  },
  
  "Environment Variables": {
    why: "Keep secrets secret",
    
    pattern: `
      // .env.local (NOT in git)
      NEXT_PUBLIC_API_URL=https://api.example.com
      API_SECRET=super-secret-key
      
      // Usage in code
      const publicUrl = process.env.NEXT_PUBLIC_API_URL;  // Available on client
      const secret = process.env.API_SECRET;              // Server-only
      
      // ❌ NEVER do this
      // const key = 'sk_123';  // Secrets in code!
    `,
    
    rule: "Environment variables, not hardcoded"
  }
};


// ===========================================================================
// 8. CODE ORGANIZATION PATTERNS
// ===========================================================================

export const ORGANIZATION_PATTERNS = {
  "Folder Structure Consistency": {
    rule: "Route folders = lowercase-kebab, Feature folders = camelCase",
    
    examples: {
      routes: [
        "app/[lang]/bookings/     ✅ lowercase-kebab",
        "app/[lang]/profile/      ✅ lowercase-kebab",
        "app/[lang]/vendor/ ✅ lowercase-kebab"
      ],
      
      features: [
        "contexts/                ✅ camelCase",
        "services/                ✅ camelCase",
        "lib/                      ✅ camelCase",
        "utils/                    ✅ camelCase"
      ]
    }
  },
  
  "File Naming": {
    components: "PascalCase.tsx (TopNavigation.tsx)",
    services: "camelCase.ts (authService.ts)",
    hooks: "use + camelCase.ts (useAuth.ts)",
    types: "PascalCase.ts (userTypes.ts)",
    utils: "camelCase.ts (validation.ts)",
    constants: "UPPER_SNAKE_CASE (MAX_FILE_SIZE)"
  },
  
  "Import Organization": {
    order: [
      "1. React & Next.js",
      "2. Third-party packages",
      "3. Contexts & Providers",
      "4. Hooks",
      "5. Components",
      "6. Services",
      "7. Types",
      "8. Styles"
    ],
    
    example: `
      import React, { useState } from 'react';
      import { useRouter } from 'next/navigation';
      import { useAuth } from '@/contexts/AuthContext';
      import Button from '@/components/atoms/Button';
      import { authService } from '@/services/authService';
      import type { User } from '@/types/userTypes';
      import '@/app/page.css';
    `
  }
};


// ===========================================================================
// DECISION FLOWCHART
// ===========================================================================

export const DECISION_FLOWCHART = {
  "Where does this component go?": {
    "Is it a single UI element?": {
      yes: "→ Atoms folder (Button, Input, Label)",
      no: "→ Next question"
    },
    
    "Is it combining a few atoms?": {
      yes: "→ Molecules folder (FormField, Card)",
      no: "→ Next question"
    },
    
    "Is it a complete section/feature?": {
      yes: "→ Organisms folder (TopNav, Dashboard)",
      no: "→ Rethink component size"
    }
  },
  
  "What state management should I use?": {
    "Is it app-wide state?": {
      yes: "→ React Context (AuthContext, LocalizationContext)",
      no: "→ Next question"
    },
    
    "Is it feature/page state?": {
      yes: "→ Zustand store (useUserStore, useBookingStore)",
      no: "→ Next question"
    },
    
    "Is it component-only?": {
      yes: "→ useState/useReducer",
      no: "→ Rethink state scope"
    }
  },
  
  "How do I fetch data?": {
    "Is it server-only?": {
      yes: "→ Server Component / API Route",
      no: "→ Next question"
    },
    
    "Is it complex caching needed?": {
      yes: "→ React Query (future recommendation)",
      no: "→ Service layer + useState"
    }
  }
};


// ===========================================================================
// PATTERN SELECTION GUIDE
// ===========================================================================

export const QUICK_REFERENCE = {
  "I need to...": {
    "...create a button": "Atoms/Button.tsx - React.memo for performance",
    "...make a form field": "Molecules/FormField.tsx - Uses atoms",
    "...build a page": "page.tsx - Uses organisms, handles data",
    "...store user data": "useUserStore (Zustand) - Fast, simple",
    "...handle auth": "useAuth hook from AuthContext - App-wide",
    "...make API call": "services/ layer - Typed, testable",
    "...protect a route": "useAuth check in component",
    "...optimize image": "<Image> component with priority",
    "...handle errors": "error.tsx + try/catch",
    "...show loading": "loading.tsx + Suspense"
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUMMARY: ALL PATTERNS ARE DESIGNED FOR:
 * 
 * 1. SCALABILITY: Works for 1-1000+ components
 * 2. MAINTAINABILITY: Clear responsibility + easy to find code
 * 3. PERFORMANCE: Optimized re-renders + code splitting
 * 4. TESTABILITY: Can test components, services, hooks independently
 * 5. DEVELOPER EXPERIENCE: Fast feedback + clear patterns
 * 
 * FOLLOW THESE PATTERNS AND YOUR CODEBASE WILL SCALE FOREVER.
 * ═══════════════════════════════════════════════════════════════════════════
 */
