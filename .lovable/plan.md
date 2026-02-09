

# Speed Up Admin Page Loading

## Problem
The admin page shows a blank "Loading..." screen for ~7 seconds because:
1. Auth session check must complete before anything renders
2. After auth, the dashboard makes 4 database queries sequentially before showing content
3. No visual feedback beyond plain text "Loading..."

## Solution
Improve perceived and actual loading speed with these changes:

### 1. Add Skeleton Loading UI
Replace the plain "Loading..." text with animated skeleton placeholders that match the dashboard layout. Users will see the page structure immediately while data loads.

### 2. Parallel Data Loading with React Query
Replace the manual `useEffect` + `Promise.all` pattern with `@tanstack/react-query` (already installed). This provides:
- Cached data on revisit (instant display)
- Background refetching
- Better loading/error states

### 3. Show Auth Form Immediately
Instead of showing "Loading..." while checking auth, render the admin auth form shell immediately with a subtle loading overlay, so the page feels responsive.

---

## Technical Details

### Files to modify:

**src/pages/Admin.tsx**
- Replace the loading state with a skeleton layout instead of plain text
- Use a full-page skeleton that matches the dashboard structure

**src/components/AdminDashboard.tsx**
- Replace manual `useState`/`useEffect` data fetching with `useQuery` hooks from `@tanstack/react-query`
- Each query runs in parallel automatically
- Data is cached so revisiting the page is instant
- Show skeleton cards while individual sections load

**src/components/AdminDashboardSkeleton.tsx** (new file)
- Reusable skeleton component matching the dashboard layout
- Shows animated placeholder cards, stat boxes, and tables

### Expected improvement:
- First visit: ~2-3s faster perceived load (skeleton shows instantly)
- Return visits: near-instant (cached data displayed while refetching in background)
- Auth check still takes time but users see structure, not a blank screen
