# AQUACAST v2.3 — Offline notification demo and usability changes

## Included
- Admin notification creator: basic rich text formatting, priority, all/province/multi-station recipient selection, local publish history.
- Station bell notifications: recipient-filtered announcements and sample anomaly alerts; read/unread tracking; anomaly alerts navigate to anomaly monitoring.
- Browser-local persistence via localStorage; switch between demo admin and station accounts **on the same browser profile and origin** to test.
- Clearer section icons; station-only anomaly view (no province tabs); station names on evaluation result cards.
- Tariff editing: classification, meter size, effective date, usage-based preview, reset, browser-local persistence and report recalculation.
- Existing desktop/mobile/PWA preserved; service worker cache version incremented.

## Limits and research decisions
- **No cross-device delivery** or push notifications. Browser-local messages do not synchronize.
- Rich text editor is a limited toolbar, not Google Docs or Microsoft Word; no files, collaboration, templates, or revision history.
- Admin/station access controls are browser UI only. Do not enter sensitive government data or publish operational instructions here.
- Existing anomaly flags remain fictional, not a validated detection rule. Future design: per-station rolling baseline, robust dispersion (median absolute deviation), minimum change guardrail, and human review of flags. Calibrate thresholds against real authorized records.
- ARIMA **not implemented**. Revisit after confirming monthly history length, missingness and seasonal patterns; compare with naïve baselines on identical rolling-origin splits. Twelve months per station is inadequate for confident seasonal ARIMA evaluation.
- Tariff effective dates are applied by record month. A new selection with an effective date after all 2026 sample records will **not** retroactively change 2026 reports. To demonstrate changes, use `2026-01-01` or an earlier relevant 2026 date.
- Tariff values remain BACIWA reference rates, not verified station-specific providers. Local persistence is for demo convenience only.

## Testing
1. Serve with `python -m http.server 8000` in this folder; open `http://localhost:8000`.
2. Sign in as `admin` / `admin123`; open Notification creator and publish to Bago City.
3. Sign out and sign in as `bagocity` / `station123` in the **same browser**. Check bell and anomaly links.
4. Sign in as another station and confirm it does not receive the targeted announcement.
5. As admin, filter a station in the topbar, open Admin settings, change classification/meter size with effective date `2026-01-01`, save and verify reports change. Refresh to verify settings persist.
6. Use Chrome DevTools mobile emulation, and offline mode after service worker caches files. The service worker requires localhost/HTTPS; `file://` does not enable it.
