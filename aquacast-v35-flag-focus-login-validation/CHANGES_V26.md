# AQUACAST v2.6 — Investigation workflow

- Admin open anomaly flags now have **Contact station**, which opens an editable information-request form prefilled with the station, flagged period, measured consumption, and a neutral clarification request.
- Evidence table automatically includes up to six previous months of that station's fictional consumption records. Evidence is saved as a snapshot with the request; it is not an external file upload.
- Requests are stored in browser localStorage and appear in the targeted station's Anomaly Monitoring page and notification bell when logging in on the same browser and origin.
- Station users no longer see automatic uncontacted flags; they see only requests sent by Administration. Station users cannot change statuses or reopen flags.
- Admin-only Reviewed/Dismissed moves the flag to Archived for both roles. Archived station requests remain viewable in the archive; Reopen restores an admin flag and any prior request to the active view.
- Multiple information requests for one flag are supported; the station page shows the latest request. Prior requests remain in local storage but are not shown in a history view.
- No real email is sent. No secure server-side authentication, synchronization, immutable audit history, or confidential attachments are implemented.

## Testing
1. Serve from localhost/HTTPS and open admin. In Anomaly Monitoring select an Open flag and click Contact station.
2. Edit the default message; verify previous consumption records in the evidence table; send.
3. Sign out and log in as the recipient station in the same browser. Check the notification bell and Anomaly Monitoring; unrelated stations should see no request.
4. Log back in as admin and set the flag to Reviewed. Confirm it moves to Archived in admin and station views, and no longer appears in the station notification bell.
5. Reopen the flag and confirm it returns to Active; refresh to verify status and requests persist.

All records are fictional demonstration data. The admin must verify any operational anomaly through authorized institutional channels.
