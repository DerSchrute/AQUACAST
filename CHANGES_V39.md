# AQUACAST v3.9 — Controlled imports and recoverable datasets

- Confirmation dialog after CSV validation, before committing Consumption Records changes.
- Browser-local snapshots of complete preceding consumption datasets before each import, reset or restore (last 10 versions retained).
- Searchable activity log, searchable historical dataset overview, CSV export, and restore action.
- Model evaluation CSV upload now uses the same drag-and-drop zone pattern as Consumption Records.
- Existing records key preserved. Snapshots are local to the browser profile and may be lost if site storage is cleared. Storage quota can block imports.
- Restore changes readings only; anomaly cases, flags and correspondence are not rolled back.
- Static demo, not an immutable audit log, shared database or production backup.
