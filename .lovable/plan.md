

## Analysis

I've reviewed the codebase and found that the **Broker Fee toggle is already fully implemented** on the Admin Dashboard. Here's what I discovered:

### Current Implementation:
1. **Broker Fee Toggle Card** (lines 302-329 in `AdminDashboard.tsx`):
   - A dedicated card with the `Percent` icon showing "Broker Fee Setting"
   - A toggle switch to enable/disable the 5% broker fee
   - Visual feedback when enabled (gold alert box)
   - Already integrated with the `getBrokerFee()` and `setBrokerFee()` functions

2. **Backend Functions** (`storage.ts`):
   - `getBrokerFee()` - retrieves broker fee setting from `app_settings` table
   - `setBrokerFee()` - saves broker fee toggle state to database
   - Properly handles both insert and update operations

3. **Authentication Issue**:
   - The reason you're seeing the login form instead of the dashboard is because the browser session was reset or the authentication token is not being properly recognized
   - The console logs show an admin user exists with ID `1ba1a388-9a46-4fdd-971e-2140cd4d12c1`, but the current session is not loading it

### What Needs to Be Done:

The issue is **not** that the broker fee button is missing—it's already there! The problem is the authentication session. The solution requires:

1. **Sign in to the admin dashboard** using valid admin credentials
2. Once authenticated and the dashboard loads, you'll see the Broker Fee toggle card below the Rent Increase card
3. Click the toggle to enable/disable the 5% broker fee
4. The setting will be saved to the database (visible only to admins)

### Why You're Not Seeing It:
The broker fee toggle appears only after you're successfully logged in as an admin on the Admin Dashboard (`/admin` route). Currently, the page is showing the login form because your session isn't loaded.

