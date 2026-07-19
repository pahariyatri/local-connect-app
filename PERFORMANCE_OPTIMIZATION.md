# Performance Optimization Guide

## Core Web Vitals Targets

### Largest Contentful Paint (LCP)
- **Target**: < 2.5 seconds
- How to improve:
  1. Mark hero image as priority={true}
  2. Minimize server response time
  3. Remove render-blocking resources
  4. Use dynamic imports for non-critical code

### First Input Delay (FID)
- **Target**: < 100ms
- How to improve:
  1. Break up long JavaScript tasks
  2. Use useCallback for event handlers
  3. Memoize expensive components
  4. Move heavy computation to Web Workers

### Cumulative Layout Shift (CLS)
- **Target**: < 0.1
- How to improve:
  1. Set explicit dimensions on images
  2. Avoid inserting content above existing content
  3. Use transform instead of changing box model
  4. Preload fonts to avoid shift

## Bundle Size Optimization

### Current Status
- Run: `npm run build`
- Analyze: `ANALYZE=true npm run build`

### Target
- **Goal**: < 250KB gzipped
- CSS should be 30-50KB compressed (Tailwind tree-shaking)

### Quick Wins (1-2 hours each)
1. Add dynamic imports for modals/heavy components
2. Mark critical images with priority={true}
3. Memoize atom components with React.memo
4. Remove unused dependencies

## CSS Optimization (Tailwind)

Configuration already optimized in `tailwind.config.ts`:
```
- content: ['./app/**/*.{js,ts,jsx,tsx}']
- Automatic tree-shaking of unused utilities
- Production build removes debug variants
```

## Image Optimization

Always use Next.js Image component:
```tsx
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={true}  // Set for above-fold LCP images
  className="rounded"
/>
```

Benefits:
- Automatic AVIF/WebP conversion
- Responsive serving
- Lazy loading by default
- Prevents layout shift

## Code Splitting

### Route-based (Automatic)
Each route gets separate bundle via App Router

### Component-level (Manual)
```tsx
import dynamic from 'next/dynamic';

const Modal = dynamic(() => import('./Modal'), {
  loading: () => <LoadingSkeleton />,
  ssr: true
});
```

When to use: Heavy components (modals, charts, editors)

## Memoization

### Memoize Components
```tsx
export default React.memo(function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
});
```

### Memoize Computations
```tsx
const expensiveValue = useMemo(
  () => computeExpensiveValue(input),
  [input]
);
```

### Memoize Callbacks
```tsx
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

## Bundle Analysis Commands

```bash
# Build with analysis
npm run build && ANALYZE=true npm run build

# Type check
npm run typecheck

# Lint check
npm run lint

# Find console statements
grep -r 'console\.' app/ --include='*.tsx'

# Find hardcoded URLs
grep -r 'https://' app/ --include='*.tsx'
```

## Lighthouse Audit

1. Build: `npm run build`
2. Start: `next start`
3. DevTools → Lighthouse → Run audit
4. Check for:
   - Performance score 90+
   - LCP < 2.5s
   - CLS < 0.1
   - Total blocking time < 300ms

## Production Checklist

- [ ] No console.log() in production code
- [ ] All TypeScript errors resolved
- [ ] Environment variables properly set
- [ ] No hardcoded URLs or secrets
- [ ] All unused imports removed
- [ ] Component memoization applied
- [ ] Critical images marked priority={true}
- [ ] Dynamic imports for heavy components
- [ ] npm run build succeeds
- [ ] Bundle size < 250KB gzipped
- [ ] Lighthouse score 90+
