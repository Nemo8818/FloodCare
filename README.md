# FloodCare — Online Website Source

**The current website implementation is in [`web-online/`](web-online/).** This source matches the published FloodCare website, including separate citizen/staff portals and the Closed jobs tab.

If this package is added to an earlier FloodCare repository, standalone Python or HTML files outside `web-online/` belong to the earlier local prototype. Use `web-online/` as the source for the online demonstration. The Android/iPhone source is a separate project and is not the website implementation.

## Problem
During flooding, residents may struggle to communicate their location and needs, collect damage information, or find out what happens to their requests. Staff have limited time to organize incoming reports and field visits. Incomplete information and repeated office visits can make an already stressful situation harder.

## Intended users
Flood-affected households and staff demonstrating a possible assistance workflow. The current project is an educational prototype using fictional data, without an operational partnership with a rescue service or government agency.

## What it does
- Thai/English citizen and staff interfaces.
- SOS requests, optional device coordinates, contact information and household details.
- Up to two JPEG/PNG/WebP photos per request, up to 1 MiB each.
- Damage-information preparation with an illustrative document checklist.
- Local draft saving before submission, explicit retry and clear server-receipt status.
- A staff password sign-in protecting request review, photos and status changes.
- New SOS alerts while the staff page is open and connected; polling every three seconds.
- Separate **Open jobs / Closed jobs** tabs with counts. Closing retains records, photos and history; choosing another status reopens the job.
- Citizen status refresh, local JSON export and local-copy deletion.

## Live demonstration
- Citizen: https://floodcare-nemo8818.gallantbat2.chatgpt.site
- Staff: https://floodcare-nemo8818.gallantbat2.chatgpt.site/staff.html

The hosted demonstration requires site-level access permission. A public GitHub repository does not automatically grant access to the private live demo. The staff password is a separate application-level check after site access. No production secrets, request data, uploaded photos or staff sessions are included in this source package.

## Published version and verification
This export matches published website **version 2**, source commit:

`69b13a4108a744084f8729939f48478643dadb24`

All 129 original source files in `web-online/` were compared byte-for-byte against that commit. [`SOURCE_VERSION.json`](SOURCE_VERSION.json) lists SHA-256 checksums. The handover README and upload guide sit outside the original source directory, so the deployed source files remain unchanged. This record describes the source version, not a copy of the live database or runtime configuration.

## How to run locally
Install Node.js 22.13 or newer, then open a terminal in `web-online/`.

1. Install the locked dependencies:

```sh
npm ci
```

2. Create a local, untracked `.dev.vars` file containing a staff password of your choice:

```text
STAFF_PASSWORD=choose-a-local-password
```

Do not commit that file or actual passwords to GitHub. This local password is independent of the hosted demo's runtime secret.

3. Build the Worker and binding configuration:

```sh
npm run build
```

4. Apply the supplied schema migration to the local D1 database:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_opposite_santa_claus.sql
```

5. Start the built application:

```sh
npm start
```

Open the URL printed by Wrangler; append `/staff.html` for staff. Keep the terminal open. Use the local password from `.dev.vars`. Local databases and uploads are separate from hosted data. Both portals must use the same server origin. Python `run.py` is not used by this version.

These are the framework starter's local commands. The exported source was checked for exact correspondence and its API tests rerun; dependency installation and a fresh local Worker build were not repeated for this documentation-only export. The source had already passed the build used for publication.

## Technology and source map
| File/directory | Purpose |
| --- | --- |
| `web-online/lib/assets.ts` | Actual HTML, CSS and browser JavaScript embedded as text assets |
| `web-online/lib/api-core.ts` | API validation, staff authentication, ownership and status updates |
| `web-online/lib/api.ts` | Cloudflare runtime bindings |
| `web-online/app/` | Citizen/staff/asset routes and API entry point |
| `web-online/db/schema.ts` | Structured record/session schema |
| `web-online/drizzle/` | Database migrations |
| `web-online/worker/index.ts` | Production Worker entry |
| `web-online/tests/api.mts` | API integration tests |

The website uses TypeScript, Vinext, a Cloudflare Worker, D1 and R2. The frontend assets are served through routes from `lib/assets.ts`; an independent root `index.html` is not the current deployment entry point.

## Tests
With Node.js supporting TypeScript stripping and `node:sqlite` (Node.js 24 was used for the export check):

```sh
node --experimental-strip-types tests/api.mts
```

Run from `web-online/`. This tests staff sign-in, request ownership, protected photos, submission, status changes, retry deduplication, validation, sign-out, closing/reopening and retained history. The tests use a temporary in-memory database and object-store substitute, not the live database.

## Deployment
This source targets a Worker backend with logical bindings `DB` (D1) and `BUCKET` (R2). The original hosted project identity is retained in its hosting manifest. Runtime secrets and platform access policies are managed separately and are not bundled here. Re-deployment needs authorized platform access and provisioned storage; uploading to GitHub alone does not deploy it.

**GitHub Pages alone cannot run this backend.** It will not provide shared requests, protected photos or cross-device staff alerts. Keep the existing live demo for the recorded presentation, and use this repository as its matching source.

## Limits
This is not a guaranteed emergency channel. No communication path means a request cannot leave the device. The staff page must remain open and connected for polling; no closed-page/background push is implemented. SMS drafts require compatible messaging software, cellular service and a user action to send; the website does not confirm delivery. Location depends on device permission and availability.

There is no rescue dispatch, compensation approval, payment processing or government integration. Browser owner tokens are not a full resident account/recovery system. List APIs return the latest 200 authorized requests. Use fictional data and do not upload identity documents or real bank information.

## Assignment hand-in
Submit three separate links: this public GitHub repository, a screen-recorded demo up to three minutes, and a presentation video up to three minutes. Record the actual online website described above. Demonstrate submission, photos, staff acknowledgement, closing a job and finding it under Closed jobs. Explain both the intended benefit and current limits. Coding-agent assistance was used as permitted by the supplied assignment.
