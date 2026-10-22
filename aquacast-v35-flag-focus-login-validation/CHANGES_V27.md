# AQUACAST v2.7 — Flag evidence and follow-up queue

- The investigation evidence table includes up to six earlier monthly readings **plus the flagged month**, visibly shaded red and labeled FLAGGED. The flagged reading is included in the stored request snapshot.
- Admin Anomaly Monitoring now has **Active flags** (not yet contacted), **For review** (contacted, still Open), and **Archived flags** (Reviewed/Dismissed).
- Contact station becomes **Request follow-up** after a request has been sent. The follow-up composer starts with an editable follow-up template, and includes the flagged-month evidence table.
- Sending a request or follow-up does not change the flag status. Only an admin changing it to Reviewed or Dismissed moves it into the archive. Reopening a flag with a prior request returns it to For review.
- Station users continue to see only requests addressed to their own station, in Active or Archived. Their interface does not show the admin-only For review tab.
- Requests sent in v2.6 retain their original evidence snapshot. **New** requests/follow-ups include the flagged month. To see the updated evidence on a station account, send a new request or follow-up.
- All messaging remains browser-local and fictional. No actual email delivery, secure audit logging, or cross-device synchronization.

## Testing
1. Serve the folder on localhost and log in as admin.
2. Open an uncontacted flag in Active, choose Contact station, and verify the last evidence row is red and labeled FLAGGED.
3. Send the request. Confirm the flag moves to For review and the action reads Request follow-up.
4. Send a follow-up and confirm it remains in For review until manually marked Reviewed or Dismissed.
5. Log in as the station in the same browser to verify the latest request and red flagged evidence row.
6. Resolve the flag as admin and verify it moves to Archived for both roles.
