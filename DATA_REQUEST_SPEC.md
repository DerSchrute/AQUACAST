# AQUACAST — beneficiary data request and validation specification

## Purpose and minimum dataset
For forecasting research, request monthly **metered water consumption** for each participating station, with `station`, `period` (YYYY-MM), and `consumption` (m³). Ask whether the source measures actual consumption, meter readings, billed volume, or estimated usage. Prefer 24–36+ consecutive months per station when available; twelve months can only support a small exploratory backtest.

## Additional useful metadata (optional)
- Station code, station name, province, meter ID and meter changes
- Billing start/end dates and actual reading dates
- Missing/estimated readings, corrections, zero-usage explanations
- Unit definitions, reporting cadence, source-system description
- Operational changes affecting demand, if permitted

## Data minimization and handling
Request only fields needed for approved research. Avoid personnel details, credentials, operationally sensitive identifiers, or unnecessary addresses. Obtain written institutional authorization, access scope, retention and deletion terms. Transfer via an institution-approved secure channel. Restrict access, encrypt storage, log access, and do not embed real data in publicly distributed static HTML/JS. This browser-only prototype is **not** an approved confidential-data environment.

## Beneficiary validation questions
1. Is water consumption captured per station, per meter, or at another level?
2. What units and frequency are available, and how far back?
3. Do gaps, estimated readings, billing-cycle shifts, or meter replacements occur?
4. Which stations and fields are in scope, and who approves access?
5. What forecasting horizon and acceptable errors would be useful?
6. May data be anonymized or aggregated for the initial research?
7. What are the permitted processing, retention, sharing, and deletion rules?

## Evaluation protocol (preliminary)
- Inspect units, date coverage, missingness, duplicates and station mapping.
- Define forecast horizon **before** model comparison.
- Use time-ordered rolling-origin validation; never shuffle time series.
- Compare naïve, moving average and SES with the same train/test origins.
- Report MAE, RMSE, MASE, test sample count, station-level performance and failures.
- Separate model tuning/selection from an untouched chronological holdout when sufficient history exists.
- If data are too sparse, report that reliable accuracy evaluation is not feasible; do not fabricate performance.
