import { computed, ref } from 'vue'

// Wheel, drag and pinch zoom/pan for an SVG whose viewBox is
// `0 0 width height` and whose element has the same aspect ratio. The
// transform is kept in viewBox units so markers rendered as HTML on top can be
// positioned with percentages via toPercent().
export function usePanZoom(viewport, size, { maxZoom = 16 } = {}) {
  const k = ref(1)
  const tx = ref(0)
  const ty = ref(0)
  const moved = ref(false)
  const pointers = new Map()
  let pinchDistance = 0
  let dragDistance = 0

  const width = () => size().width
  const height = () => size().height

  function clamp() {
    k.value = Math.min(maxZoom, Math.max(1, k.value))
    tx.value = Math.min(0, Math.max(width() * (1 - k.value), tx.value))
    ty.value = Math.min(0, Math.max(height() * (1 - k.value), ty.value))
  }

  // Screen pixels -> viewBox units.
  function unitsPerPixel() {
    const rect = viewport.value?.getBoundingClientRect()
    return rect?.width ? width() / rect.width : 1
  }

  function toViewBox(clientX, clientY) {
    const rect = viewport.value.getBoundingClientRect()
    return [((clientX - rect.left) / rect.width) * width(), ((clientY - rect.top) / rect.height) * height()]
  }

  function zoomAt(factor, cx = width() / 2, cy = height() / 2) {
    const next = Math.min(maxZoom, Math.max(1, k.value * factor))
    const ratio = next / k.value
    tx.value = cx - (cx - tx.value) * ratio
    ty.value = cy - (cy - ty.value) * ratio
    k.value = next
    clamp()
  }

  function reset() {
    k.value = 1
    tx.value = 0
    ty.value = 0
  }

  function panBy(dx, dy) {
    tx.value += dx
    ty.value += dy
    clamp()
  }

  // Centre the view on a point (viewBox units, before transform) at least at
  // the given zoom level.
  function focusOn(x, y, minZoom = 3) {
    k.value = Math.max(k.value, minZoom)
    tx.value = width() / 2 - x * k.value
    ty.value = height() / 2 - y * k.value
    clamp()
  }

  function onWheel(event) {
    event.preventDefault()
    const [cx, cy] = toViewBox(event.clientX, event.clientY)
    const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY
    zoomAt(Math.exp(-delta * 0.0015), cx, cy)
  }

  function onPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    pointers.set(event.pointerId, [event.clientX, event.clientY])
    moved.value = false
    dragDistance = 0
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      pinchDistance = Math.hypot(a[0] - b[0], a[1] - b[1])
    }
  }

  function onPointerMove(event) {
    const last = pointers.get(event.pointerId)
    if (!last) return
    const current = [event.clientX, event.clientY]

    if (pointers.size === 1) {
      const dx = current[0] - last[0]
      const dy = current[1] - last[1]
      dragDistance += Math.abs(dx) + Math.abs(dy)
      if (dragDistance > 4) {
        if (!moved.value) viewport.value?.setPointerCapture?.(event.pointerId)
        moved.value = true
        const scale = unitsPerPixel()
        panBy(dx * scale, dy * scale)
      }
    } else if (pointers.size === 2) {
      const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)[1]
      const distance = Math.hypot(current[0] - other[0], current[1] - other[1])
      const [cx, cy] = toViewBox((current[0] + other[0]) / 2, (current[1] + other[1]) / 2)
      if (pinchDistance > 0) zoomAt(distance / pinchDistance, cx, cy)
      const scale = unitsPerPixel() / 2
      panBy((current[0] - last[0]) * scale, (current[1] - last[1]) * scale)
      pinchDistance = distance
      moved.value = true
    }
    pointers.set(event.pointerId, current)
  }

  function onPointerUp(event) {
    pointers.delete(event.pointerId)
    pinchDistance = 0
  }

  function onKeydown(event) {
    const step = (width() / k.value) * 0.1
    const actions = {
      '+': () => zoomAt(1.4),
      '=': () => zoomAt(1.4),
      '-': () => zoomAt(1 / 1.4),
      _: () => zoomAt(1 / 1.4),
      0: reset,
      ArrowLeft: () => panBy(step * k.value, 0),
      ArrowRight: () => panBy(-step * k.value, 0),
      ArrowUp: () => panBy(0, step * k.value),
      ArrowDown: () => panBy(0, -step * k.value),
    }
    const action = event.target === event.currentTarget ? actions[event.key] : null
    if (action) {
      event.preventDefault()
      action()
    }
  }

  const transform = computed(() => `translate(${tx.value} ${ty.value}) scale(${k.value})`)

  function toPercent(x, y) {
    return {
      left: `${((x * k.value + tx.value) / width()) * 100}%`,
      top: `${((y * k.value + ty.value) / height()) * 100}%`,
    }
  }

  // At zoom 1 let vertical swipes scroll the page; once zoomed in, all touch
  // gestures pan the map.
  const touchAction = computed(() => (k.value > 1 ? 'none' : 'pan-y'))

  const handlers = {
    wheel: onWheel,
    pointerdown: onPointerDown,
    pointermove: onPointerMove,
    pointerup: onPointerUp,
    pointercancel: onPointerUp,
    pointerleave: onPointerUp,
    keydown: onKeydown,
  }

  return { k, tx, ty, moved, transform, touchAction, toPercent, zoomAt, reset, focusOn, handlers }
}
