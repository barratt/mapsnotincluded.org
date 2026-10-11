import { geyserInfo, geyserRating } from '@/oniCatalog'

// Groups a geyser list by type for compact display: one entry per type with
// its count and best average output. Types the search asked for come first,
// then the most numerous, then the best rated.
export function groupGeysers(geysers, highlighted = new Set()) {
  const groups = new Map()
  for (const g of geysers) {
    let group = groups.get(g.type)
    if (!group) {
      const info = geyserInfo(g.type, g.name)
      group = { type: g.type, label: info.label, icon: info.icon, count: 0, best: null, outputs: [], rating: null }
      groups.set(g.type, group)
    }
    group.count++
    group.outputs.push(g.avgOutput)
    if (group.best == null || g.avgOutput > group.best.avgOutput) group.best = g
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      rating: geyserRating(group.best),
      highlighted: highlighted.has(group.type),
      outputs: group.outputs.sort((a, b) => b - a),
    }))
    .sort(
      (a, b) =>
        Number(b.highlighted) - Number(a.highlighted) ||
        b.count - a.count ||
        (b.rating ?? -1) - (a.rating ?? -1) ||
        a.label.localeCompare(b.label),
    )
}

// 1435 -> "1.4k", 182 -> "182"
export function shortOutput(gs) {
  if (gs == null) return ''
  return gs >= 1000 ? `${(gs / 1000).toFixed(gs >= 10000 ? 0 : 1)}k` : String(Math.round(gs))
}
