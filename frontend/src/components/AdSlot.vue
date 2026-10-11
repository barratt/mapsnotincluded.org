<script setup>
// One ad placement. Renders only when ads are switched on, this placement
// has an ad unit, and the visitor isn't a supporter (when supporters see
// none). The side rail shows on wide screens only, outside the content.
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { site, adsVisible } from '@/siteConfig'

const props = defineProps({
  placement: { type: String, required: true }, // sidebar | results | world
})

const ads = computed(() => site.config.ads ?? null)
const slot = computed(() => (adsVisible() ? ads.value?.slots?.[props.placement] ?? null : null))
const pushed = ref(false)

const loadedScripts = new Set()
function loadScript(src, attrs = {}) {
  if (loadedScripts.has(src) || document.querySelector(`script[src="${src}"]`)) return
  loadedScripts.add(src)
  const s = document.createElement('script')
  s.async = true
  s.src = src
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v)
  document.head.append(s)
}

async function show() {
  if (!slot.value || pushed.value) return
  await nextTick()
  if (ads.value.provider === 'adsense') {
    loadScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ads.value.adsenseClient)}`, { crossorigin: 'anonymous' })
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.value = true
    } catch {
      // A blocked or failed ad leaves the slot empty.
    }
  } else if (ads.value.scriptUrl) {
    loadScript(ads.value.scriptUrl)
    pushed.value = true
  }
}

onMounted(show)
watch(slot, show)
</script>

<template>
  <aside v-if="slot" class="ad-slot" :class="`ad-${placement}`" :aria-label="$t('ads.label')">
    <div class="ad-label">{{ $t('ads.label') }}</div>
    <ins
      v-if="ads.provider === 'adsense'"
      class="adsbygoogle"
      style="display: block"
      :data-ad-client="ads.adsenseClient"
      :data-ad-slot="slot"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
    <div v-else :id="slot"></div>
  </aside>
</template>

<style scoped>
.ad-slot {
  margin: 1.25rem auto;
  max-width: 970px;
  text-align: center;
}
.ad-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--bs-secondary-color);
  margin-bottom: 0.25rem;
}
/* Passive side rail: only where there is room beside the content. */
.ad-sidebar {
  display: none;
}
/* A 160px skyscraper beside the 1320px content column: needs 1700px. */
@media (min-width: 1700px) {
  .ad-sidebar {
    display: block;
    position: fixed;
    right: 12px;
    top: 120px;
    width: 160px;
    margin: 0;
    z-index: 1;
  }
}
</style>
