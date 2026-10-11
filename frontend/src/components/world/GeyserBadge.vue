<script setup>
import { computed } from 'vue'
import { ratingClass } from '@/oniCatalog'

// Round sprite with a progress ring showing where the geyser's average output
// sits in its type's range, as in the ONI Seed Browser's geyser rows.
const props = defineProps({
  icon: { type: String, default: null },
  rating: { type: Number, default: null },
  size: { type: Number, default: 40 },
  count: { type: Number, default: 1 },
  label: { type: String, default: '' },
})

const style = computed(() => ({
  '--size': `${props.size}px`,
  '--pct': `${Math.round((props.rating ?? 0) * 100)}%`,
}))
</script>

<template>
  <span class="geyser-badge" :class="`rating-${ratingClass(rating)}`" :style="style">
    <img v-if="icon" :src="icon" :alt="label" loading="lazy" />
    <i v-else class="bi bi-cloud-haze2" aria-hidden="true"></i>
    <span v-if="count > 1" class="geyser-badge-count">{{ count }}</span>
  </span>
</template>

<style scoped>
.geyser-badge {
  --ring: transparent;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background:
    radial-gradient(closest-side, var(--sb-chip) calc(100% - 3px), transparent calc(100% - 2px)),
    conic-gradient(var(--ring) var(--pct), rgba(0, 0, 0, 0.35) 0);
  border: 1px solid var(--sb-anthracite);
}
.rating-good { --ring: var(--sb-good-ring); }
.rating-medium { --ring: var(--sb-medium-ring); }
.rating-bad { --ring: var(--sb-bad-ring); }
.rating-none { background: var(--sb-chip); }
.geyser-badge img {
  width: 76%;
  height: 76%;
  object-fit: contain;
}
.geyser-badge-count {
  position: absolute;
  bottom: -2px;
  right: -2px;
  min-width: 1.2em;
  padding: 0 0.25em;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.75);
  font-size: 0.75rem;
  font-weight: bold;
  line-height: 1.2em;
  text-align: center;
  color: #fff;
}
</style>
