import { SECONDS_PER_CYCLE } from '@/oniCatalog'

const nf0 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const int = (n) => (n == null ? '–' : nf0.format(n))
export const dec1 = (n) => (n == null ? '–' : nf1.format(n))
export const dec2 = (n) => (n == null ? '–' : nf2.format(n))

// g/s -> tonnes per cycle
export const tonsPerCycle = (gs) => (gs == null ? null : (gs * SECONDS_PER_CYCLE) / 1e6)

// Tonnes of storage needed to keep delivering the average output through a
// dormant period.
export const dormancyStorage = (g) =>
  g.avgOutput == null || g.dormantCycles == null ? null : (g.avgOutput * g.dormantCycles * SECONDS_PER_CYCLE) / 1e6

export const hasTiming = (g) => g.eruptionSec != null && g.idleSec != null && g.activeCycles != null && g.dormantCycles != null

export const eruptionShare = (g) => (hasTiming(g) ? g.eruptionSec / (g.eruptionSec + g.idleSec) : null)
export const activeShare = (g) => (hasTiming(g) ? g.activeCycles / (g.activeCycles + g.dormantCycles) : null)
