// Agenda da PRÉVIA (artifact do Claude). A página publicada como artifact não consegue
// falar com nenhum servidor externo (nem o Node em server/, nem Supabase): o sandbox bloqueia.
// Lá dentro, o único armazenamento compartilhado é o banco do próprio artifact (claude.use('db')).
// Este arquivo replica as regras do servidor (server/index.js) em cima desse banco.
// Fora do artifact ele não é usado: bookings.js cai no servidor normal.
//
// Coleções:
//   slots/<AAAA-MM-DDTHH:MM>      { date, time, taken, reserva, owner }  pública, SEM dados pessoais
//   data/users/<uid>/<reservaId>  { date, time, name, phone, ... }       só o cliente que reservou e o dono leem
//   telefones/<sha256>            { slots: [chaves] }                    limite por telefone (hash, sem o número)
// Regras declaradas na publicação do artifact:
//   slots read view/write interact · telefones interact · data/users read+write admin · data/users/{self} interact
import { isValidDateKey, isValidSlot, isPastSlot, slotKey, todayKey, SLOT_MINUTES } from './slots.js'
import { normalizeBrPhone, cleanName, cleanService } from './validate.js'
import { avisoWhatsApp } from './aviso.js'

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

let userPromise = null
function previewUser() {
  if (!userPromise) userPromise = window.claude.use('user').catch(() => null)
  return userPromise
}
async function viewerId() {
  const u = await previewUser()
  return u ? u.id() : null
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

  const owner = await viewerId()
  if (!owner) return { error: 'preview_readonly' }

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
  await slotRef.set({ date, time, taken: true, reserva: booking.id, owner })
  await db.doc(`data/users/${owner}/${booking.id}`).set(booking)
  await phoneRef.set({ slots: [...active, key] })
  return { booking }
}

// ---------- painel do dono ----------
export async function previewIsOwner() {
  const u = await previewUser()
  try { return u ? await u.canEdit() : false } catch { return false }
}

async function findSlotOf(db, id) {
  const snap = await db.collection('slots').where('reserva', '==', id).get()
  const d = snap.docs.find((x) => x.data()?.taken === true)
  return d ? { key: d.id, ...d.data() } : null
}

async function setPhoneSlots(db, phone, change) {
  const ref = db.doc(`telefones/${await sha256(phone)}`)
  const snap = await ref.get()
  const list = snap.exists && Array.isArray(snap.data()?.slots) ? snap.data().slots : []
  await ref.set({ slots: change(list) })
}

export async function previewList(db) {
  if (!(await previewIsOwner())) return { error: 'preview_not_owner' }
  const snap = await db.collection('slots').where('taken', '==', true).get()
  const out = await Promise.all(snap.docs.map(async (d) => {
    const s = d.data()
    if (!s?.owner || !s?.reserva) return null
    const b = await db.doc(`data/users/${s.owner}/${s.reserva}`).get()
    return b.exists ? b.data() : null
  }))
  return { bookings: out.filter(Boolean) }
}

export async function previewCancel(db, id) {
  if (!(await previewIsOwner())) return { error: 'preview_not_owner' }
  const slot = await findSlotOf(db, id)
  if (!slot) return { error: 'not_found' }
  const ref = db.doc(`data/users/${slot.owner}/${id}`)
  const b = (await ref.get()).data()
  await db.doc(`slots/${slot.key}`).delete() // libera o horário
  await ref.delete()
  if (b?.phone) await setPhoneSlots(db, b.phone, (l) => l.filter((k) => k !== slot.key))
  return {
    cancelled: b,
    notification: avisoWhatsApp({ phone: b?.phone, event: 'cancelled', name: b?.name, date: slot.date, time: slot.time }),
  }
}

export async function previewReschedule(db, id, { date, time }) {
  if (!(await previewIsOwner())) return { error: 'preview_not_owner' }
  if (!isValidDateKey(date)) return { error: 'invalid_date' }
  if (!isValidSlot(date, time)) return { error: 'invalid_slot' }
  if (isPastSlot(date, time)) return { error: 'past_slot' }
  const slot = await findSlotOf(db, id)
  if (!slot) return { error: 'not_found' }
  const newKey = slotKey(date, time)
  if (newKey === slot.key) return { error: 'slot_taken' }

  const newRef = db.doc(`slots/${newKey}`)
  const lease = await newRef.acquire({ holder: uid(), ttlMs: 8000 })
  if (!lease.acquired) return { error: 'slot_taken' }
  const cur = await newRef.get()
  if (cur.exists && cur.data()?.taken === true) return { error: 'slot_taken' }

  const ref = db.doc(`data/users/${slot.owner}/${id}`)
  const b = (await ref.get()).data()
  if (!b) return { error: 'not_found' }
  await newRef.set({ date, time, taken: true, reserva: id, owner: slot.owner })
  await db.doc(`slots/${slot.key}`).delete()
  const updated = { ...b, date, time }
  await ref.set(updated)
  if (b.phone) await setPhoneSlots(db, b.phone, (l) => [...l.filter((k) => k !== slot.key), newKey])
  return {
    booking: updated,
    previous: { date: slot.date, time: slot.time },
    notification: avisoWhatsApp({ phone: b.phone, event: 'rescheduled', name: b.name, date, time, oldDate: slot.date, oldTime: slot.time }),
  }
}
