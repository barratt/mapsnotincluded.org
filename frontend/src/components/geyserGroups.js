import { geyserInfo, geyserMean, geyserRating } from '@/oniCatalog'

// Groups a geyser list by type for compact display: one entry per type with
// its count, combined average output and average quality. Seven geysers at
// 126 g/s (882 combined) are worth more than six at 137 (822), so the chip
// shows the total and the ring shows how good they are on average.
//
// Order: types the search asked for first, then by combined output relative
// to the type's mean (a steam vent and a gas vent compare fairly), then name.
export function groupGeysers(geysers, highlighted = new Set()) {
  const groups = new Map()
  for (const g of geysers) {
    let group = groups.get(g.type)
    if (!group) {
      const info = geyserInfo(g.type, g.name)
      group = { type: g.type, label: info.label, icon: info.icon, count: 0, total: 0, outputs: [], ratings: [] }
      groups.set(g.type, group)
    }
    group.count++
    group.total += g.avgOutput ?? 0
    group.outputs.push(g.avgOutput)
    const rating = geyserRating(g)
    if (rating != null) group.ratings.push(rating)
  }
  return [...groups.values()]
    .map((group) => {
      const mean = geyserMean(group.type)
      return {
        ...group,
        average: group.count ? Math.round(group.total / group.count) : 0,
        rating: group.ratings.length ? group.ratings.reduce((a, b) => a + b, 0) / group.ratings.length : null,
        weight: mean ? group.total / mean : group.count,
        highlighted: highlighted.has(group.type),
        outputs: group.outputs.sort((a, b) => b - a),
      }
    })
    .sort((a, b) => Number(b.highlighted) - Number(a.highlighted) || b.weight - a.weight || a.label.localeCompare(b.label))
}

// 1435 -> "1.4k", 182 -> "182"
export function shortOutput(gs) {
  if (gs == null) return ''
  return gs >= 1000 ? `${(gs / 1000).toFixed(gs >= 10000 ? 0 : 1)}k` : String(Math.round(gs))
}
