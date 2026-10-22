# AQUACAST v0.7 — Station-specific reports

## What's new
- Includes 62 station accounts based on publicly listed city/municipal police station names across Negros Occidental (31), Negros Oriental (25), and Siquijor (6).
- Every station has its own username and isolated fictional monthly dataset (12 months in 2026).
- When a station user logs in, the station selector is locked to their assigned station; Dashboard, Records, Forecasting, Anomalies, and especially Reports use only that station's data.
- Admin/Evaluator can view all stations and configure BACIWA reference tariff settings per station.
- The supplied BACIWA tiered tariff schedule remains in the report estimate logic.

## Run
Extract the ZIP and open `aquacast-v06/index.html` in a modern browser. The app is local/offline and uses no external libraries.

## Demo accounts
- Admin: `admin` / `admin123`
- Evaluator (currently mapped to Admin permissions): `evaluator` / `aquacast123`
- Each station user: username shown below / `station123`
- Legacy generic `user` / `user123` remains as a convenience account and maps to Bago City.

## Station account list
All station-user passwords are `station123` for this academic demo. Usernames are lower-case station names with spaces/punctuation removed.

### Negros Occidental (31)
| Station | Username |
|---|---|
| Bago City | `bagocity` |
| Binalbagan | `binalbagan` |
| Cadiz City | `cadizcity` |
| Calatrava | `calatrava` |
| Candoni | `candoni` |
| Cauayan | `cauayan` |
| Don Salvador Benedicto | `donsalvadorbenedicto` |
| Enrique B. Magalona | `enriquebmagalona` |
| Escalante City | `escalantecity` |
| Himamaylan City | `himamaylancity` |
| Hinigaran | `hinigaran` |
| Hinoba-an | `hinobaan` |
| Ilog | `ilog` |
| Isabela | `isabela` |
| Kabankalan City | `kabankalancity` |
| La Carlota City | `lacarlotacity` |
| La Castellana | `lacastellana` |
| Manapla | `manapla` |
| Moises Padilla | `moisespadilla` |
| Murcia | `murcia` |
| Pontevedra | `pontevedra` |
| Pulupandan | `pulupandan` |
| Sagay City | `sagaycity` |
| San Carlos City | `sancarloscity` |
| San Enrique | `sanenrique` |
| Silay City | `silaycity` |
| Sipalay City | `sipalaycity` |
| Talisay City | `talisaycity` |
| Toboso | `toboso` |
| Valladolid | `valladolid` |
| Victorias City | `victoriascity` |

### Negros Oriental (25)
| Station | Username |
|---|---|
| Amlan | `amlan` |
| Ayungon | `ayungon` |
| Bacong | `bacong` |
| Bais City | `baiscity` |
| Basay | `basay` |
| Bayawan City | `bayawancity` |
| Bindoy | `bindoy` |
| Canlaon City | `canlaoncity` |
| Dauin | `dauin` |
| Dumaguete City | `dumaguetecity` |
| Guihulngan City | `guihulngancity` |
| Jimalalud | `jimalalud` |
| La Libertad | `lalibertad` |
| Mabinay | `mabinay` |
| Manjuyod | `manjuyod` |
| Pamplona | `pamplona` |
| San Jose | `sanjose` |
| Santa Catalina | `santacatalina` |
| Siaton | `siaton` |
| Sibulan | `sibulan` |
| Tanjay City | `tanjaycity` |
| Tayasan | `tayasan` |
| Valencia | `valencia` |
| Vallehermoso | `vallehermoso` |
| Zamboanguita | `zamboanguita` |

### Siquijor (6)
| Station | Username |
|---|---|
| Enrique Villanueva | `enriquevillanueva` |
| Larena | `larena` |
| Lazi | `lazi` |
| Maria | `maria` |
| San Juan | `sanjuan` |
| Siquijor | `siquijor` |

## Data and security caveats
- Station names are grounded in public PNP station directories / official provincial police office listings. See the source links below.
- All monthly consumption figures, anomaly flags, and forecasts are **fictional synthetic data** created only to demonstrate station-level separation. They are not actual NOPPO/PNP water records and must not be presented as real.
- The station names are a prototype list, not a certified current roster. Validate names and organizational coverage with the relevant provincial offices before production use. Bacolod City Police Office is separate from Negros Occidental PPO and is not included in this 62-station dataset.
- BACIWA rates were transcribed from the image supplied by the user. The app does not assume BACIWA serves every station in these three provinces; verify the actual provider, account classification, meter size, effective date, and other bill components per station.
- This is an offline static prototype. Login credentials are embedded in client-side JavaScript, so they are not secure authentication. Role restrictions are not production-grade access control. Data and tariff edits are not persisted after refresh.

## Public sources used for station names
- PNP PRO 6 station directory (Negros Occidental PPO): https://itms.pnp.gov.ph/wp-content/uploads/2025/04/PRO-6.pdf
- PNP PRO 7 station directory (Negros Oriental PPO and Siquijor PPO): https://itms.pnp.gov.ph/wp-content/uploads/2025/04/PRO-7.pdf
- Negros Occidental Police Provincial Office official About Us page: https://nocppo.pro6.pnp.gov.ph/about-us/
- Siquijor Police Provincial Office website: https://mystiquesppo.site/

## v0.8 — Larger, denser interface
This revision enlarges headings, navigation, tables, controls, cards, and login text; widens content to use available desktop space; and reduces excessive outer whitespace and gaps. It retains v0.7 station accounts, station-specific reports, BACIWA example tariffs, and offline operation. Browser zoom may be used for additional scaling.

## v0.9 Admin station selector fix

In the Admin/Evaluator view, the top station selector now filters the Admin settings tariff cards to the selected station. Selecting All stations shows all cards. The station selection continues to filter the other views; station-user accounts remain restricted to their assigned station. This is a client-side offline prototype, not secure server-side access control.

## v1.0: Custom AQUACAST logo
The provided logo is stored at `assets/aquacast-logo.png` (transparent PNG, cropped from the supplied JPEG).
It is used on the login screen, sidebar, report header, and browser tab (favicon).
To replace it, overwrite that file with a transparent PNG of the same name, or change the four `assets/aquacast-logo.png` paths in `index.html`. Logo dimensions are controlled by `.brand-logo`, `.login-brand .brand-logo`, and `.report-logo` in `css/styles.css`.

## v1.1 login cleanup
Removed the visible Demo accounts list and Fill details button, plus its event listener. Demo authentication remains client-side and is not secure production authentication.

## v1.2 Adaptive charts
Use the Charts selector (Auto / Online / Offline) in the top bar. Auto attempts to load Chart.js 4.4.8 from jsDelivr with a 3.5-second timeout; if unavailable, it renders with local native Canvas. Online also falls back to Canvas if CDN access fails. Offline never requests the CDN. Charts redraw after navigating to their previously hidden sections. The dataset, accounts, tariff model, and other features are unchanged. Chart.js is only fetched on demand and is not bundled.

## v1.3 — Consistent online and offline chart scales
Both chart engines now share a zero-based y-axis with the same calculated maximum and four equal intervals (five labeled ticks). Both use straight segments, matching line colors, dashed forecast styling, and white-centered markers. Values, labels, and station filtering are unchanged. Chart.js still provides interactive tooltips; native Canvas works without network access. In Auto mode the application falls back to Canvas if the CDN fails.

Validation: JavaScript syntax and archive integrity checked; full visual comparison in a browser is still recommended.

## v1.4 — Research readiness (local-only)
- New **Model evaluation** navigation section with CSV upload, strict validation, fictional sample loader, station-by-station rolling-origin backtests, MAE/RMSE/MASE, model comparison and CSV export.
- Three fixed candidate methods: naïve, trailing three-month average, SES alpha 0.30. At least 7 consecutive months required; first six train, remaining months tested.
- The import is an **isolated research sandbox**; it does not overwrite the original dashboard, reports or fictional data. No persistence and no upload to a server.
- The selected winner is the best *on the same evaluation data* and must not be presented as independently verified accuracy.
- See `DATA_REQUEST_SPEC.md` for beneficiary questions, fields, governance and dataset access requirements.

## v1.5 — Accuracy-oriented candidate selection
- Added naïve with drift and least-squares linear trend models to the model-evaluation sandbox.
- Uses the same rolling-origin one-month-ahead test months for all five candidates.
- Conservative model selection: a challenger must lower MAE by at least 5% relative to naïve; otherwise naïve is retained. The 5% rule is a configurable research heuristic, not an accuracy guarantee.
- Displays/export backtest MAE improvement relative to naïve.
- **Scope:** This affects the isolated Model evaluation sandbox only; the dashboard/forecast charts still use the previous demonstration forecasting method. Real-world accuracy remains unvalidated.

## v1.6 — Forecasting workspace: model selection and metrics
- The Forecasting page now has a **separate working research panel** below the legacy illustrative forecast chart. It uses the same algorithms and rolling-origin evaluation engine as the Model evaluation page.
- Select a fictional sample or the CSV imported in Model evaluation, choose a station and inspect the selected or any candidate model. View one-month-ahead estimate, MAE/RMSE/MASE, comparison table, and backtest actual-versus-predicted plot.
- Station accounts remain limited to their own station in the research panel. Imported records are kept in memory only; no server storage.
- The original 3/6-period future forecast chart remains explicitly **illustrative**, not derived from the research engine. No independently validated accuracy is claimed.

## v1.7 — Station-user research access cleanup
- The **Model evaluation** navigation item and its page are admin-only. Direct page navigation is rejected for station users.
- The detailed **One-month-ahead forecasting research** panel (cross-station model selection, MAE/RMSE/MASE, imports) is admin-only; station users retain the regular illustrative Forecasting chart.
- Evaluator demo login still maps to admin permissions, consistent with previous versions.
- These are **client-side demonstration visibility restrictions**, not secure access controls. Real station confidentiality requires server-side authorization and data isolation.

## v1.8 station-user forecasting guide
- Station accounts now see a plain-language forecast explanation in Forecasting: usage direction, next-month estimate, typical historical difference, and why the method was selected.
- The station guide uses only the logged-in station's fictional records; it contains no other station selector, comparison table, CSV import, or technical evaluation acronyms.
- Admin/Evaluator accounts retain the full model-selection and metrics workspace and the separate Model Evaluation page.
- Station-user explanations remain sample demonstrations, not validated real-world forecasts.

## v1.9 — Calendar reporting filters
Reports now support yearly and monthly views using a year picker and the browser's native month calendar. Filters apply to the report totals, estimated costs, flagged count, print view, and monthly breakdown. Available dates are bounded by the fictional dataset (currently 2026). The station scope remains unchanged. An empty state appears for periods without records. The calendar appearance depends on the browser.
