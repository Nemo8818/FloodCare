# FloodCare Online

Hosted edition of the student's FloodCare prototype. Citizen portal `/`, separate staff portal `/staff.html`. Thai/English UI, local draft saving, photo attachments, staff SOS polling alerts, and request-status tracking. Does not connect to actual emergency services or compensation programs.

The original Python classroom version is in the user's GitHub repository. This hosted edition preserves its interface and API contract, adapting server operations to a Worker with D1 records and R2 photos. It is a distinct deployment and does not modify that external GitHub repository.

## Source
- `lib/assets.ts`: embedded citizen/staff HTML, CSS and JavaScript, including offline interface cache.
- `lib/api-core.ts`: hosted API and validation, with protected image fetches.
- `lib/api.ts`, `app/api/[...path]/route.ts`: runtime bindings and routing.
- `db/schema.ts`, `drizzle/`: immutable schema migrations.
- `worker/index.ts`: framework Worker entry.
- `.openai/hosting.json`: Site identity and logical DB/BUCKET bindings.

Staff password is supplied as the secret runtime variable STAFF_PASSWORD. No password is embedded in frontend assets. Staff sessions are stored as hashes and expire after eight hours. Citizen records are scoped to a browser-held random owner token. Photos require the owner token or a staff session, and are not public static files. Use fictional data; this educational prototype is not a production dispatch system.

## Validation
`node --experimental-strip-types tests/api.mts` tests staff sign-in, ownership isolation, photo authorization, request submission, status updates, retry deduplication, validation and sign-out against an in-memory SQL database and object store.
Build through the Sites build workflow. Browser QA verified citizen submission/server acknowledgement and both interface languages. Physical-device audio/notifications and closed-tab background push are not guaranteed. Staff alerts require an open connected page and poll every three seconds.

## Limits
No payment, eligibility decisions or government integration. Browser storage is not cross-device identity recovery. API list endpoints return the most recent 200 authorized requests. Do not upload sensitive identity documents. Service-worker offline opening requires an initial successful visit and supported browser. An offline request does not leave the device until retried online. Site-level access remains owner-private unless the owner changes the access policy.

## Staff job groups
Open jobs and Closed jobs are separate tabs with independent counts. Closing a request moves it out of the open list without deleting its data or photos. Staff can reopen it by selecting another status. Filters/search apply within the selected group. Closed SOS requests do not generate new-SOS alerts when discovered. Regression tests cover closing, reopening, retained history and frontend filtering.
