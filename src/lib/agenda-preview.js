// Agenda da PRÉVIA (artifact do Claude). A página publicada como artifact não consegue
// falar com nenhum servidor externo (nem o Node em server/, nem Supabase): o sandbox bloqueia.
// Lá dentro, o único armazenamento compartilhado é o banco do próprio artifact (claude.use('db')).
// Este arquivo replica as regras do servidor (server/index.js) em cima desse banco.
// Fora do artifact ele não é usado: bookings.js cai no servidor normal.
//
// Coleções:
//   slots/<AAAA-MM-DDTHH:MM>  { date, time, taken: true }       pública, SEM dados pessoais
//   reservas/<id>              { date, time, name, phone, ... }  só quem pode reservar lê (Viewers e links públicos não)
//   telefones/<sha256>         { slots: [chaves] }               limite por telefone (hash, sem o número)
import { isValidDateKey, isValidSlot, isPastSlot, slotKey, todayKey, SLOT_MINUTES } from './slots.js'
import { normalizeBrPhone, cleanName, cleanService } from './validate.js'

const MAX_ACTIVE_PER_PHONE = 2
const MAX_PER_WINDOW = 5
const WINDOW_MS = 15 * 60_000
const attempts = [] // limite de tentativas desta aba (o sandbox não expõe IP)

let dbPromise = null
export function previewDb() {
  if (dbPromise) return dbPromise
  const use = typeof window !== 'undefined' && window.claude && typeof window.claude.use === 'function'
  dbPromise = use ? window.claude.use('db').catch(() => null) : Promise.resolve(null)
  return dbPromise
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`)

export async function previewTaken(db, from, to) {
  const snap = await db.collection('slots').where('date', '>=', from).where('date', '<=', to).get()
  const out = new Set()
  for (const d of snap.docs) {
    const v = d.data()
    if (v && v.taken === true && typeof v.date === 'string' && typeof v.time === 'string') out.add(slotKey(v.date, v.time))
  }
  return out
}

// mesmas respostas de erro do servidor ({ error: 'slot_taken' } etc.)
export async function previewCreate(db, { date, time, name, phone, service }) {
  const now = Date.now()
  while (attempts.length && attempts[0] <= now - WINDOW_MS) attempts.shift()
  if (attempts.length >= MAX_PER_WINDOW) return { error: 'rate_limited' }
  attempts.push(now)

  const nm = cleanName(name)
  if (!nm.ok) return { error: nm.error }
  if (!String(phone ?? '').trim()) return { error: 'phone_required' }
  const ph = normalizeBrPhone(phone)
  if (!ph) return { error: 'invalid_phone' }
  const sv = cleanService(service)
  if (!sv.ok) return { error: sv.error }
  if (!isValidDateKey(date)) return { error: 'invalid_date' }
  if (!isValidSlot(date, time)) return { error: 'invalid_slot' }
  if (isPastSlot(date, time)) return { error: 'past_slot' }

  const key = slotKey(date, time)
  const slotRef = db.doc(`slots/${key}`)
  const holder = uid()
  // trava curta no horário: quem pegar primeiro grava, o outro recebe slot_taken
  const lease = await slotRef.acquire({ holder, ttlMs: 8000 })
  if (!lease.acquired) return { error: 'slot_taken' }
  const cur = await slotRef.get()
  if (cur.exists && cur.data()?.taken === true) return { error: 'slot_taken' }

  const phoneRef = db.doc(`telefones/${await sha256(ph)}`)
  const phoneSnap = await phoneRef.get()
  const today = todayKey()
  const active = (phoneSnap.exists && Array.isArray(phoneSnap.data()?.slots) ? phoneSnap.data().slots : [])
    .filter((k) => typeof k === 'string' && k.slice(0, 10) >= today)
  if (active.length >= MAX_ACTIVE_PER_PHONE) return { error: 'phone_limit' }

  const booking = {
    id: uid(), date, time, name: nm.value, phone: ph, service: sv.value,
    created_at: new Date().toISOString(), slot_minutes: SLOT_MINUTES,
  }
  await slotRef.set({ date, time, taken: true, reserva: booking.id })
  await db.doc(`reservas/${booking.id}`).set(booking)
  await phoneRef.set({ slots: [...active, key] })
  return { booking }
}
