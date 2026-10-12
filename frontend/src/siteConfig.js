// Site-wide options set by the operators: store links for the game and its
// DLCs, ad slots and support links. Everything is off unless switched on,
// so an empty config shows nothing extra. Loaded once per visit.

import { reactive } from 'vue'
import { SEARCH_API_URL, api, getSession } from '@/searchApi'

export const site = reactive({
  config: {},
  // cluster prefix -> { gameMode, requiredDlcs }
  clusters: {},
  supporter: false,
})

let loading = null

export function loadSiteConfig() {
  if (!SEARCH_API_URL) return Promise.resolve()
  loading ??= (async () => {
    const { ok, data } = await api('/site-config').catch(() => ({ ok: false }))
    if (!ok || !data) return
    site.config = data
    const extra = []
    if (data.affiliate?.onWorlds) {
      extra.push(
        api('/clusters').then(({ data: list }) => {
          for (const c of Array.isArray(list) ? list : list?.clusters ?? []) {
            site.clusters[c.prefix] = { gameMode: c.gameMode, requiredDlcs: c.requiredDlcs ?? [] }
          }
        }),
      )
    }
    if (data.ads?.hideForSupporters && getSession()) {
      extra.push(api('/me').then(({ data: me }) => (site.supporter = Boolean(me?.supporter))))
    }
    await Promise.all(extra.map((p) => p.catch(() => {})))
  })()
  return loading
}

// The paid content a world needs beyond the base game: Spaced Out for its
// clusters, plus any DLC the cluster comes from.
export function productsForCluster(prefix) {
  const c = site.clusters[prefix]
  if (!c) return []
  return [...(c.gameMode === 'spacedOut' ? ['SpacedOut'] : []), ...c.requiredDlcs]
}

export function storeLink(product) {
  return site.config.affiliate?.links?.[product] ?? null
}

export function trackStoreClick(product) {
  api('/events', { method: 'POST', body: { type: 'affiliate_click', product } }).catch(() => {})
}

// The allowance is "AI searches" while filter and quick-pick searches are
// free; once the admin setting charges for either, it is plain "searches".
// key -> the string key to use (the "_all" variant when they cost one).
export function allowanceKey(key) {
  const costs = site.config.searchCosts
  return costs?.builder || costs?.presets ? `${key}_all` : key
}

export function adsVisible() {
  const ads = site.config.ads
  return Boolean(ads) && !(ads.hideForSupporters && site.supporter)
}
