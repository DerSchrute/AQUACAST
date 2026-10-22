# AQUACAST v2.5 — Anomaly archive

- Active flags list now displays only `Open` flags.
- Changing status to `Reviewed` or `Dismissed` immediately moves the flag into the **Archived flags** tab.
- Archive retains status, station name, reporting period, reason, sample consumption, and flag ID.
- **Reopen flag** restores an archived flag to the active list.
- Tab counters and sidebar open count update with status changes.
- Station users see only their own station's flags; admin filters remain available.
- Demo statuses persist across refresh and sign-out in the same browser via localStorage.
- Resolved anomaly flags no longer appear in the station's notification bell. Reopened flags can appear again.
- Existing fictional flags remain illustrative, not validated anomaly detection.

## Quick test
1. Run `python -m http.server 8000` from this directory and open `http://localhost:8000`.
2. Sign in as admin, open Anomaly monitoring, set a flag to Reviewed.
3. Verify it disappears from Active flags and appears in Archived flags.
4. Set another flag to Dismissed, then switch between tabs and confirm counts.
5. Refresh and confirm statuses persist. Reopen one archived flag.
6. Sign in as its station account and confirm only that station's flags are visible.

## Important
The archive is a **local prototype state**, not a secure audit log. Clearing browser storage loses status changes. A production government system would need server-side persistence, user identity, timestamps, and an immutable audit trail.
