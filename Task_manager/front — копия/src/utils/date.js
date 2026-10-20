// Везде в состоянии и URL используем строки: день 'YYYY-MM-DD', месяц 'YYYY-MM'.
// Это убирает проблемы с часовыми поясами при сериализации Date.

const pad = n => String(n).padStart(2, '0')

export const toISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const today = () => toISO(new Date())
export const monthKey = iso => iso.slice(0, 7)

export function isValidISO(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  return toISO(fromISO(iso)) === iso // отсекает 2026-02-31 и т.п.
}

export function isValidMonth(ym) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(ym)
}

export function addDays(iso, n) {
  const d = fromISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const addWeeks = (iso, n) => addDays(iso, n * 7)

export function addMonths(ym, n) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

// неделя начинается с понедельника
export function startOfWeek(iso) {
  const d = fromISO(iso)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return toISO(d)
}

export function getWeekDays(iso) {
  const start = startOfWeek(iso)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

// Сетка месяца: массив недель, каждая — 7 объектов { date, inMonth }
export function getMonthGrid(ym) {
  const first = `${ym}-01`
  const last = addDays(`${addMonths(ym, 1)}-01`, -1)
  const weeks = []
  let cursor = startOfWeek(first)
  while (cursor <= last) {
    weeks.push(
        getWeekDays(cursor).map(date => ({ date, inMonth: monthKey(date) === ym }))
    )
    cursor = addDays(cursor, 7)
  }
  return weeks
}

export const formatDay = iso =>
    fromISO(iso).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })

export const formatDayFull = iso =>
    fromISO(iso).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function formatMonth(ym) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
}

export function formatWeekRange(iso) {
  const days = getWeekDays(iso)
  const fmt = d => fromISO(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  return `${fmt(days[0])} — ${fmt(days[6])}`
}