# Tasks

## Job Detail Page

- [x] **URL State Management**: Update path to include application ID and current view
  - Path: `/jobs/[jobId]/applications/[applicationId]/evaluation|resume?tier=...&status=...&sort=...&page=...`
  - Persist filters, sorting, pagination in URL params
  - Restore state on page refresh

- [x] **Remove "View Framework" button**: Removed Calibrate/View Framework button from job detail header

- [x] **Implement Refresh button**: Now triggers candidate list refetch

- [x] **Remove Email feature**: Removed Email sidebar item, email templates page, and all email-related components

## Organization Settings

- [x] **Add org settings page**: Allow updating logo, tagline, description, etc.
  - Path: `/settings`
  - Editable: name, slug, logo URL, website URL, tagline, about
  - Read-only display: plan, invite code (with copy button), created date, user role
  - Mobile-responsive layout with sidebar info cards
