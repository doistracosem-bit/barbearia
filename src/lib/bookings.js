// Store de agendamentos — agora COM backend.
// Lógica de slots pura re-exportada de ./slots.js.
// Anti-duplicação é garantida NO SERVIDOR (UNIQUE(date,time) + re-checagem atômica);
// o frontend também desabilita slots tomados. Sem localStorage.

export * from './slots.js'
export { NAME_MAX, normalizeBrPhone, cleanName } from './validate.js'
import { slotKey } from './slots.js'
import { NAME_MAX, normalizeBrPhone, cleanName } from './validate.js'

const API_BASE = (import.meta.env?.VITE_API_URL) || 'http://localhost:3001'

const ERR = {
  slot_taken: 'Esse horário já foi reservado. Escolha outro.',
  invalid_slot: 'Horário indisponível.',
  invalid_date: 'Data inválida.',
  past_slot: 'Esse horário já passou.',
  name_required: 'Informe seu nome.',
  name_too_long: `Use no máximo ${NAME_MAX} caracteres no nome.`,
  invalid_name: 'Informe um nome válido.',
  phone_required: 'Informe seu WhatsApp com DDD.',
  invalid_phone: 'WhatsApp inválido. Use DDD + número, ex.: (11) 91234-5678.',
  invalid_service: 'Serviço inválido.',
  phone_limit: 'Este WhatsApp já tem horários marcados. Fale com a barbearia para remarcar.',
  rate_limited: 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.',
  payload_too_large: 'Dados inválidos.',
  invalid_json: 'Dados inválidos.',
  unauthorized: 'Não autorizado.',
  owner_disabled: 'Endpoints do dono desabilitados (defina OWNER_TOKEN no servidor).',
  network: 'Não consegui falar com o servidor. Tente novamente.',
  invalid_range: 'Intervalo inválido.',
}

async function api(path, options = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    })
  } catch {
    return { ok: false, status: 0, error: 'network', message: ERR.network }
  }
  let data = null
  try { data = await res.json() } catch { data = null }
  return { ok: res.ok, status: res.status, data }
}

// horários tomados no intervalo (público, SEM PII) -> Set("YYYY-MM-DDTHH:00")
// Lança erro se o servidor não responder: sem dados, NÃO dá para dizer que está livre.
export async function fetchTaken(from, to) {
  const r = await api(`/api/availability?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
  if (!r.ok || !r.data || !Array.isArray(r.data.taken)) throw new Error('availability_unavailable')
  return new Set(r.data.taken)
}

// slots de um dia com disponibilidade (servidor)
export async function fetchSlots(date) {
  const r = await api(`/api/slots?date=${encodeURIComponent(date)}`)
  if (!r.ok || !r.data) return []
  return r.data.slots || []
}

export function isSlotKeyTaken(set, date, time) { return set.has(slotKey(date, time)) }

// criar agendamento no servidor; anti-duplicação server-side
export async function addBooking({ date, time, name, phone, service }) {
  const nm = cleanName(name)
  if (!nm.ok) return { ok: false, error: ERR[nm.error] }
  if (!String(phone || '').trim()) return { ok: false, error: ERR.phone_required }
  if (!normalizeBrPhone(phone)) return { ok: false, error: ERR.invalid_phone }
  const r = await api('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ date, time, name: nm.value, phone: String(phone).trim(), service: service || '' }),
  })
  if (r.ok && r.data?.booking) {
    try { window.dispatchEvent(new CustomEvent('bookings:changed')) } catch { /* */ }
    return { ok: true, booking: r.data.booking }
  }
  const key = r.data?.error
  return { ok: false, error: ERR[key] || ERR.network }
}

// ---- dono (depois): exige OWNER_TOKEN ----
export async function listBookings(token) {
  const r = await api('/api/bookings', { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) return { ok: false, error: ERR[r.data?.error] || ERR.network }
  return { ok: true, bookings: r.data?.bookings || [] }
}

export async function removeBooking(id, token) {
  const r = await api(`/api/bookings/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok) return { ok: false, error: ERR[r.data?.error] || ERR.network }
  try { window.dispatchEvent(new CustomEvent('bookings:changed')) } catch { /* */ }
  return { ok: true }
}

// ---- dono: CANCELAR + gerar wa.me (mensagem pronta; o dono envia) ----
export async function cancelBooking(id, token) {
  const r = await api(`/api/bookings/${encodeURIComponent(id)}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok) return { ok: false, error: ERR[r.data?.error] || ERR.network }
  try { window.dispatchEvent(new CustomEvent('bookings:changed')) } catch { /* */ }
  return { ok: true, cancelled: r.data?.cancelled, notification: r.data?.notification }
}

// ---- dono: REMARCAR + gerar wa.me (mensagem pronta; o dono envia) ----
export async function rescheduleBooking(id, { date, time }, token) {
  const r = await api(`/api/bookings/${encodeURIComponent(id)}/reschedule`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ date, time }),
  })
  if (!r.ok) return { ok: false, error: ERR[r.data?.error] || ERR.network }
  try { window.dispatchEvent(new CustomEvent('bookings:changed')) } catch { /* */ }
  return { ok: true, booking: r.data?.booking, previous: r.data?.previous, notification: r.data?.notification }
}
