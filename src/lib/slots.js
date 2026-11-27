// Lógica de slots (pura, sem DOM) — compartilhada entre frontend e backend.
// Intervalo de 1 hora. Sem dois agendamentos no mesmo (data + horário).

export const SLOT_MINUTES = 60 // 1 hora

// Horário de funcionamento (PLACEHOLDER). minutos desde 00:00. 0=domingo…6=sábado.
export const WORKING_HOURS = {
  0: null, // domingo fechado
  1: [9 * 60, 19 * 60],
  2: [9 * 60, 19 * 60],
  3: [9 * 60, 19 * 60],
  4: [9 * 60, 19 * 60],
  5: [9 * 60, 19 * 60],
  6: [8 * 60, 18 * 60],
}

export function pad(n) { return String(n).padStart(2, '0') }
export function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
// Fuso oficial da barbearia. Todo "agora" é lido aqui, nunca no fuso do servidor
// (hospedagens rodam em UTC) nem no do navegador do cliente.
export const TIME_ZONE = 'America/Sao_Paulo'

const tzFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})

// Data e hora de parede em Brasília para um instante: { key: 'AAAA-MM-DD', time: 'HH:MM' }
export function zonedNow(now = new Date()) {
  const p = Object.fromEntries(tzFormatter.formatToParts(now).map(({ type, value }) => [type, value]))
  return { key: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` }
}

export function todayKey(now = new Date()) { return zonedNow(now).key }
export function dateKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
export function keyToDate(key) { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d) }
export function slotKey(key, time) { return `${key}T${time}` }

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
export const TIME_RE = /^\d{2}:\d{2}$/

export function isValidDateKey(key) {
  if (!DATE_RE.test(key)) return false
  const d = keyToDate(key)
  return !Number.isNaN(d.getTime()) && dateKey(d) === key
}

export function slotsForDate(key, workingHours = WORKING_HOURS) {
  if (!isValidDateKey(key)) return []
  const d = keyToDate(key)
  const range = workingHours[d.getDay()]
  if (!range) return [] // fechado
  const [open, close] = range
  const slots = []
  for (let t = open; t + SLOT_MINUTES <= close; t += SLOT_MINUTES) {
    slots.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`) // HH:00 — 1h
  }
  return slots
}

export function isValidSlot(key, time, workingHours = WORKING_HOURS) {
  return TIME_RE.test(time) && slotsForDate(key, workingHours).includes(time)
}

export function isPastSlot(key, time, now = new Date()) {
  if (!isValidDateKey(key) || !TIME_RE.test(time)) return true
  // Compara data+hora de parede em Brasília (strings de largura fixa ordenam certo).
  const { key: nowKey, time: nowTime } = zonedNow(now)
  return `${key}T${time}` <= `${nowKey}T${nowTime}`
}
