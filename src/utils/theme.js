export const C = {
  // ── Backgrounds ──────────────────────────────────────────
  bg:          '#F4F2FF',        // very light violet page bg
  surface:     '#FFFFFF',
  card:        '#FFFFFF',
  cardHover:   '#FAF9FF',
  sidebar:     '#EDE9FF',        // light violet sidebar

  // ── Borders ──────────────────────────────────────────────
  border:      '#E2DCFF',
  borderLight: '#EDE9FF',

  // ── Violet Accent ─────────────────────────────────────────
  accent:      '#7C5CFC',
  accentHover: '#6A48F0',
  accentSoft:  '#7C5CFC14',
  accentBorder:'#7C5CFC30',

  // ── Green ─────────────────────────────────────────────────
  green:       '#16A34A',
  greenSoft:   '#16A34A12',
  greenBright: '#22C55E',

  // ── Status ────────────────────────────────────────────────
  red:         '#DC2626',
  redSoft:     '#DC262612',
  yellow:      '#D97706',
  yellowSoft:  '#D9770612',
  blue:        '#2563EB',
  blueSoft:    '#2563EB12',
  cyan:        '#0891B2',
  cyanSoft:    '#0891B212',
  purple:      '#7C3AED',
  purpleSoft:  '#7C3AED12',
  teal:        '#0D9488',
  tealSoft:    '#0D948812',

  // ── Text ──────────────────────────────────────────────────
  text:        '#1E1245',        // deep violet-tinted text
  textSub:     '#4A3F7A',
  muted:       '#9189B8',
  subtle:      '#C5BEE8',

  // ── Sidebar (light violet) ────────────────────────────────
  sideText:    '#1E1245',
  sideMuted:   '#7B6FBD',
  sideActive:  '#7C5CFC',
  sideActiveBg:'#7C5CFC18',
  sideBorder:  '#D8D0FF',
}

export const fmt = (n = 0) =>
  '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })

export const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const fmtShort = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
export const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']

export const STATUS_META = {
  draft:     { bg: '#EFF6FF', color: '#2563EB', label: 'Draft',     dot: '#2563EB' },
  sent:      { bg: '#ECFEFF', color: '#0891B2', label: 'Sent',      dot: '#0891B2' },
  pending:   { bg: '#FFFBEB', color: '#D97706', label: 'Pending',   dot: '#D97706' },
  paid:      { bg: '#F0FDF4', color: '#16A34A', label: 'Paid',      dot: '#16A34A' },
  overdue:   { bg: '#FEF2F2', color: '#DC2626', label: 'Overdue',   dot: '#DC2626' },
  cancelled: { bg: '#F5F5F5', color: '#9CA3AF', label: 'Cancelled', dot: '#9CA3AF' },
  completed: { bg: '#F0FDF4', color: '#16A34A', label: 'Completed', dot: '#16A34A' },
  active:    { bg: '#F0FDF4', color: '#16A34A', label: 'Active',    dot: '#16A34A' },
  inactive:  { bg: '#F5F5F5', color: '#9CA3AF', label: 'Inactive',  dot: '#9CA3AF' },
  failed:    { bg: '#FEF2F2', color: '#DC2626', label: 'Failed',    dot: '#DC2626' },
  service:   { bg: '#F3F0FF', color: '#7C5CFC', label: 'Service',   dot: '#7C5CFC' },
  product:   { bg: '#F0FDFA', color: '#0D9488', label: 'Product',   dot: '#0D9488' },
}
