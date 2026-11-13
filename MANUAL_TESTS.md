# Manual checks — Citizen & Staff Edition
These are checks for the demonstration devices. Actual physical-device sound, desktop notifications and LAN access have not been verified by the code author.

1. Start `py run.py`. Open citizen `/` and staff `/staff.html` in two tabs. Confirm both have Thai/English switches and staff controls are absent from the citizen form.
2. Before login, staff must not show request data. Use a wrong password, then the terminal's correct password. Try the role checks in test_server.py as well.
3. Enable alerts in the staff page. Keep it open. In citizen, create a fictional SOS and attach a JPEG or PNG under 1 MiB. Verify preview then server-received status.
4. Within the next successful staff poll, verify new-SOS banner and the photo. Check optional sound/desktop pop-up where browser permissions allow. Dismiss the banner; verify this did not change request status.
5. Staff acknowledges. Verify the citizen status refreshes after a successful poll. Check status history on staff. Add a damage request and verify no SOS alert for that record.
6. Select 3 images, an SVG/HEIC, or an image over 1 MiB. Submission must reject them. Empty required fields and zero people must also fail.
7. Stop server with Ctrl+C while leaving the citizen page open. Submit a new request. Verify it remains local and is never marked server-received. Restart, use Retry, and verify it appears once in staff. A changed staff password requires a new login after server restart.
8. Simulate losing the response after a POST and retry the same ID: it must never duplicate the record or reset an acknowledged status. Automated integration tests also cover this.
9. Export JSON privately. Local deletion must warn that the server copy remains; it may reload. Do not upload exports or data/ to GitHub.
10. Run `py run.py --lan`, open staff on a second device using the server's real IPv4, and repeat SOS delivery. Do not use localhost on the second device, because that means the second device itself.
11. Disconnect staff from the server. After the next failed poll it should show disconnected. Reconnect and verify unseen requests are alerted. Close staff entirely and show that no background alert is promised.
12. Switch languages with form text and photos selected. They should remain selected. Check displayed statuses, attachment labels and alert messages in English. User text remains in its original language.
13. Test location permission and SMS draft on a compatible device. Cancel the SMS; do not send a real emergency as a test. HTTP LAN restrictions may disable location/notifications/cache; explain this openly.
14. On localhost, load citizen once, allow service-worker activation, reload, then stop server and reopen cached citizen page. If cache is unavailable, do not claim offline reopening worked.
15. Check narrow layout, keyboard focus, image previews, staff sign-out, and re-login. After sign-out no private staff data should remain visible.
