// Shared transform: raw Events Calendar API objects -> the grouped shape
// the Events screen renders. Used by the build-time sync and the initial
// snapshot generator so both stay identical.

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function decode(s = '') {
  return String(s)
    .replace(/&#8217;|&#039;|&#39;/g, "'")
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#038;|&amp;/g, '&')
    .replace(/&#8211;|&#8212;/g, '–')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseDate(s) {
  // "2026-07-19 17:00:00" -> local Date
  const [d, t = '0:0:0'] = String(s).split(' ')
  const [y, mo, da] = d.split('-').map(Number)
  const [h, mi] = t.split(':').map(Number)
  return new Date(y, mo - 1, da, h || 0, mi || 0)
}

function fmtTime(dt) {
  let h = dt.getHours()
  const m = dt.getMinutes()
  const ap = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return m ? `${h}:${String(m).padStart(2, '0')} ${ap}` : `${h}:00 ${ap}`
}

function catInfo(name = '') {
  const n = decode(name).toLowerCase()
  if (n.includes('heart to heart')) return { label: 'Heart to Heart', cls: 'cat-h2h' }
  if (n.includes('education')) return { label: 'Education', cls: 'cat-education' }
  if (n.includes('camp')) return { label: 'Family Camp', cls: 'cat-camp' }
  if (n.includes('night out') || n.includes('respite')) return { label: "Parents' Night Out", cls: 'cat-pno' }
  if (n.includes('connection') || n.includes('community')) return { label: 'Connection', cls: 'cat-connection' }
  return { label: name ? decode(name) : 'Event', cls: 'cat-education' }
}

export function toEventGroups(rawEvents, today = new Date()) {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const upcoming = rawEvents
    .map((e) => ({ ...e, _start: parseDate(e.start_date), _end: e.end_date ? parseDate(e.end_date) : null }))
    .filter((e) => e._start >= startOfToday) // no past events
    .sort((a, b) => a._start - b._start)

  const groups = []
  const index = {}

  for (const e of upcoming) {
    const s = e._start
    const end = e._end
    const monthKey = s.toLocaleString('en-US', { month: 'long' }) + ' ' + s.getFullYear()
    if (index[monthKey] === undefined) {
      index[monthKey] = groups.length
      groups.push({ month: monthKey, items: [] })
    }

    const cat = catInfo(`${e.category || ""} ${e.title || ""}`)
    const venueName = decode(e.venue || '')
    const city = decode(e.city || '')
    const place = venueName
      ? (city && !/virtual/i.test(venueName) ? `${venueName}, ${city}` : venueName)
      : 'See event details'

    const multiDay = end && end.toDateString() !== s.toDateString()
    let timeStr
    if (multiDay) timeStr = `${MONTHS[s.getMonth()]} ${s.getDate()} – ${MONTHS[end.getMonth()]} ${end.getDate()}`
    else if (e.all_day) timeStr = 'All day'
    else timeStr = end ? `${fmtTime(s)} – ${fmtTime(end)}` : fmtTime(s)

    const free = !e.cost || String(e.cost).trim() === '' || /free/i.test(e.cost)

    groups[index[monthKey]].items.push({
      mon: MONTHS[s.getMonth()],
      day: String(s.getDate()),
      dow: DOW[s.getDay()],
      cat: cat.label,
      catClass: cat.cls,
      title: decode(e.title),
      meta: `${timeStr} · ${place}`,
      free,
      cta: free ? 'RSVP →' : 'Register →',
      link: e.url,
    })
  }
  return groups
}
