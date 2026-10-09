## 5.5.0 — Live appreciation and admin guide

Each Google user can give each of three reactions once. Transactions preserve concurrent choices; Firestore rules reject duplicate or removed choices. Legacy single reactions remain counted. Public counts subscribe live; local clicks update immediately. Admin guide uses responsive external CSS and prominent links. Validation: 30 unit tests, 14 emulator tests, two-session browser reactions and responsive guide checks.

## v5.4.9 — Structured location, event details and local QR sharing

Separate City/State user fields serialize into the existing city_state format; event and profile imports parse it. Event details opens a public-details dialog with organizer website, copy controls and locally generated QR linking to the event. Source: qrcode-generator 1.4.4 (MIT header retained). Guide CSS is external for the production CSP. Legacy JSON import is under Advanced. Unchanged event snapshots no longer rebuild reaction controls; stale initial count responses do not overwrite optimistic interaction.

Validated: 30 unit tests, modal/QR rendering and live list browser checks, production-CSP guide styling, community reaction checks. Hosting deployed to tmf-mm; no event records modified.

## v5.4.8 — Immediate delete confirmation and distinct profile UI

List Delete now opens its modal before loading any editor or photo. It validates the selected record revision before deleting. Inbox label/select spacing and focus appearance are fixed. Place profiles no longer displays the duplicate Events submission inbox; it is dedicated to institution profiles. Existing profile data is retained.

Live public code was verified as v5.4.7 with modal code present. The reported 403 request URL/response is still unknown (admin-places.html is the containing page), so this release does not claim to resolve production Publish denial. No production writes or deployment performed.

Local mocked admin workflow including modal delete passed. Deploy UI: `firebase deploy --only hosting --project tmf-mm`. Use matching packaged firestore.rules if earlier rule changes are not deployed.

## v5.4.7 — No repeat Google popup within an active admin session

Removed per-write auth-age reauthentication from the client and matching 15-minute auth_time write restriction from Firestore rules. Verified Google email allowlist, document validation and ownership rules remain enforced. Explicit sign-out, tab session persistence and 15-minute client inactivity logout remain. Delete modal confirmation now proceeds using the existing valid account. Legacy linking controls are hidden when there are no loaded records.

Deploy BOTH: `firebase deploy --only hosting,firestore:rules --project tmf-mm`. Hosting-only deployment leaves the old server auth-age restriction active. Live permission-denied cause was not independently established; local publish/receipt and older-session tests validate the packaged rules. No production deployment performed.

## v5.4.6 — Live admin inbox, modal deletion and Burmese guide

Admin inbox uses a live Firestore listener (latest 25; older submissions via Load more). Logout detaches it. Delete confirmations use an accessible native HTML dialog with cancel focus. Legacy linking is collapsed under Already published and enabled only after selecting an existing record. Reactions update counts optimistically and roll back on failure. Admin guide is available at public/admin-guide.html and linked from both admin pages.

The existing fresh-auth requirement remains: a Google identity confirmation can be required for sensitive writes; it is now explained before the popup. Do not confuse this with logout. Live permission-denied cause could not be established from the screenshot; packaged rules passed atomic publish+receipt and existing security tests. Deploy matching rules, not hosting alone.

Deploy: `firebase deploy --only hosting,firestore:rules,firestore:indexes --project tmf-mm`.

Validation: 13 Firestore emulator tests; mocked admin modal and community reaction checks passed. No production data modifications or deployment performed.

## v5.4.5 — Live events and live submission status

Public Events subscribes to published Firestore documents. Add, edit, archive and delete changes update the open page without refresh. Static sample/archive fixtures are no longer mixed into the public list. The Refresh events button is removed. Contribution status follows the signed-in user's submission and linked publication automatically; My submission status is hidden. Private privacy-request status remains separate. Missing/archived/deleted publication reads display Removed or unpublished; unknown legacy links are not guessed.

Legacy submissions with no publication reference require the existing inbox Link existing event action once. No historical database records were modified by this release.

Deploy: `firebase deploy --only hosting,firestore:rules,firestore:indexes --project tmf-mm`.

Validation: 30 unit tests, 12 local Firestore emulator tests including independent admin publish/delete and public live listener updates, and browser live-add/remove rendering without navigation. No production deployment or data deletion performed.

## v5.4.4 — Shared tab sign-in and editor lifecycle

Public contributions/reactions and admin now use browser-session persistence and await authentication restoration. A rejected admin access check does not sign the public user out. Public Events no longer advertises an admin publishing button. Reactions immediately show selection, roll back on failure, and keep status space stable. Events loads only when entering its panel, not on unrelated route refreshes.

Successful Save/Publish/Delete closes the form. New, Edit/Publish and Review reopen it. Existing unlinked submissions can be explicitly associated with an existing event/profile via the inbox selector and Link existing button; this does not republish or create a copy. The sender can then use My submission status to see actual publication availability.

Deploy: `firebase deploy --only hosting,firestore:rules --project tmf-mm` (rules unchanged from v5.4.3, included for upgrades).

Validation: 30 unit tests; local mocked admin, inbox and community browser checks passed, including reaction add/remove and hidden-editor behavior. No production writes, deletions or deployment performed.

## v5.4.3 — Publication receipts and submission completion

Deploy BOTH hosting and rules: `firebase deploy --only hosting,firestore:rules --project tmf-mm`.

Successful submissions reset the form/photo; failed sends retain them. Admin saves keep the record ID and revision, preventing repeated Publish from creating a second record. Imported community submissions get a private publication reference in the same transaction as the event/profile save. Sender status checks the referenced publication. Existing unlinked publications require review/linking; they are not guessed or deleted. Matching existing event drafts (same title, organizer, start date) reuse the existing record. Public Events reloads on entry.

Public read-only verification found two published ပဝါရဏာ events, both entered as Kitty Hawk, TX, with different dates. No production records were modified.

Validation: 30 unit tests, 11 Firestore emulator security tests (including receipt restrictions), mocked browser admin and submission/publish checks passed. Production deployment remains pending.

## v5.4.2 — Admin publishing and tab session

Review & publish opens the editor. Publish validates and saves publicly; list rows expose Delete with confirmation. Events/community profiles reuse tab-scoped sign-in, recheck server access on each page, and retain the 15-minute idle logout and fresh-write authentication. Event imports preserve the public address. Reviewed submission status identifies its subject.

Validated locally with mocked cloud/auth: publishing, archive, delete, cross-page session restoration, sign-out and responsive layouts. No production events were created, deleted or published. Deploy hosting only; existing rules remain unchanged.

## v5.4.1 — Event submission shortcuts

Events now links directly to Share an event and Admin publishing. Google sign-in unauthorized-domain must be resolved in Firebase Authentication Settings by adding the actual hosting hostname. No production authentication settings were changed.

# TMF v5.4.0 — Myanmar monastery directory expansion

136 new institutions from Sitagu’s 2024 sixth-edition directory; 15 existing entries enriched; one duplicate removed. 1,025 total directory records. NC now has 10 Myanmar monasteries/meditation centers. Azusa is searchable in English and Burmese.

The 153 US source entries are accounted for in `scripts/sitagu-2024-review.json`; two unnamed entries remain pending. Source-year notes distinguish historical listings from currently reconfirmed addresses. See DATA-SOURCES.md.

Validation: 29 automated tests and the browser tradition/state/search checks passed. Rebuilding the directory retains the changes. This package has not been deployed.

Deploy from the extracted tmf-free folder:

```sh
firebase deploy --only hosting --project tmf-mm
```

---

## v5.3.1 — Responsive polish

Restored the pagoda illustration on tablet and desktop, added a compact mobile illustration, centered the footer, and separated search controls with contained keyboard focus indicators.

Deploy: `firebase deploy --only hosting --project tmf-mm`

# TMF v5.3 — Compact search-first layout

The home page opens directly to search; Browse names is a separate view with initially collapsed groups. Mobile hides the decorative hero artwork and keeps search near the top. Sticky view shortcuts retain query/filter state. Footer support links are compact, with the same payment destinations and legal/admin links.

Deploy from this project folder: `firebase deploy --only hosting --project tmf-mm`. Firestore rules/data/config are unchanged. This package has not been deployed to production. Service worker cache is bumped to v5.3.0; reload after deployment.

Validation: 20 Node tests and `tests/compact-layout-check.mjs` passed. Chrome tested widths 320, 390, 768, 1024 and 1440; no horizontal overflow, mobile search above 450px, view switching preserves text, collapsed browse opens the detail dialog, footer height and all four support URLs checked. External cloud transport blocked in the layout test; no production writes or sign-in were performed.

---

# TMF Free v5.2 — Search အတွက် Google billing မလိုပါ

အသုံးပြုနည်း၊ Contribute/Events အလုပ်လုပ်ပုံ၊ Admin setup နဲ့ account လုံခြုံရေး: **[မြန်မာလမ်းညွှန်](TMF-User-Admin-Guide-MM.md)**။ SVG branding, optimized cover uploads, community profiles, authenticated emoji reactions and pastel category cards are included. Live Firebase setup/deployment is still required; production sign-in has not been tested.

Rules tests: `npm install` then `npm run test:rules` (Node 22/24, Java 21+). This uses a demo emulator project, not production. Only the two owner-specified verified Google accounts may write events, profiles and media. Other verified Google users can only write their own event reaction.

ရှာဖွေရေးအတွက် API key၊ credit card၊ Google billing မလိုပါ။
ပါဝင်တဲ့ `public/directory.json` ဖိုင်ထဲက နေရာ **796 ခု** ကို browser ထဲမှာ တိုက်ရိုက်ရှာပါတယ်။
`Sitagu` သို့မဟုတ် `သီတဂူ` နဲ့ရှာရင် Austin ကျောင်းကို တွေ့ပါတယ်။


## v3.2 — Footer support links

Coffee $5, Burger $10, Big Meal $15 and Donation / Charity cards are included in the footer. The four owner-supplied Stripe links are connected in the supplied order: Coffee, Burger, Big Meal, then Donation / Charity. Set `support.coffee`, `support.burger`, `support.meal`, and `support.charity` in `public/config.js` to your own payment links. Amounts shown are labels; configure the actual checkout amounts with your provider. The site never initiates or processes a charge. Invalid or missing URLs remain disabled. All four rendered destinations were checked against the supplied links. Stripe checkout amounts and payment processing were not independently verified; no transaction was made. Existing search and directory browsing are unchanged.

## v3.1 — မရှာဘဲ နာမည်စာရင်းမှ ရွေးကြည့်ရန်

Search မသုံးဘဲ ဘုန်းကြီးကျောင်း၊ ဘုရား/စေတီ၊ မြန်မာအသင်းအဖွဲ့ နာမည်စာရင်းကို အမျိုးအစားအလိုက် ကြည့်နိုင်ပါပြီ။ အက္ခရာစဉ်အလိုက် စီထားပြီး အစစာလုံး ရွေးနိုင်ပါတယ်။ နာမည်ကို နှိပ်ရင် လိပ်စာ၊ website၊ ဖုန်း (ရှိလျှင်)၊ Directions နဲ့ မူရင်းအချက်အလက်လင့်ခ်ကို ဝင်းတစ်ခုထဲမှာ ပြပေးပါတယ်။ Close / Escape ဖြင့် ပိတ်နိုင်ပါတယ်။

Browse စာရင်းက Search နဲ့ သီးခြားဖြစ်လို့ Search စာသား၊ ပြည်နယ်နဲ့ filter တွေ မပြောင်းပါ။ ဒေတာ 796 ခု၊ အခမဲ့ local search၊ offline support နဲ့ မူရင်းဒီဇိုင်းကို ဆက်ထိန်းထားပါတယ်။

Additional validation: `node tests/browse-check.mjs` (same Playwright setup as below) checks every category count, name sorting, letter selection, details, keyboard focus restoration, preservation of search state/URL, and desktop/mobile sizing. Existing search, event, suggestion, and offline browser checks also passed. No new external service is used.

## VS Code မှာတင်နည်း

1. ZIP ဖြည်ပြီး **tmf-free** folder ကို VS Code မှာဖွင့်ပါ။ `firebase.json` နဲ့ `public` folder ကို မြင်ရပါမယ်။ အဟောင်းနဲ့ ဖိုင်တစ်ချို့ပဲ ရောမကူးဘဲ ဒီ project တစ်ခုလုံးကို သုံးပါ။
2. Terminal မှာ:

```sh
firebase login
firebase use
firebase deploy --only firestore:rules,firestore:indexes,hosting
```

မူရင်း `.firebaserc` ကို ထိန်းထားပါတယ်။ `firebase use` ပြတဲ့ project ကို စစ်ပြီးမှ deploy လုပ်ပါ။
Firebase CLI မရှိသေးရင် `npm install -g firebase-tools` တစ်ကြိမ်လုပ်ပါ။ Build မလိုပါ။

3. ပြလာတဲ့ Hosting URL ကို ဖွင့်ပါ။ အပေါ်မှာ **MYANMAR COMMUNITY · FREE EDITION**၊ အောက်မှာ **TMF Free v5.2** လို့ ပြရပါမယ်။
4. Screenshot ထဲက အနက်ရောင်ဒီဇိုင်းပဲ ပြနေရင် Hosting URL နောက်မှာ `/refresh.html` ထည့်ဖွင့်ပြီး **Version အသစ် ဖွင့်ရန်** ကို နှိပ်ပါ။ TMF cache အဟောင်းကိုသာ ရှင်းပေးပါတယ်။ ဥပမာ `https://YOUR-SITE.web.app/refresh.html`။ ဒီစာမျက်နှာတောင် မပေါ်ရင် project/folder မှားတင်ထားခြင်း ရှိမရှိ စစ်ပါ။

## ကုန်ကျစရိတ်

- Search filters the bundled JSON plus any loaded community profiles in browser memory. Cloud profiles load separately; no Google Places, Overpass or email API is used.
- Map: optional Leaflet + OpenStreetMap tiles, no key/billing. Tiles load only after Show map. Community tile servers have fair-use limits and no uptime guarantee. Search does not depend on map availability.
- Directions / Search the web: ordinary external website links opened only when clicked; no Maps API is called.
- Suggestions: verified Google users send directly to a private Firestore inbox. One pending submission per account; only the sender and authorized admins may read it. No recipient email or automatic email notification is used.
- Hosting: **Firebase Spark** supports static hosting within its free quota. Check your project's plan; this project does not change billing settings. Existing Blaze projects can still incur hosting/other-service charges beyond their free allowance. Do not activate billing just for this app. If your existing project needs paid services for another app, use a separate Spark project for this site rather than changing that app's plan.
- v5 includes optional Firebase Authentication + Firestore for the events admin. Enable Google sign-in and deploy the supplied rules/indexes before using it. No Cloud Functions, App Hosting, Cloud Storage or build is needed. See `TMF-User-Admin-Guide-MM.md` for setup, limits and account protection.

Firebase plan reference: https://firebase.google.com/docs/hosting/usage-quotas-pricing
Map policy: https://operations.osmfoundation.org/policies/tiles/

## ဒေတာအကန့်အသတ်

The bundled directory is a snapshot from 2026-10-06, not a live Google-sized directory. It has 796 records across 43 US states/DC, including 65 monastery matches, 789 temple/pagoda matches, and **7 Myanmar community organizations**. Categories overlap. Organization coverage is especially limited; missing results do not imply an organization does not exist. The app provides an ordinary web-search link for missing places.

Most records are sourced from OpenStreetMap. Names/tags determine categories and cultural traditions, so they may need corrections. The directory includes Buddhist places beyond Theravada. “All traditions” includes records whose tradition is not known; country-specific filters show only records with matching hints. Some records lack exact street addresses, websites, phone numbers, or coordinates. State matching uses Census boundaries. Check linked sources and confirm before visiting.

Sitagu Austin and seven community organizations have independently sourced official contact records. Source links are shown on cards. Added places without reliable coordinates remain searchable and have Directions links, but do not get fabricated map pins. Map coverage is indicated when some results lack coordinates.

To add/edit places: update `public/directory.json`, retain its metadata, and redeploy. Record schema:

```json
{
  "id": "unique-id",
  "name": "Place name",
  "aliases": ["မြန်မာအမည်", "Alternate name"],
  "categories": ["monastery", "temple"],
  "traditions": ["Myanmar"],
  "address": "Confirmed street address",
  "city": "City",
  "state": "TX",
  "stateName": "Texas",
  "lat": null,
  "lon": null,
  "website": "https://official-site.example",
  "phone": "",
  "source": "https://official-source.example",
  "sourceType": "official"
}
```

Use `organization` for community organizations. Coordinates are optional; use null if not verified. Update the top-level `updated` date when the list changes. `scripts/official-places.json` and the data-builder are included for reproducible maintenance, but no script is needed to run/deploy this release. See DATA-SOURCES.md for provenance and licensing.

## ပွဲစာရင်းနှင့် မူရင်းဖိုင်များ

The original three event examples from 2025 are preserved and marked sample/archive. They are not verified current events. Edit `public/events.json` with confirmed dates. Optimized WebP images save bandwidth; full original images are in `legacy/images`. Original Google/EmailJS/cloud configuration is archived in `legacy/`, not executed or hosted. The existing Firebase project selection and GitHub Hosting workflows are preserved.

## Local preview / Tests

```sh
python3 -m http.server 8080 --directory public
```

Open http://localhost:8080. Do not double-click index.html; modules need a local server.

```sh
npm test
```

20 unit tests cover: English/Burmese Sitagu search, aliases, categories, state filters, unknown results, URL safety, event filtering, data validation, and absence of paid API calls.

Optional browser tests (Node.js and Playwright):

```sh
npm install --no-save playwright
npx playwright install chromium
# Separate terminal:
python3 -m http.server 8766 --directory public
# Then:
node tests/browser-check.mjs
```

Browser checks passed with external services blocked: local search, Burmese text, categories, empty results, map dependency fallback, archived events, suggestion file download, and no horizontal overflow at 320/390/768/1440 widths across all three screens. Cached app reload and local search also passed completely offline. Map markers were checked with external tiles blocked to avoid automated requests to the public tile service. No production deployment or email transmission was performed.

The worker caches the application and directory, never external map tiles. First visit still needs network. After successful loading, cached search works offline; maps and external links still need network. Old TMF caches are removed on activation. `/refresh.html` is included for users stuck on the original cache-first app.

GitHub Hosting workflows run the dependency-free unit tests and deploy static files (no build step). They do not deploy Firestore rules/indexes; run the manual deployment command above for those.

Admin UI checks: `node tests/admin-check.mjs` uses mocked Google/Firestore modules for UI flows only. `npm run test:rules` tests authorization against the actual Firestore emulator. Browser scripts accept PLAYWRIGHT_MODULE, CHROME_PATH and TMF_URL environment variables.

## v5 architecture and tests

`tmf_events` and `tmf_places` contain text records. `tmf_media` stores one optimized WebP (max 160,023 data-URL characters) per record, excluded from indexing and fetched lazily. No Cloud Storage bucket is used. Reaction choices live at `tmf_events/{eventId}/reactions/{uid}`; server count aggregation reads only published events, one Google account/choice with a five-second update cooldown. User IDs and choices are publicly readable on published events; no email/name is stored. This is appreciation, not fraud-proof polling. Deletes remove the parent/photo but not nested reaction documents; use Archive, or clean orphan subcollections in the console. Exports contain loaded text records only.

Public profile lists page 100 at a time via Load more; only loaded profiles join search/browse. A shared published profile link also loads its record directly. Community profiles are client-rendered; no SEO or social-preview guarantee.

`node tests/community-check.mjs` tests real image decoding and UI flows with mocked cloud transport. Test image fixtures are included. It also applies the configured admin CSP. `npm run test:rules` has seven emulator security tests, including photo access/limits, profile writes and reaction spoofing/counts/cooldown. Existing browser and browse tests remain available. See the Burmese guide for limitations and deployment.

TIFF decoding uses locally vendored UTIF.js 3.1.0 and pako 1.0.11, with MIT licenses in `public/vendor/tiff/`. Decoding runs in a disposable worker with a 12-second timeout and a 20-megapixel TIFF limit. Plain SVG is validated and rasterized; unsupported SVG content must be exported as PNG.

## v5.1 private inbox and admin identity

Visitors use Send for review; downloads and mailto have been removed. `tmf_submissions/{uid}` stores one pending payload per Google account, including an optional optimized photo. Pending payloads cannot be overwritten by the sender or approved by the sender. Reviewed payloads may be replaced after a one-minute creation cooldown. Only admins may list (25 at a time), mark reviewed, or delete. The editor imports only public draft fields; publication remains a separate action. Server rules gate admin entry through a read-only `tmf_admin_access/check` path (no document creation needed). The allowlist is no longer shipped in client config. Keep root rules, ZIPs, and private repository history off public hosting.

Google OAuth Branding is separate: its support email can appear on the consent screen. Set an appropriate public support identity instead of a private admin address in Google Auth Platform > Branding; this code does not modify that cloud setting. Previously distributed copies of old source cannot be recalled.

Run `node tests/inbox-check.mjs` for UI flows; use `npm run test:rules` for the ten actual emulator authorization tests. Deploy rules, indexes and hosting together. Google provider setup is unchanged. No paid email service or Cloud Function is added. The Burmese guide has the full current workflow.

## v5.2 recovery and policy pages

The live v5.1 UI was inspected without signing in or submitting data: no explicit sign-in control, always-visible sign-out, and status disabled while waiting on the Google popup. `contribution.js` now loads auth with a timeout, opens sign-in directly from an explicit click, observes account changes, and keeps status/auth controls outside the submit form. Writes/status reads have bounded UI waits; a timed-out operation may still complete, so check status before retrying. Draft form fields are retained.

`tmf_privacy_requests` provides a separate private inbox while a community suggestion is pending, with the same owner/admin restrictions. Privacy items cannot be imported as public drafts through the inbox UI. Deploy all rules/indexes/hosting together. Admins must carry out deletion requests across relevant collections/Auth where appropriate; marking reviewed does not delete data.

Static English `privacy.html` and `terms.html` are linked in the footer and contribution form. `site-footer.js` sets the current year; policy effective dates remain explicit. Operator practices and public support identity must match the published policies. Google OAuth branding support contact is a separate cloud setting.

New tests: `node tests/contribution-recovery-check.mjs` verifies hung SDK/write/status recovery; `node tests/legal-check.mjs` verifies policy links, a future copyright year and responsive layout. The emulator suite has eleven security tests. No production writes, account changes, email delivery or deployment were performed.
