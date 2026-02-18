
# Fix: Qualification Flow Navigation

## Problem

The qualification module has all the pages implemented but they are **not connected**:

1. The sidebar "Qualificação" link goes directly to the Campaigns page -- there is no way to access the **Templates** page from the UI
2. The Campaigns page has no **"New Campaign"** button -- the `StartQualificationCampaignDialog` component exists but is never rendered on this page
3. The full workflow (Create Template -> Publish -> Start Campaign -> Review) is broken because users can't navigate between steps

## Solution

### 1. Add sub-navigation tabs on the Campaigns page

Add a **tab bar** at the top of the Campaigns page with two tabs:
- **Campanhas** (current page content)
- **Templates** (links to `/vrm/qualificacao/templates`)

This lets users switch between campaigns and templates without needing extra sidebar items.

### 2. Add "New Campaign" button to the Campaigns page

Add a button in the header that opens the existing `StartQualificationCampaignDialog`. This is the missing piece that connects templates to campaigns.

### 3. Update the sidebar navigation

Change the "Qualificação" sidebar item to expand into two sub-items or keep as-is pointing to campaigns (since tabs handle navigation). The simplest approach: keep sidebar as-is, use tabs on the page.

---

## Technical Details

### File: `src/pages/QualificationCampaigns.tsx`

- Import `StartQualificationCampaignDialog` and `useNavigate`
- Add state `showNewCampaign` for dialog toggle
- Add a tab bar (using buttons or Tabs component) linking to Templates (`/vrm/qualificacao/templates`) and Campaigns (active)
- Add "Nova Campanha" button in the header next to "Comparar"

### File: `src/pages/QualificationTemplates.tsx`

- Add matching tab bar linking back to Campaigns (`/vrm/qualificacao/campanhas`) and Templates (active)
- Ensure consistent navigation between the two pages

### File: `src/components/layout/VendorSidebar.tsx`

- Update the `isActive` check for "Qualificação" to highlight on both `/vrm/qualificacao/templates` and `/vrm/qualificacao/campanhas`

No database or backend changes needed -- all components already exist, they just need to be wired together.
