// Wallpaper rotation. Loads the wallpaper list configured in Settings
// (api/wallpapers.php) and rotates to a random one every 2 hours (persisted).
// Falls back to premium CSS gradients when no wallpapers are configured.

export type Wall = { url?: string; css?: string; label: string }
type Item = { cat: string; url: string }

const KEY = 'hub_bg'
const TWO_HOURS = 2 * 60 * 60 * 1000
let ITEMS: Item[] = []

const CAT_LABEL: Record<string, string> = { custom: 'Custom' }

// Minimal, professional backgrounds: deep neutral bases with a single soft,
// low-saturation light source. Understated on purpose (Linear / Vercel feel).
const FALLBACK: Wall[] = [
  { label: 'Graphite', css: 'radial-gradient(1200px 820px at 78% -8%, rgba(99,102,241,.14), transparent 60%),linear-gradient(180deg,#0b0d12,#07080b)' },
  { label: 'Slate', css: 'radial-gradient(1100px 780px at 15% 0%, rgba(56,189,248,.12), transparent 58%),linear-gradient(170deg,#0a0c11,#080a0e)' },
  { label: 'Obsidian', css: 'radial-gradient(1000px 760px at 88% 12%, rgba(168,85,247,.12), transparent 60%),linear-gradient(160deg,#0c0a12,#070609)' },
  { label: 'Evergreen', css: 'radial-gradient(1100px 800px at 12% 8%, rgba(52,211,153,.10), transparent 58%),linear-gradient(175deg,#080d0b,#060807)' },
  { label: 'Carbon', css: 'radial-gradient(1200px 900px at 50% -10%, rgba(255,255,255,.06), transparent 60%),linear-gradient(180deg,#0c0d10,#08090c)' },
  { label: 'Ember', css: 'radial-gradient(1000px 760px at 85% 6%, rgba(251,146,60,.10), transparent 58%),linear-gradient(165deg,#0f0b0a,#080706)' },
  { label: 'Indigo', css: 'radial-gradient(1200px 820px at 20% -6%, rgba(79,70,229,.16), transparent 60%),linear-gradient(180deg,#0a0b14,#07080e)' },
  { label: 'Nocturne', css: 'radial-gradient(1100px 780px at 82% 8%, rgba(45,212,191,.10), transparent 58%),linear-gradient(170deg,#080b0e,#06080a)' },
]

export async function loadWallpapers(): Promise<number> {
  try {
    const r = await fetch('/api/wallpapers.php', { credentials: 'same-origin' })
    const j = await r.json()
    ITEMS = Array.isArray(j?.items) ? j.items : []
  } catch { ITEMS = [] }
  return ITEMS.length
}

function toWall(it: Item): Wall { return { url: it.url, label: CAT_LABEL[it.cat] || it.cat } }

// The active pool is the user's custom images if any, otherwise the built-in
// minimal gradients. Both are handled uniformly and keyed by url-or-label so a
// manual shuffle persists and survives the periodic auto-refresh.
function pool(): Wall[] { return ITEMS.length ? ITEMS.map(toWall) : FALLBACK }
function keyOf(w: Wall): string { return w.url || w.label }

function readSel(): { key: string; ts: number } | null {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null }
}
function writeSel(w: Wall, now: number) {
  try { localStorage.setItem(KEY, JSON.stringify({ key: keyOf(w), ts: now })) } catch {}
}

export function currentBg(now: number): Wall {
  const p = pool()
  const s = readSel()
  const found = s ? p.find(w => keyOf(w) === s.key) : undefined
  if (found && now - s!.ts <= TWO_HOURS) return found
  // pick a fresh one, seeded by the two-hour bucket so reloads stay stable
  const w = p[Math.floor(now / TWO_HOURS) % p.length]
  writeSel(w, now)
  return w
}

export function shuffleBg(now: number): Wall {
  const p = pool()
  const curKey = readSel()?.key || ''
  let w = p[Math.floor(Math.random() * p.length)]
  for (let i = 0; p.length > 1 && keyOf(w) === curKey && i < 12; i++) {
    w = p[Math.floor(Math.random() * p.length)]
  }
  writeSel(w, now)
  return w
}

export function bgStyle(w: Wall): React.CSSProperties {
  return w.url
    ? { backgroundImage: `url("${w.url}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: w.css }
}
