# Production Readiness Checklist

## Phase 0: Critical Issues (Must Fix Before Deploy)

### ✅ Code Quality
- [ ] No console.log() in production code (DONE - removed all debug statements)
- [ ] All TypeScript errors resolved (DONE - fixed profile and dashboard)
- [ ] No 'any' types in codebase
- [ ] npm run build succeeds with no errors

### ✅ Configuration
- [ ] NEXT_PUBLIC_API_URL in .env.local
- [ ] API_SECRET in .env.local (NOT .env)
- [ ] .env.local is in .gitignore
- [ ] NODE_ENV=production set for build

### ✅ Security
- [ ] No hardcoded secrets or URLs in code
- [ ] All API credentials in environment variables
- [ ] No stack traces exposed to client
- [ ] Error messages generic for users
- [ ] Detailed logs for developers

## Phase 1: Performance (Implement Week 1)

### Quick Wins (1-2 hours each)

#### Mark Critical Images
- [ ] app/[lang]/page.tsx - Hero image: `priority={true}`
- [ ] TopNavigation - Logo: `priority={true}`
- [ ] Any above-fold images: `priority={true}`

Expected improvement: 200-300ms LCP

#### Add Dynamic Imports
- [ ] Modal components: `dynamic(() => import('./Modal'))`
- [ ] Heavy components: Charts, editors, rich text
- [ ] Expected improvement: 15-20% initial bundle reduction

#### Memoize Components
- [ ] All atoms: `React.memo(Component)`
- [ ] Heavy molecules: Where appropriate
- [ ] Expected improvement: Prevent unnecessary re-renders

#### Bundle Analysis
- [ ] Run: `npm run build && ANALYZE=true npm run build`
- [ ] Identify largest dependencies
- [ ] Plan optimization targets

### Measurement
- [ ] Lighthouse score 90+ ✓
- [ ] LCP < 2.5s ✓
- [ ] CLS < 0.1 ✓
- [ ] FID < 100ms ✓
- [ ] Bundle < 250KB gzipped ✓

## Phase 2: Code Organization (Weeks 2-3)

### Error Handling
- [ ] error.tsx in major routes (bookings, profile, vendor, etc.)
- [ ] Graceful error boundaries
- [ ] User-friendly error messages

### Loading States
- [ ] loading.tsx in major routes
- [ ] Skeleton screens shown during fetch
- [ ] Suspense boundaries where appropriate

### Remove Technical Debt
- [ ] Audit for unused imports (grep -r 'import.*from')
- [ ] Remove commented-out code
- [ ] Clean up JSDoc comments
- [ ] Remove debug files/pages

### Type Safety
- [ ] No 'any' types
- [ ] Strict TypeScript enabled
- [ ] All function parameters typed
- [ ] All API responses typed

## Phase 3: Monitoring (Week 3-4)

### Error Tracking
- [ ] Sentry setup (npm install @sentry/react)
- [ ] Error boundary captures exceptions
- [ ] Developers notified of production errors

### Performance Monitoring
- [ ] Core Web Vitals tracking
- [ ] Lighthouse CI setup (optional)
- [ ] Performance budget enforced

### Server Logs
- [ ] Monitor for HTTP errors
- [ ] Track API response times
- [ ] Database query performance

## Before Deployment (24 Hours)

- [ ] All tests passing
- [ ] No TypeScript errors: `npm run build`
- [ ] Lighthouse 90+
- [ ] No console errors in development
- [ ] All env vars configured
- [ ] Error monitoring working
- [ ] Production database backed up

## Deployment Day

1. **Build for Production**
   ```bash
   npm run build
   ```
   - Should complete in < 5 seconds
   - No errors
   - Output size < 250KB gzipped

2. **Final Verification**
   ```bash
   npm run build && ANALYZE=true npm run build
   ```
   - Bundle breakdown reviewed
   - No unexpected large dependencies

3. **Lighthouse Audit**
   - Run final audit
   - All scores 90+
   - Especially LCP < 2.5s

4. **Manual Testing**
   - Test on mobile device
   - All critical flows working
   - No console errors
   - No visual regressions

5. **Deploy**
   - Deploy to production
   - Monitor error tracking
   - Check Core Web Vitals real-time

## After Deployment

- [ ] Monitor Sentry for errors
- [ ] Check Core Web Vitals in real environment
- [ ] Monitor server logs
- [ ] Get user feedback
- [ ] Track conversion metrics
- [ ] Compare with baseline metrics

## Deployment Rollback Plan

If critical issues occur:
1. Check Sentry for exact error
2. Check network tab for failed requests
3. Rollback to previous version
4. Fix and re-deploy

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Lighthouse Score | 90+ | TRACK |
| LCP (Largest Contentful Paint) | < 2.5s | TRACK |
| FID (First Input Delay) | < 100ms | TRACK |
| CLS (Cumulative Layout Shift) | < 0.1 | TRACK |
| Bundle Size | < 250KB gzip | TRACK |
| Build Time | < 5 seconds | TRACK |
| Time to Interactive | < 4s | TRACK |

## Files Status

```
✅ Fixed: profile/page.tsx - Removed duplicate BottomNavigation
✅ Fixed: vendor/dashboard/page.tsx - Fixed JSX corruption
✅ Cleaned: Removed all console.log() debug statements
✅ Created: DESIGN_PATTERNS.ts - Architecture patterns guide
✅ Created: PRODUCTION_READINESS.ts - Checklist
✅ Verified: No unused imports (ESLint can auto-fix)
```

## Next Steps

1. Run full build: `npm run build`
2. Check TypeScript: `npm run typecheck`
3. Verify bundle: `ANALYZE=true npm run build`
4. Run Lighthouse audit
5. Deploy when all checks pass
