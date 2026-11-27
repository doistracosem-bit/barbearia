import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { db, SLOT_MINUTES } from './db.js'
import { notifyWhatsApp, messages } from './notify.js'
import {
  isValidDateKey,
  isValidSlot,
  isPastSlot,
  slotKey,
  slotsForDate,
} from './slots.js'

const PORT = Number(process.env.PORT || 3001)
const OWNER_TOKEN = process.env.OWNER_TOKEN || '' // sem token => endpoints do dono desabilitados
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*').split(',').map((s) => s.trim())

// ---------- helpers ----------
function setCors(req, res) {
  const origin = req.headers.origin
  if (ALLOWED_ORIGINS.includes('*')) res.setHeader('Access-Control-Allow-Origin', '*')
  else if (origin && ALLOWED_ORIGINS.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
}

function json(res, status, body) {
  const data = JSON.stringify(body)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(data)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (c) => { raw += c; if (raw.length > 1e6) req.destroy() })
    req.on('end', () => {
      if (!raw) return resolve({})
      try { resolve(JSON.parse(raw)) } catch { reject(new Error('invalid_json')) }
    })
    req.on('error', reject)
  })
}

function isUniqueViolation(err) {
  return err && (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === 'SQLITE_CONSTRAINT' || /UNIQUE/i.test(String(err.message)))
}

function ownerAuthorized(req) {
  if (!OWNER_TOKEN) return false // desabilitado sem token
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : ''
  // comparação simples; em produção use comparação constante-tempo + auth real
  return token.length === OWNER_TOKEN.length && token === OWNER_TOKEN
}

// ---------- agendamentos ----------
const insertStmt = db.prepare(`
  INSERT INTO bookings (id, date, time, name, phone, service, created_at, slot_minutes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)
const takenInRangeStmt = db.prepare(`
  SELECT date, time FROM bookings WHERE date >= ? AND date <= ? ORDER BY date, time
`)
const slotExistsStmt = db.prepare(`SELECT 1 FROM bookings WHERE date = ? AND time = ?`)
const listStmt = db.prepare(`SELECT id, date, time, name, phone, service, created_at, slot_minutes FROM bookings ORDER BY date, time`)
const deleteStmt = db.prepare(`DELETE FROM bookings WHERE id = ?`)
const getStmt = db.prepare(`SELECT id, date, time, name, phone, service, created_at, slot_minutes FROM bookings WHERE id = ?`)
const updateStmt = db.prepare(`UPDATE bookings SET date = ?, time = ? WHERE id = ?`)
const slotExistsOtherStmt = db.prepare(`SELECT 1 FROM bookings WHERE date = ? AND time = ? AND id <> ?`)

// DatabaseSync é síncrono; tudo num único tick => sem corrida entre checar e inserir.
function createBooking({ date, time, name, phone, service }) {
  const nm = String(name ?? '').trim()
  if (!nm) return { ok: false, status: 400, error: 'name_required' }
  if (!isValidDateKey(date)) return { ok: false, status: 400, error: 'invalid_date' }
  if (!isValidSlot(date, time)) return { ok: false, status: 400, error: 'invalid_slot' } // 1h + dentro do funcionamento
  if (isPastSlot(date, time)) return { ok: false, status: 400, error: 'past_slot' }

  // anti-duplicação explícita…
  if (slotExistsStmt.get(date, time)) return { ok: false, status: 409, error: 'slot_taken' }

  const booking = {
    id: randomUUID(),
    date, time,
    name: nm,
    phone: phone ? String(phone).trim() : null,
    service: service ? String(service).trim() : null,
    created_at: new Date().toISOString(),
    slot_minutes: SLOT_MINUTES,
  }

  try {
    // …e UNIQUE(date,time) como garantia atômica final
    insertStmt.run(booking.id, booking.date, booking.time, booking.name, booking.phone, booking.service, booking.created_at, booking.slot_minutes)
  } catch (err) {
    if (isUniqueViolation(err)) return { ok: false, status: 409, error: 'slot_taken' }
    throw err
  }

  return { ok: true, status: 201, booking }
}

// ---------- HTTP ----------
const server = createServer(async (req, res) => {
  setCors(req, res)
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }

  const url = new URL(req.url, `http://localhost:${PORT}`)
  const path = url.pathname

  try {
    // health
    if (req.method === 'GET' && path === '/api/health') {
      return json(res, 200, { ok: true, slotMinutes: SLOT_MINUTES })
    }

    // disponibilidade pública (SEM PII): horários tomados no intervalo
    if (req.method === 'GET' && path === '/api/availability') {
      const from = url.searchParams.get('from') || ''
      const to = url.searchParams.get('to') || ''
      if (!isValidDateKey(from) || !isValidDateKey(to)) return json(res, 400, { error: 'invalid_range' })
      const rows = takenInRangeStmt.all(from, to)
      const taken = rows.map((r) => slotKey(r.date, r.time))
      return json(res, 200, { slotMinutes: SLOT_MINUTES, taken })
    }

    // slots de um dia (com disponibilidade; sem PII)
    if (req.method === 'GET' && path === '/api/slots') {
      const date = url.searchParams.get('date') || ''
      if (!isValidDateKey(date)) return json(res, 400, { error: 'invalid_date' })
      const takenSet = new Set(takenInRangeStmt.all(date, date).map((r) => r.time))
      const slots = slotsForDate(date).map((time) => ({
        time,
        available: !takenSet.has(time) && !isPastSlot(date, time),
      }))
      return json(res, 200, { date, slotMinutes: SLOT_MINUTES, slots })
    }

    // criar agendamento
    if (req.method === 'POST' && path === '/api/bookings') {
      let body
      try { body = await readBody(req) } catch { return json(res, 400, { error: 'invalid_json' }) }
      const r = createBooking(body || {})
      if (!r.ok) return json(res, r.status, { error: r.error })
      return json(res, r.status, { booking: r.booking })
    }

    // ---- dono (depois): exige OWNER_TOKEN ----
    if (req.method === 'GET' && path === '/api/bookings') {
      if (!OWNER_TOKEN) return json(res, 503, { error: 'owner_disabled', hint: 'defina OWNER_TOKEN' })
      if (!ownerAuthorized(req)) return json(res, 401, { error: 'unauthorized' })
      return json(res, 200, { bookings: listStmt.all() })
    }

    if (req.method === 'DELETE' && path.startsWith('/api/bookings/') && !path.endsWith('/cancel') && !path.endsWith('/reschedule')) {
      if (!OWNER_TOKEN) return json(res, 503, { error: 'owner_disabled', hint: 'defina OWNER_TOKEN' })
      if (!ownerAuthorized(req)) return json(res, 401, { error: 'unauthorized' })
      const id = decodeURIComponent(path.slice('/api/bookings/'.length))
      const info = deleteStmt.run(id)
      return json(res, 200, { ok: true, deleted: info.changes })
    }

    // ---- dono: CANCELAR + notificar cliente no WhatsApp ----
    if (req.method === 'POST' && path.endsWith('/cancel')) {
      if (!OWNER_TOKEN) return json(res, 503, { error: 'owner_disabled', hint: 'defina OWNER_TOKEN' })
      if (!ownerAuthorized(req)) return json(res, 401, { error: 'unauthorized' })
      const id = decodeURIComponent(path.slice('/api/bookings/'.length, -'/cancel'.length))
      const b = getStmt.get(id)
      if (!b) return json(res, 404, { error: 'not_found' })
      deleteStmt.run(id) // libera o horário
      const notification = await notifyWhatsApp({
        phone: b.phone,
        event: 'cancelled',
        message: messages().cancel({ name: b.name, date: b.date, time: b.time }),
      })
      return json(res, 200, { ok: true, cancelled: b, notification })
    }

    // ---- dono: REMARCAR + notificar cliente no WhatsApp ----
    if (req.method === 'POST' && path.endsWith('/reschedule')) {
      if (!OWNER_TOKEN) return json(res, 503, { error: 'owner_disabled', hint: 'defina OWNER_TOKEN' })
      if (!ownerAuthorized(req)) return json(res, 401, { error: 'unauthorized' })
      const id = decodeURIComponent(path.slice('/api/bookings/'.length, -'/reschedule'.length))
      const b = getStmt.get(id)
      if (!b) return json(res, 404, { error: 'not_found' })

      let body
      try { body = await readBody(req) } catch { return json(res, 400, { error: 'invalid_json' }) }
      const date = body?.date
      const time = body?.time
      if (!isValidDateKey(date)) return json(res, 400, { error: 'invalid_date' })
      if (!isValidSlot(date, time)) return json(res, 400, { error: 'invalid_slot' }) // 1h + funcionamento
      if (isPastSlot(date, time)) return json(res, 400, { error: 'past_slot' })

      // anti-duplicação no novo horário (excluindo o próprio), em transação
      db.exec('BEGIN')
      try {
        if (slotExistsOtherStmt.get(date, time, id)) {
          db.exec('ROLLBACK')
          return json(res, 409, { error: 'slot_taken' })
        }
        updateStmt.run(date, time, id)
        db.exec('COMMIT')
      } catch (err) {
        try { db.exec('ROLLBACK') } catch { /* */ }
        if (isUniqueViolation(err)) return json(res, 409, { error: 'slot_taken' })
        throw err
      }

      const updated = getStmt.get(id)
      const notification = await notifyWhatsApp({
        phone: b.phone,
        event: 'rescheduled',
        message: messages().reschedule({
          name: b.name, oldDate: b.date, oldTime: b.time, newDate: updated.date, newTime: updated.time,
        }),
      })
      return json(res, 200, { ok: true, booking: updated, previous: { date: b.date, time: b.time }, notification })
    }

    return json(res, 404, { error: 'not_found' })
  } catch (err) {
    console.error(err)
    return json(res, 500, { error: 'internal_error' })
  }
})

server.listen(PORT, () => {
  console.log(`Barbearia API on http://localhost:${PORT}`)
  console.log(`owner endpoints: ${OWNER_TOKEN ? 'enabled (OWNER_TOKEN set)' : 'disabled (set OWNER_TOKEN)'}`)
})

