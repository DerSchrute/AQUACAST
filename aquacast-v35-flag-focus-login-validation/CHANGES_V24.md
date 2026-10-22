# AQUACAST v2.4 — Station correspondence

- Admin no longer receives bell notifications for its own published announcements. Those remain in the Notification Creator publication history.
- Station users have a Contact administration page with subject, category, formatted body, send action and Sent messages history.
- Administrator bell displays incoming station messages, with station identity, subject, category and formatted message.
- Station bell continues to display admin announcements and sample anomaly alerts; anomaly alerts still open Anomaly Monitoring.
- All communication uses browser-local storage. It is NOT email, real-time delivery, server authentication or cross-device messaging. Do not use sensitive government data.

## Test
1. Serve over localhost or HTTPS. Log in as admin and publish an announcement; verify no self-notification in the bell.
2. Log out and log in as a targeted station. Verify the announcement appears. Open Contact administration, compose and send a message. Verify it appears under Sent messages, not the station bell.
3. Log out and log in as admin in the same browser and origin. Verify the bell shows the station message and clicking it shows its content and station identity.
4. Test a second station account to verify sent messages are scoped to the sender in the UI.

Rich-text formatting is intentionally limited, not full Google Docs/Word functionality.
