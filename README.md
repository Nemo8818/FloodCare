# FloodCare — Citizen & Staff Edition
A small bilingual flood-support prototype with a Python server, SQLite persistence, photo attachments, and a separate authenticated staff dashboard.

## Problem and users
Flood-affected residents need a simple way to explain their situation, preserve damage information, and follow progress. Staff need to see requests together and recognize new SOS reports. FloodCare demonstrates that workflow for residents and staff using fictional information. It is not affiliated with a government agency, does not guarantee rescue, and does not determine or pay compensation.

## Windows easy start
Extract the ZIP, open FloodCare, then double-click `START_FLOODCARE.bat`. It sets the user-requested classroom password `FCSFight` for this process and opens http://127.0.0.1:8765/staff.html. Keep the terminal open. `START_FLOODCARE_LAN.bat` enables trusted-LAN access. The manual launch below still generates a password unless the environment variable is set. Port 8765 separates this edition from old instances on port 8000. Windows sockets are exclusive to prevent ambiguous duplicate servers.

Changing origin or port creates a separate browser-storage area. Old local drafts remain under the original URL. Keep the `data/` folder when updating if submitted server records should remain.

## Run on one computer
Python 3.10+ is required. No pip packages or paid services.

```sh
python run.py
```
Windows can use `py run.py`; macOS can use `python3 run.py`.

- Citizen page: **http://127.0.0.1:8765/** (`index.html`)
- Separate staff page: **http://127.0.0.1:8765/staff.html** (`staff.html`)
- A generated staff password is displayed in the server terminal. It changes when the server restarts. An optional `FLOODCARE_STAFF_PASSWORD` environment variable can supply your own password.
- Keep the terminal running. Ctrl+C stops the server.
- `python -m http.server` is NOT a substitute: it cannot run these API endpoints.

## Two devices on the same trusted Wi-Fi
Run the server on only one computer:

```sh
py run.py --lan
```
Find that computer's Wi-Fi IPv4 with `ipconfig` on Windows. On the second device open `http://<server-IPv4>:8765/staff.html`. For example, replace the placeholder with the actual IPv4 shown on your computer, not a guessed address. Allow the Python app through the Windows firewall for your private network if prompted. Both devices must reach the same server; guest Wi-Fi/client isolation can prevent this. Mobile data alone will not reach a private LAN address. See `UPDATE_TH.md` for Thai step-by-step guidance.

The local HTTP server is for a classroom demonstration on a trusted network. Do not port-forward it to the public internet or use it with sensitive real incident data. Remote use outside the LAN needs a properly deployed HTTPS backend and stronger operational controls.

## Working features
- Citizen and staff have separate HTML and JavaScript files.
- Thai/English switch remembered locally on both pages. User-entered text is preserved, not machine translated.
- Citizen SOS form with contact, household count, optional location and vulnerability flag.
- Citizen damage form and illustrative document-preparation checklist.
- Optional JPEG, PNG or WebP attachments: maximum **2 images per request, 1 MiB each**. Previews, local saved copy, server storage and staff viewing are implemented. HEIC and SVG are not accepted; convert phone images to JPEG if necessary. This is incident-photo support, not secure identity-document upload.
- Requests first save locally; the app then attempts transmission. If it fails, a Retry button remains. Reconnection refreshes existing server statuses but never silently submits unsent local drafts.
- Server receipt is clearly different from staff acknowledgement or rescue dispatch.
- Staff password sign-in; server-side authorization protects all-record access and status updates. Citizen requests are scoped to a random browser-held owner token. There are no named citizen accounts or cross-device account recovery.
- Staff dashboard searches, filters, displays photos, prioritizes SOS, and records status history. Citizen status refreshes every 4 seconds while the page can reach the server.
- Staff polls every 3 seconds while open and connected. New SOS requests create an in-page alert. Press “Enable sound and request notification permission” to allow optional audio and desktop notifications where supported. Browser throttling, permissions, muted audio and a sleeping device can delay or suppress alerts.
- A new SOS discovered on first sign-in is also alerted once per browser's seen-ID list. Dismissing an alert does not acknowledge a request. Staff must choose a status separately.
- Local JSON export and local-copy deletion. Deletion does NOT remove server records; those may reload while connected. Keep exports private.

## Important limits
**This is not background push.** Closing the staff page, signing out, losing server connectivity, or a sleeping device prevents polling. Desktop notifications and geolocation typically require a secure context; localhost may support them, while an HTTP LAN IP may not. The visible in-page alert is the primary demonstration path. No claim of guaranteed alert delivery is made.

No internet is different from no communication path. Devices on the same Wi-Fi can reach the local server without an internet uplink if local routing works. If no network path exists, requests remain local and must be retried later. SMS drafts still require cellular service and the user must press Send. No delivery confirmation is inferred. Bluetooth mesh and satellite communication are not implemented.

Offline reopening requires a previously cached citizen interface on a browser supporting service workers. localhost supports this in compatible browsers; a plain HTTP LAN IP generally does not. Staff data/API responses are never cached by the service worker. Browser-native validation and date pickers may follow browser language.

The backend checks required fields, type, image size and signatures; it does not perform full image decoding, malware analysis, or EXIF stripping. Do not upload private photos. It uses a single shared staff password and expiring in-memory staff sessions, not production identity management. Citizen ownership is a bearer token stored in the browser. Clearing local storage loses that token. Staff still retain the server copy. Production deployment would need real agency participation, HTTPS, individual staff accounts, auditing, anti-abuse measures, backups and retention procedures.

## Data and source files
- `index.html`, `app.js`: citizen portal.
- `staff.html`, `staff.js`: separate authenticated staff portal.
- `i18n.js`, `style.css`, `sw.js`: shared translations/styles and citizen interface cache.
- `run.py`: Python HTTP API, validation, authentication and SQLite access.
- `data/floodcare.sqlite3`: generated at runtime, contains requests and encoded photos. Never upload this folder to a public repository. Keep it when updating code if you want to retain submitted records.
- `test_server.py`, `test_app.cjs`, `test_staff.cjs`: automated checks.
- `UPDATE_TH.md`, `SUBMISSION_TH.md`, `MANUAL_TESTS.md`, `VIDEO_SCRIPTS_TH_EN.md`: guidance and recording preparation.

## Checks
```sh
python -m unittest -v test_server.py
node test_app.cjs
node test_staff.cjs
node --check app.js
node --check staff.js
node --check i18n.js
node --check sw.js
```
Node is only needed to run the optional JavaScript checks, not to run the application. Integration tests cover staff sign-in, owner isolation, photo round trip, status updates, idempotent retries, persisted records, unauthorized access, invalid photos, oversized images, origin checks and blocked private-file paths. JavaScript checks cover bilingual rendering, escaping, local storage failure and no false success on network failure. Actual device notifications, sound, location, offline cache and two physical devices still require the manual tests.

## Assignment and publishing
The assignment asks for a public GitHub repository with README, a demo video of up to 3 minutes, and a separate presentation video of up to 3 minutes. Upload source files, not runtime data. This version needs the Python backend: **GitHub Pages alone cannot provide photo submission, shared requests or staff alerts.** A repository link with local run instructions still meets the code-delivery format shown in the assignment. No public hosting or GitHub repository is created by this ZIP.
