# AQUACAST PWA setup and testing

## Important
PWA installation and service workers **do not run from `file://`**. Serve this directory from `http://localhost` for development or an **HTTPS** origin for phones. Do not publicly host real NOPPO records or credentials.

## Desktop local test
1. Open a terminal in the `aquacast-v22-pwa` directory.
2. Run `python -m http.server 8000`.
3. Visit `http://localhost:8000/` in Chrome or Edge.
4. Load the app once while online. Check DevTools > Application > Service Workers and Cache Storage.
5. In DevTools Network, enable Offline, reload, and verify local charts, demo records, and reports.
6. Re-enable online mode; Chart.js from the CDN may load when reachable.
7. Look for browser's Install option or the optional Install AQUACAST button when supported.

## Phone install
- Host the same directory on an **HTTPS** website, open it in Chrome on Android, and use **Install app / Add to Home screen** when offered.
- On iPhone Safari, use **Share > Add to Home Screen** (behavior varies by iOS version).
- `localhost` on your computer is not the phone's localhost. A local LAN IP over HTTP is not generally a secure context for service workers.
- The app shell must load successfully online once before offline access is available.

## Offline behavior and limitations
- Cached: the static application shell, local scripts, stylesheet, logo and icons.
- Not cached: Chart.js CDN, imported CSVs, external resources, user-specific private data.
- Offline charts use local Canvas fallback.
- A service worker caches *the static demo app shell*; it does not provide secure login, server-side access controls, data synchronization or protected offline storage.
- CSV imports are browser-session research data; do not use confidential data without institutional approval.
- Updates are versioned by the `CACHE` constant in `sw.js`; redeploy then reload online to receive updates. Clear site storage if troubleshooting an old cache.
