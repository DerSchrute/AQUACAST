# AQUACAST v3.1 — Instant same-browser tab synchronization

- Anomaly status changes (Open / Reviewed / Dismissed) now update other open AQUACAST tabs on the same browser origin automatically.
- Active, For review, Archived counts and station notification badges refresh without manual reload.
- Existing flag correspondence and investigation request changes also refresh the relevant lists and open conversation history across tabs.
- Uses `localStorage` `storage` events plus `BroadcastChannel` where supported. A `storage` event fallback remains available if BroadcastChannel is unsupported.
- Only a small key-change notification is broadcast; the current tab reloads the authoritative localStorage value. The sender already updates its own UI.
- Existing v3.0 features and browser-local persistence remain intact.
- The PWA service worker cache name was updated to `aquacast-shell-v31` to replace cached code.

## Test procedure
1. Start `python -m http.server 8000` from this folder and visit `http://localhost:8000`.
2. Open two tabs in the **same browser profile and origin**. Sign into admin in tab A and a relevant station in tab B.
3. As admin, send an information request for a flagged station if one is not already available. The station tab should show it automatically.
4. Set the flag to Reviewed or Dismissed in tab A. Tab B should move it to Archived automatically, without refresh.
5. Reopen the flag in tab A. Tab B should return it to Active. Test the inverse tab state as needed.
6. Refresh both tabs and confirm the statuses remain consistent.

## Limitations
- Does **not** synchronize separate devices, different browser profiles, or different origins (localhost and file:// are not interchangeable).
- No secure identity/authorization or central server exists yet. Do not use real NOPPO confidential data in this demo.
- Simultaneous edits to the entire localStorage status object from two administrators can overwrite each other; a production backend must provide concurrency controls and an audit trail.
