# AQUACAST v3.0 — Flag notification deep-link

When an administrator clicks a flagged-reading follow-up notification, AQUACAST now:
1. Navigates to **Anomaly Monitoring**.
2. Selects the affected station and resets the province filter.
3. Opens **For review** (or **Archived** for a closed flag).
4. Highlights the matching anomaly card.
5. Opens the existing flag correspondence popup automatically, showing the message history and reply form.

Station-side replies also open the relevant case before showing correspondence.

Existing messages, review controls, and archive behavior are unchanged. This remains a same-browser offline prototype.

## Test
- Send a station follow-up on an open flagged reading.
- Sign in as administrator in the same browser, click its notification.
- Confirm Anomaly Monitoring opens on the correct station and For review tab, with correspondence popup visible.
- Close popup and verify the correct case is highlighted.
- Repeat with a closed case: Archived should be selected.
