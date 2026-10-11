// A coarse browser fingerprint: a SHA-256 of stable browser properties. Used
// only for fair-use limits (see the privacy page), and hashed again server side.

let cached

function canvasSample() {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 40
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '16px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(0, 0, 100, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('Oxygen Not Included', 2, 2)
    return canvas.toDataURL()
  } catch {
    return ''
  }
}

export async function browserFingerprint() {
  if (cached !== undefined) return cached
  try {
    const parts = [
      navigator.userAgent,
      navigator.language,
      (navigator.languages || []).join(','),
      navigator.platform,
      navigator.hardwareConcurrency,
      navigator.deviceMemory,
      navigator.maxTouchPoints,
      screen.width,
      screen.height,
      screen.colorDepth,
      window.devicePixelRatio,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvasSample(),
    ]
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(parts.join('|')))
    cached = [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    cached = null
  }
  return cached
}
