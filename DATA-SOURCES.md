# Directory sources and licences

## OpenStreetMap snapshot

`public/directory.json` is an adapted open database, shared under ODbL 1.0. © OpenStreetMap contributors. The public app links directly to this data for download and displays attribution. Retain this notice and the public data link in derivatives.

- https://www.openstreetmap.org/copyright
- https://opendatacommons.org/licenses/odbl/1-0/
- Raw extract: `scripts/data/osm.json`
- Base timestamp: 2026-10-06T10:36:50Z
- Downloaded once through the public `https://lz4.overpass-api.de/api/interpreter` endpoint. Visitors NEVER call Overpass.
- Query:

```text
[out:json][timeout:30];
nwr["religion"="buddhist"](24,-125,50,-66);
out center tags;
```

This covers the contiguous-US region, including nearby Canadian data that is removed by US state polygon matching. It is incomplete even within that region. Alaska/Hawaii and community organization extraction attempts were unavailable and were not silently represented as complete. No Google Places results are stored or redistributed.

Only named, relevant places were retained. Obvious shops/restaurants/artworks/cemeteries and explicitly abandoned/disused entries were excluded. Monastery and temple categories are inferred from names and tags; duplicates with identical normalized names and nearly identical coordinates are merged. These heuristics do not certify a place's current status or affiliation.

## US state assignment

U.S. Census Bureau Generalized ACS 2025 States 5M boundary polygons (federal public-domain geographic data) are bundled in `scripts/data/states.geojson` for point-in-polygon classification. Generalized boundaries can be imprecise near borders; review manually where necessary.

https://tigerweb.geo.census.gov/arcgis/rest/services/Generalized_ACS2025/State_County/MapServer/8

## Official-source additions

Only basic factual contact/name/address details were recorded, not descriptions, logos, or copyrighted page text. These additions are listed in `scripts/official-places.json` with a source URL per record:

- Sitagu Buddhist Vihara: https://sitagu.org/austin/contact/contact.html
- Burmese American Community Institute: https://thebaci.org/contact-us/
- Burmese Rohingya Community of Wisconsin: https://www.brcw.org/resources
- Burmese Rohingya Community of Georgia: https://www.brcgrohingya.org/contactus
- Burma Center: https://www.burmacenterusa.org/home
- Burmese Community of Kansas: https://www.burmesekc.org/contact-us
- Rohingya Community Service of Georgia: https://rohingyacsga.org/about/
- Myanmar Center: https://www.myanmar-center.com/contact

Reviewed on 2026-10-06. Contact pages can be outdated; verify before visiting. Coordinates are retained from a matching OSM record only when present; otherwise null. Burmese search aliases are editorial aids, not asserted official names.

## Rebuild

From the project root:

```sh
python3 scripts/build-directory.py scripts/data/osm.json scripts/data/states.geojson
```

This rebuilds the bundled snapshot without network calls. For a future refresh, manually obtain a new modest OSM extract in accordance with the chosen provider's policy, review it and update the metadata date. Do not configure a visitor-facing proxy, per-visitor queries, aggressive polling, or automatic mirror rotation.

## Map library and tiles

Leaflet 1.9.4 is bundled under its BSD-2-Clause licence (`public/vendor/leaflet/LICENSE`). OSM tiles are requested only on explicit map display, using the published HTTPS tile URL, browser caching and visible attribution. Tiles are not bundled, prefetched, or saved by the service worker. Tile URL is configurable in `public/config.js`.

https://operations.osmfoundation.org/policies/tiles/


## v5.3.5 tradition corrections
Evidence links for the three corrected records are saved in scripts/tradition-overrides.json and each record’s traditionSource. Tradition tagging remains incomplete; unknown records are not assigned a guessed tradition. USA was removed from the tradition selector because this directory covers US locations. State filtering is tested against every populated state and each available tradition.


## v5.3.8 coverage audit (2026-10-08)
The saved OSM extract contains no Nashville-area records; state filtering cannot retrieve missing source records. Added six independently sourced records, retained in scripts/official-places.json: Nashville Buddhist Temple, Dhamma Viman, Dhammikarama, Serenity Insight Meditation Center, Charlotte Myanmar Buddhist Association (organization only), and Asokarama Michigan. Each record links its source; historical address caveats are displayed on cards. No map coordinates were guessed. Three NC Myanmar monasteries are now included, not a claim that NC only has three. The user's seven-monastery list remains to be reconciled when names are available. Nationwide Myanmar monastery coverage is still incomplete.


## v5.3.9 Wikipedia reconciliation
Source: https://en.wikipedia.org/w/index.php?title=List_of_Buddhist_temples_in_the_United_States&oldid=1367143141 (Wikipedia contributors, CC BY-SA 4.0, https://creativecommons.org/licenses/by-sa/4.0/). Reviewed 2026-10-08. The state-section lists contained 170 entries: 83 mapped to existing places (including alternate names), 86 added, and one person (Shi Yan Ming) excluded. Captions were not imported as separate records. This is not a nationwide completeness claim.

Adaptations: names and city/state facts normalized into the directory schema; no article prose or images copied. Imported street addresses, coordinates and unsupported traditions remain blank. The imported/alias dataset is retained in scripts/wikipedia-updates.json with CC BY-SA 4.0 attribution here and a source link in the UI. The audit trail is scripts/wikipedia-review.json. Original OSM records retain their ODbL attribution; this does not relicense OSM data.

Fresno's historic Kern Street site was corrected to Mrauk Oo Dhamma Center using https://www.mraukoo.org/copy-of-about-us and https://www.mraukoo.org/about-us. This is distinct from the relocated Fresno Betsuin congregation. The Wikipedia list contains few NC entries and does not resolve the user's seven NC monastery names.


## Sitagu 2024 US directory reconciliation — v5.4.0

Source: [Directory of Myanmar Monasteries, sixth edition (2024)](https://sitaguaustin.wordpress.com/wp-content/uploads/2024/05/directory-book.pdf), published by Sitagu. The US section contains 153 numbered entries in 30 states. Reviewed 2026-10-08.

- 136 new institutional records; 15 existing records enriched with aliases, Myanmar tradition and monastery categories.
- One duplicate Sitagu Austin record removed, retaining mapped coordinates.
- 2 entries (#78, #127) remain pending: the directory gives monks' names but no institution name. They are not published as invented institutions.
- Total directory: 1,025 records. NC has 10 Myanmar monastery/meditation-center records.
- Source-only additions clearly say that their 2024 address/current visiting arrangements have not been independently reconfirmed. No coordinates, personal telephone numbers or emails were guessed/imported.
- Existing verified addresses take priority. #148's conflicting source postcode was not imported. #137's incomplete street address was omitted. #113 has two source addresses and a confirmation note.
- Azusa is also corroborated by https://vaddhana.dhamma.org/offsite/Azusa.html and indexed as Brahma Vihara, Thondrarama Brahma Vihara, Progressive Buddhist Association, အဇူဇာကျောင်း and ဗြဟ္မဝိဟာရ.
- `scripts/sitagu-2024-review.json` accounts for all 153 entries; `scripts/sitagu-2024-updates.json` preserves additions during rebuilds. Source PDF is not redistributed.

Coverage is broader, not a claim to list every currently operating monastery. The directory includes Myanmar-associated Mon and Karen communities and meditation institutions; the Myanmar filter is a community/tradition grouping, not a nationality claim about every member.
