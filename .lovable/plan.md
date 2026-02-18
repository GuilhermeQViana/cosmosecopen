
# Fix: Vendor Creation Error - Organization Mismatch

## Root Cause

The error "Nao foi possivel salvar o fornecedor" is caused by an **organization ID mismatch** between the frontend and the database.

- The frontend (OrganizationContext) believes the active organization is `615b8b14-...`
- The database `profiles.organization_id` is set to `fd2deb13-...`
- When inserting a vendor with `organization_id = 615b8b14-...`, the RLS policy calls `user_belongs_to_org()`, which checks `profiles.organization_id` -- and it does not match, so the insert is **rejected**.

This can happen when:
- The user switches organizations in the UI, but the `set_active_organization` RPC fails silently or the profile update does not persist
- The organization list loads from `get_user_organizations` (which uses `user_roles`) but the profile is stale

## Solution

### 1. Sync profile before mutations (defensive fix)

Update `useCreateVendor` to call `set_active_organization` before inserting, ensuring the profile is always in sync with the frontend context.

### 2. Improve `setActiveOrganization` reliability

In `OrganizationContext.tsx`, after calling the RPC, also update the local profile cache to confirm the switch took effect. If the RPC fails, show a toast error so the user knows.

### 3. Add error logging for debugging

Log the actual Supabase error message in the vendor creation catch block so future issues are easier to diagnose.

---

## Technical Details

**File: `src/hooks/useVendors.ts`** -- In `useCreateVendor`, before the insert, call:
```typescript
await supabase.rpc('set_active_organization', { _org_id: organization.id });
```

**File: `src/pages/Fornecedores.tsx`** -- In the `handleSubmit` catch block, log `error` to console for debugging.

**File: `src/contexts/OrganizationContext.tsx`** -- In `setActiveOrganization`, after the RPC, verify the profile was updated. If not, retry or report the error.

This ensures the profile is always synced before any data operation, preventing the RLS violation.
