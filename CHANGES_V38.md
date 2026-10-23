# AQUACAST v3.8 — Drag-and-drop import + accuracy dashboard

- Added accessible drag-and-drop CSV zone to administrator Consumption Records; click/keyboard Browse remains available, including on phones. Files stay local to browser.
- Retained v3.7 validation, change preview, confirmation, CSV export and localStorage persistence.
- Added a Forecast Accuracy Dashboard in administrator Model evaluation with station/model/source selectors, rolling-origin actual-versus-predicted SVG plot, MAE, RMSE, naïve baseline MAE, and test-month error table.
- Dashboard reads currently imported Consumption Records and updates after an import/reset, or a separately loaded research dataset. Existing forecasting preview remains illustrative.
- Minimum 7 consecutive monthly observations, six-month initial training; no ARIMA implemented. Exploratory backtests are not independent final validation.
- No real NOPPO data, secure backend, or multi-device synchronization. GitHub Pages is public and must only contain fictional data.
- PWA cache bumped to v38.
