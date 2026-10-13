// Loads the full world detail for the world page from
// GET /worlds/:coordinate/detail on the search API (shape documented in
// README.md, "World page"). Falls back to the search summary, which has no
// map data.

import { SEARCH_API_URL, api, headers } from './searchApi'
import { fetchWorldTiles } from './worldTiles'
import { asteroidInfo, traitInfo } from './oniCatalog'

const looksLikeDetail = (data) => Array.isArray(data?.asteroids)

// The tile payload (worldTiles.js): { status: 'ok', detail, variant, settle }
// or a status ('generating', 'busy', 'refused', 'worldgen_failure', ...).
// Tiles are generated on our servers; the page only draws them.
export async function loadWorldTiles(coordinate, options) {
  if (!SEARCH_API_URL) return { status: 'unavailable' }
  try {
    return await fetchWorldTiles(SEARCH_API_URL, await headers(), coordinate, options)
  } catch {
    return { status: 'unavailable' }
  }
}

// Returns { detail, source, tiles?, pending?, refused?, failure?, error? }.
// source is 'api' or 'summary' (null when the world can't be shown). With
// tiles, every asteroid has tileData and `tiles` says { variant: 'presettle' |
// 'settled', settle } (what the settled variant is doing); `pending` means
// the tiles are still being generated: the page shows the rest and polls
// loadWorldTiles. `refused` carries the coordinate check when the game would
// not generate the coordinate as written; `failure` a worldgen failure
// reason. A coordinate that isn't indexed yet is generated on first view.
// error: { status: 'worldgen_failure' | 'busy' | 'not_found', reason }.
export async function loadWorldDetail(coordinate) {
  const tiles = await loadWorldTiles(coordinate)
  if (tiles.status === 'ok') return { detail: tiles.detail, source: 'api', tiles: { variant: tiles.variant, settle: tiles.settle } }
  if (tiles.status === 'refused') return { detail: null, source: null, refused: tiles.coordinateCheck ?? {} }
  // The world uses DLC content our generator has no data for (the game makes it fine).
  if (tiles.status === 'dlc_unavailable') return { detail: null, source: null, dlcUnavailable: tiles.names }
  if (tiles.status === 'worldgen_failure') return { detail: null, source: null, failure: tiles.reason ?? '' }
  const pending = tiles.status === 'generating' || tiles.status === 'busy' ? { retryAfterMs: tiles.retryAfterMs } : null
  const result = await loadDetailJson(coordinate)
  return pending && result.source === 'api' ? { ...result, pending } : result
}

async function loadDetailJson(coordinate) {
  const path = `/worlds/${encodeURIComponent(coordinate)}`
  let error = null
  if (SEARCH_API_URL) {
    try {
      const res = await api(`${path}/detail`)
      if (res.ok && looksLikeDetail(res.data)) return { detail: res.data, source: 'api' }
      if (res.data?.status === 'dlc_unavailable') return { detail: null, source: null, dlcUnavailable: res.data.names ?? [] }
      if (res.data?.status) error = { status: res.data.status, reason: res.data.reason ?? null }
    } catch {
      // fall back to the summary
    }
  }

  if (SEARCH_API_URL) {
    try {
      const res = await api(path)
      if (res.ok && looksLikeDetail(res.data)) return { detail: summaryToDetail(res.data), source: 'summary' }
    } catch {
      // fall through
    }
  }
  return { detail: null, source: null, error }
}

// The search summary (GET /worlds/:coordinate) has asteroids with plain trait
// strings and geysers without positions. Normalise it so the page can still
// show the asteroid list when the detail endpoint isn't available.
export function summaryToDetail(summary) {
  return {
    ...summary,
    asteroids: summary.asteroids.map((a) => ({
      ...a,
      name: a.name ?? asteroidInfo(a.id).label,
      traits: (a.traits ?? []).map((t) => (typeof t === 'string' ? { id: t, name: traitInfo(t).label } : t)),
      geysers: (a.geysers ?? []).map((g) => ({ ...g, type: g.type ?? g.id ?? '' })),
      biomes: a.biomes ?? [],
      pois: a.pois ?? [],
    })),
  }
}

// Oil reservoirs come from two places: the ones in templates are in the
// world's geyser list; the rest are scattered by the game after its settling
// step and only arrive with the settled map, among the ambient spawns. Moves
// those into the geyser list (marked ambient) so every reservoir shows and
// counts the same way.
export function withAmbientReservoirs(asteroid) {
  const ambient = asteroid?.ambient ?? []
  if (!ambient.some((a) => a.id === 'OilWell')) return asteroid
  const geysers = asteroid.geysers ?? []
  const template = geysers.find((g) => g.type === 'OilWell')
  const taken = new Set(geysers.filter((g) => g.type === 'OilWell').map((g) => `${g.x},${g.y}`))
  const added = ambient
    .filter((a) => a.id === 'OilWell' && !taken.has(`${a.x},${a.y}`))
    .map((a) => ({
      ...(template ?? { name: 'Oil Reservoir', type: 'OilWell', emitRate: 3333, avgOutput: 3333, minAvgOutput: 3333, maxAvgOutput: 3333, meanAvgOutput: 3333, stdDevAvgOutput: 0 }),
      x: a.x,
      y: a.y,
      ambient: true,
    }))
  return { ...asteroid, geysers: [...geysers, ...added], ambient: ambient.filter((a) => a.id !== 'OilWell') }
}
