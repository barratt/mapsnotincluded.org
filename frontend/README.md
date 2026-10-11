# Maps Not Included - README

Maps Not Included is intended to be a completely open-source, community driven alternative to [Tools Not Included](www.toolsnotincluded.com)

Resources for building, running, and extending Maps Not Included can be found below.

Maps Not Included is released "Open Source" for the full license information please refer to the [GNU AGPL v3 License](./LICENSE)

## Local Development

Setup, and development instructions can be found in the [Local Development](./docs/local-development.md) README.

## World search

`/world/:coordinate` (`src/views/WorldView.vue` and `src/components/world/`) shows a cluster overview, a
zoomable map of every tile of each asteroid (element colours, a temperature view, hover info with element, mass,
temperature and germs, biome outlines, geyser, POI and spawn markers), sortable geyser stats, POIs, world traits,
biome and element legends and the Spaced Out starmap.

Data comes from the search API (`VITE_SEARCH_API_URL`), loaded by `src/worldDetail.js`. Tiles are generated on the
server; the page only decodes and draws them:

1. `GET /worlds/:coordinate/detail?format=bin`: the binary world payload, decoded by `src/worldTiles.js`.
2. Otherwise `GET /worlds/:coordinate/detail` (JSON, no tiles: biome map only), then the search summary
   (`GET /worlds/:coordinate`, asteroid list only).

### Binary world payload

Little-endian: `"MNIW"`, u32 version (1), u32 header length, the header (UTF-8 JSON), zero padding to a multiple
of 8 bytes, then the tile blob. The header is the JSON detail object, plus:

- `tiles`: `{ format: 1, settled, source, elements: [{ id, state }], diseases: [id] }`. `settled` is false for
  pre-settle tiles (the generator's layout before the game's settling step; shown with a "Pre-settle tiles" badge)
  and true for the grid the game shows at game start ("Game start").
- `coordinateCheck`: `{ status: 'accepted' }`.
- per asteroid:
  - `tiles`: `{ width, height, element, mass, temperature, disease, diseaseCount }`, where each array is
    `{ offset, type }`, a byte offset into the blob, 4-byte aligned. `element` is u16 (index into `tiles.elements`),
    `mass` f32 kg, `temperature` f32 K, `disease` u8 (index into `tiles.diseases`, 255 = no germs) and
    `diseaseCount` i32. There are `width * height` cells, row-major with y up (`index = y * width + x`).
  - `spawn`: `{ x, y, cell }`, start asteroid only (the Printing Pod).
  - `templates`: `[{ id, x, y }]`.
  - `ambient`: `[{ id, x, y }]` with settled tiles: critters, plants and other spawns.

Response headers: `X-MNI-Tiles` (`presettle` | `settled`) and `X-MNI-Settle`, which says what the settled variant is
doing (`ready`, `generating`, `busy`, `failed`, `available`, `unavailable`). While it is `generating`, the page polls
`?variant=settled` and swaps in the settled grid when it is ready.

Other answers:

- `202 { status: 'generating', retryAfterMs }`: the tiles are being generated. The page shows the JSON detail and
  polls.
- `409 { status: 'coordinate_refused', coordinateCheck }`: the game would rewrite the coordinate or not load it.
- `404` / `422 { status: 'worldgen_failure', reason }`: the game fails to generate the world.

Element colours and names are in `src/data/elementColors.js`. The file is generated: each element's substance colour
from the element table the game hands its simulation (build 744825), and the game's English element names.

### Third-party assets and code

- **ONI Seed Browser** by Stefan Oltmann, [github.com/StefanOltmann/oni-seed-browser](https://github.com/StefanOltmann/oni-seed-browser), AGPL-3.0:
  - `public/images/oni/seed-browser/*.webp`: biome, geyser, POI, building, asteroid, space POI and background sprites
    copied from `app/src/commonMain/composeResources/drawable` (a few PNGs converted to webp, otherwise unchanged).
  - `src/oniCatalog.js`: biome colours, English labels and id-to-sprite mappings ported from `ui/model/ZoneTypeUi.kt`,
    `ui/DrawableUtil.kt` and `composeResources/values/strings.xml` (licence header kept in the file). The geyser rating
    ring, its thresholds and the min/max quality bar follow `GeysersRow.kt` and `GeyserTooltip.kt`.
- **ONI Trait Finder** by Sgt_Imalas, [github.com/Sgt-Imalas/ONITraitFinder](https://github.com/Sgt-Imalas/ONITraitFinder), MIT:
  - `src/data/oni-names.json`: world trait names, descriptions and colours and asteroid display names extracted from
    `TraitFinderApp/wwwroot/data/gamedata_*.json` (source and licence noted in the file).
- Oxygen Not Included sprites and game text belong to Klei Entertainment. The world page footer credits both projects.
