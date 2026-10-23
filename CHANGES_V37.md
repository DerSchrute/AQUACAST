# AQUACAST v3.7 — Data Integrity (Static Demonstration)

## Added
- Administrator-only CSV import in Consumption Records, with validation, change preview, and explicit confirmation.
- CSV UTF-8 export of current consumption records and reset of locally imported readings.
- Imported station-month readings merge into existing fictional data (matching station-month entries are updated; new months are added).
- Consumption Records, dashboard totals/charts, report totals and anomaly evidence read the updated in-browser dataset. Existing flags remain flags; their displayed readings follow corrected values.
- Browser-local persistence and same-origin tab synchronization; no backend or shared multi-device database.
- Fictional Excel workbook with 62 demonstration stations × 12 months and matching import-ready CSV.

## Import instructions
1. Sign in as the demo Administrator.
2. Open Consumption Records → Import monthly consumption records.
3. Choose `AQUACAST_v37_mock_consumption_import.csv` (included under `sample-data/`).
4. Review validation and preview, then click **Confirm import**.
5. Observe the updated Consumption Records, Dashboard, and Reports. Try Export current records CSV.
6. To edit in Excel, open `AQUACAST_v37_mock_dataset.xlsx`, modify the `Import_Data` sheet, and save that sheet as **CSV UTF-8** before importing.

## Limitations
- CSV is supported; `.xlsx` is not parsed by the static website. Excel is a dataset preparation tool.
- Invalid headers, station IDs, period strings, negative/non-numeric readings, and duplicate station-months within the upload block the entire import.
- Existing station-months in the app are **updates**, not errors. Preview identifies New / Update / Unchanged.
- No automated anomaly inference, no ARIMA model, and no shared server-side records. Forecasting output remains illustrative.
- Do not upload actual NOPPO or NDA-protected data to the publicly hosted static prototype. All supplied mock records are fictional.
- Reset imported data leaves manual flags and correspondence intact; those are separately stored demo artifacts.
