# AQUACAST v2.8 — Flag correspondence

- Station users can select **Send follow-up** on an open investigation request.
- Follow-up is linked to the specific anomaly flag, separate from general station correspondence.
- Admin notification bell labels incoming station replies **Follow up from [station] flagged reading**.
- Opening that alert shows the full case conversation with **Send reply** and **Go to flag** actions.
- Admin can also use **View / reply** directly on contacted flags in the For review tab.
- The conversation includes original information requests and attached consumption evidence, including highlighted flagged month.
- Station receives a bell notification when admin replies.
- Reviewed or Dismissed flags retain correspondence in the archive; closed cases cannot receive new follow-ups unless reopened.
- All messages are localStorage-based and require the same browser and origin. Not secure email, not cross-device, not an audit log.

## Test
1. Sign in as admin, send an information request from an open anomaly.
2. Sign in as that station, open Anomaly Monitoring, select Send follow-up, submit.
3. Sign in as admin. Check the bell label and open the message; send a reply or choose Go to flag.
4. Sign in as the station and check the admin reply notification.
5. As admin, mark the case Reviewed, verify it is archived and correspondence remains accessible.
