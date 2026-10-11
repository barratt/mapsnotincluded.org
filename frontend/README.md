# Maps Not Included - README

Maps Not Included is intended to be a completely open-source, community driven alternative to [Tools Not Included](www.toolsnotincluded.com)

Resources for building, running, and extending Maps Not Included can be found below.

Maps Not Included is released "Open Source" for the full license information please refer to the [GNU AGPL v3 License](./LICENSE)

## Local Development

Setup, and development instructions can be found in the [Local Development](./docs/local-development.md) README.

## World search

The home page search box and presets call the world search API (`VITE_SEARCH_API_URL`). Results link to
`/world/:coordinate`, which loads `GET ${VITE_SEARCH_API_URL}/worlds/:coordinate/detail` and shows a cluster
overview, a zoomable biome map per asteroid with geyser and POI markers, sortable geyser stats, POIs, world traits
and the Spaced Out starmap. `/privacy` explains what the search stores.

The detail response has `coordinate`, `clusterName`, `gameMode`, `gameVersion`, `starmap` (`radius`, `entries` of
`{ id, q, r }`) and `asteroids`, each with `id`, `start`, `sizeX`, `sizeY`, `offset`, `traits` (`{ id, name }`),
`biomes` (`{ zone, polygons }`), `geysers` (`type`, `x`, `y`, `avgOutput`, `emitRate`, `eruptionSec`, `idleSec`,
`activeCycles`, `dormantCycles`, `minAvgOutput`, `maxAvgOutput`) and `pois` (`{ type, name, x, y }`).

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
