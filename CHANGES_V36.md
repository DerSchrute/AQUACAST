# AQUACAST v3.6 — Transparency & Traceability

- Adds expandable **Why was this flagged?** explanation on anomaly cards for administrators and contacted stations, including manual versus demo source, recorded reason, and descriptive previous-six-month median comparison. **Not a validated anomaly threshold.**
- Adds expandable **Case history** for both roles, listing administrator flag creation, case status transitions, historical investigation requests, and correspondence sends with available timestamps.
- Preserves previous localStorage keys and uses `aquacast-v36-audit-events` for new status/creation actions. Existing historical status changes cannot be reconstructed retroactively.
- Adds same-browser cross-tab refresh for audit events and bumps PWA cache to v36.
- This is a browser-local demo history, not a secure, immutable institutional audit log.

Test: Admin manual-flag creation -> explanation and history; send request -> timeline; station account -> same case; archive -> status event and read-only correspondence; refresh -> history persists.
