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
