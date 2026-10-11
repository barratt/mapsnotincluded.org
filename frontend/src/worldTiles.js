// Tile-level world data for the world page: every cell of every asteroid.
//
// GET /worlds/:coordinate/detail?format=bin on the search API returns a
// binary world payload (README "World page"):
//
//   "MNIW" | u32 version (1) | u32 header length | header JSON | pad to 8 | tile blob
//
// The header is the regular world detail plus `tiles` (element and disease
// tables, settled flag) and, per asteroid, `tiles` with byte offsets into the
// blob for element (u16), mass (f32), temperature (f32), disease (u8, 255 =
// none) and diseaseCount (i32) arrays. Cells are row-major with y up:
// index = y * width + x.

import { markRaw } from 'vue'
import { ELEMENTS } from './data/elementColors'

export const SETTLE_STATES = ['ready', 'generating', 'busy', 'failed', 'available', 'unavailable']

const TYPES = { u16: Uint16Array, f32: Float32Array, u8: Uint8Array, i32: Int32Array }

// ArrayBuffer -> detail object with asteroid.tileData typed arrays.
export function decodeWorldPayload(buffer) {
  const view = new DataView(buffer)
  const magic = String.fromCharCode(...new Uint8Array(buffer, 0, 4))
  if (magic !== 'MNIW') throw new Error('not a world payload')
  const version = view.getUint32(4, true)
  if (version !== 1) throw new Error(`unsupported world payload version ${version}`)
  const length = view.getUint32(8, true)
  const header = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 12, length)))
  const blobStart = Math.ceil((12 + length) / 8) * 8
  for (const asteroid of header.asteroids ?? []) {
    const t = asteroid.tiles
    if (!t) continue
    const n = t.width * t.height
    const array = ({ offset, type }) => new TYPES[type](buffer, blobStart + offset, n)
    asteroid.tileData = markRaw({
      width: t.width,
      height: t.height,
      element: array(t.element),
      mass: array(t.mass),
      temperature: array(t.temperature),
      disease: array(t.disease),
      diseaseCount: array(t.diseaseCount),
    })
  }
  return header
}

// -> { status: 'ok', detail, variant, settle } | { status: 'generating', retryAfterMs }
//    | { status: 'refused', coordinateCheck } | { status: 'worldgen_failure', reason }
//    | { status: 'unavailable' }
export async function fetchWorldTiles(baseUrl, headers, coordinate, { variant = null } = {}) {
  const query = variant ? `&variant=${variant}` : ''
  const res = await fetch(`${baseUrl}/worlds/${encodeURIComponent(coordinate)}/detail?format=bin${query}`, { headers })
  if (res.status === 200 && (res.headers.get('content-type') ?? '').startsWith('application/vnd.mni.world')) {
    const detail = decodeWorldPayload(await res.arrayBuffer())
    return {
      status: 'ok',
      detail,
      variant: res.headers.get('x-mni-tiles') ?? (detail.tiles?.settled ? 'settled' : 'presettle'),
      settle: res.headers.get('x-mni-settle') ?? 'unavailable',
    }
  }
  const body = await res.json().catch(() => ({}))
  if (res.status === 202) return { status: 'generating', retryAfterMs: body.retryAfterMs ?? 2000 }
  if (res.status === 409) return { status: 'refused', coordinateCheck: body.coordinateCheck }
  if (body.status === 'worldgen_failure') return { status: 'worldgen_failure', reason: body.reason }
  if (res.status === 503) return { status: 'busy', retryAfterMs: body.retryAfterMs ?? 5000 }
  return { status: 'unavailable' }
}

// ----------------------------------------------------------- presentation --

const STATE_NAMES = { s: 'Solid', l: 'Liquid', g: 'Gas', v: 'Vacuum' }
const STATE_OF = { Solid: 's', Liquid: 'l', Gas: 'g', Vacuum: 'v' }
const FALLBACK = { s: '#8a8178', l: '#4a7fbf', g: '#9fc6d9', v: '#000000' }
// Display tweaks on top of the game colours, for a dark map: Neutronium's
// white and pure black elements would read as holes.
const DISPLAY = { Unobtanium: '#4a4752', Graphite: '#2a2a2e', CrudeOil: '#2a1d14', Naphtha: '#2e1d3d', Aerogel: '#3b4148' }
const BACKDROP = [24, 26, 31]

const hexRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

// Per element index: { id, name, state, rgb }.
export function elementTable(tiles) {
  return (tiles?.elements ?? []).map((e) => {
    const id = typeof e === 'string' ? e : e.id
    const known = ELEMENTS[id]
    const state = known?.[2] ?? STATE_OF[e.state] ?? 's'
    const colour = DISPLAY[id] ?? known?.[1] ?? FALLBACK[state]
    return { id, name: known?.[0] ?? id.replace(/([a-z])([A-Z])/g, '$1 $2'), state, stateName: STATE_NAMES[state], rgb: hexRgb(colour) }
  })
}

// RGBA per element index for the element view: gases are drawn faint over
// the backdrop, vacuum is transparent (the space background shows through).
export function elementPalette(table) {
  const palette = new Uint8ClampedArray(Math.max(1, table.length) * 4)
  table.forEach((e, i) => {
    const o = i * 4
    if (e.state === 'v') return
    const mix = e.state === 'g' ? 0.35 : 1
    for (let c = 0; c < 3; c++) palette[o + c] = Math.round(e.rgb[c] * mix + BACKDROP[c] * (1 - mix))
    palette[o + 3] = 255
  })
  return palette
}

// Temperature colour ramp (kelvin): cold blue, comfortable green, hot red.
const RAMP = [
  [0, [40, 40, 120]],
  [223, [60, 90, 230]],
  [263, [70, 190, 240]],
  [283, [80, 210, 150]],
  [303, [120, 220, 80]],
  [318, [240, 220, 60]],
  [348, [245, 140, 40]],
  [400, [230, 60, 40]],
  [1000, [255, 40, 120]],
  [2500, [255, 230, 230]],
]
export function temperatureColour(kelvin) {
  if (kelvin <= RAMP[0][0]) return RAMP[0][1]
  for (let i = 1; i < RAMP.length; i++) {
    const [k1, c1] = RAMP[i]
    if (kelvin <= k1) {
      const [k0, c0] = RAMP[i - 1]
      const t = (kelvin - k0) / (k1 - k0)
      return c0.map((v, j) => Math.round(v + (c1[j] - v) * t))
    }
  }
  return RAMP.at(-1)[1]
}

// Paints one asteroid into an RGBA buffer (canvas rows top-down, so game
// row y lands on canvas row height - 1 - y). mode: 'elements' | 'temperature'.
// highlight: an element index whose cells stay bright while the rest dims.
export function paintTiles(data, table, mode, highlight = null, out = new Uint8ClampedArray(data.width * data.height * 4)) {
  const { width, height, element, temperature } = data
  const palette = elementPalette(table)
  for (let y = 0; y < height; y++) {
    const row = (height - 1 - y) * width
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const o = (row + x) * 4
      const e = element[i]
      if (mode === 'temperature') {
        if (table[e]?.state === 'v') {
          out[o + 3] = 0
          continue
        }
        const [r, g, b] = temperatureColour(temperature[i])
        out[o] = r
        out[o + 1] = g
        out[o + 2] = b
        out[o + 3] = 255
      } else {
        const p = e * 4
        out[o] = palette[p]
        out[o + 1] = palette[p + 1]
        out[o + 2] = palette[p + 2]
        out[o + 3] = palette[p + 3]
      }
      if (highlight !== null && e !== highlight && out[o + 3]) {
        out[o] *= 0.22
        out[o + 1] *= 0.22
        out[o + 2] *= 0.22
      }
    }
  }
  return out
}

const GERMS = {
  FoodPoisoning: 'Food Poisoning',
  SlimeLung: 'Slimelung',
  PollenGerms: 'Floral Scents',
  ZombieSpores: 'Zombie Spores',
  RadiationSickness: 'Radioactive Contaminants',
}
export const germName = (id) => GERMS[id] ?? String(id).replace(/([a-z])([A-Z])/g, '$1 $2')

export function formatMass(kg) {
  if (!(kg > 0)) return '0 g'
  if (kg >= 1000) return `${(kg / 1000).toFixed(kg >= 10000 ? 1 : 2)} t`
  if (kg >= 1) return `${kg.toFixed(kg >= 100 ? 0 : 1)} kg`
  if (kg >= 0.001) return `${(kg * 1000).toFixed(kg >= 0.1 ? 0 : 1)} g`
  return `${(kg * 1e6).toFixed(1)} mg`
}

export const formatTemperature = (kelvin) => `${(kelvin - 273.15).toFixed(1)} °C`

// One cell's hover info, or null outside the grid.
export function cellInfo(data, table, diseases, x, y) {
  if (!data || x < 0 || y < 0 || x >= data.width || y >= data.height) return null
  const i = y * data.width + x
  const e = table[data.element[i]]
  const d = data.disease[i]
  return {
    x,
    y,
    element: e?.name ?? '?',
    state: e?.state ?? 's',
    mass: data.mass[i],
    temperature: data.temperature[i],
    germ: d === 255 ? null : germName(diseases?.[d] ?? d),
    germCount: d === 255 ? 0 : data.diseaseCount[i],
  }
}
