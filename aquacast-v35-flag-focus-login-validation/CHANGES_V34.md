# AQUACAST v3.4 — Manual flag modal location and archived correspondence

- Moved the manual-flag reason modal into the Consumption records page markup. It now opens while the administrator remains in Consumption records. After saving, the page stays in Consumption records and shows an inline confirmation.
- Added **View correspondence** to archived anomaly cards for both administrator and station accounts.
- Archived threads open in read-only mode: existing investigation requests and replies are visible, while the compose form is hidden. Cases without correspondence show a clear empty-history message.
- Existing station authorization checks remain in place; no station receives access to another station's correspondence.
- Bumped service worker cache to v34. This remains a browser-local prototype, not a cross-device backend.
