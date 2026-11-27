import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

process.env.DATA_DIR = mkdtempSync(join(tmpdir(), 'barbearia-ret-'))
process.env.BOOKING_RETENTION_DAYS = '90'
const { db } = await import('../server/db.js')
const { purgeOldBookings, retentionCutoff, RETENTION_DAYS } = await import('../server/retention.js')

const ins = db.prepare('INSERT INTO bookings (id, date, time, name, phone, service, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')

test('corte é 90 dias antes de hoje', () => {
  assert.equal(RETENTION_DAYS, 90)
  assert.equal(retentionCutoff('2026-11-27'), '2026-08-29')
  assert.equal(retentionCutoff('2026-03-01', 1), '2026-02-28')
})

test('apaga só reservas com data anterior ao corte', () => {
  ins.run('velha', '2026-08-28', '10:00', 'Ana', '5511912345678', null, 'x')
  ins.run('limite', '2026-08-29', '10:00', 'Bia', '5511912345678', null, 'x')
  ins.run('futura', '2026-12-01', '10:00', 'Caio', '5511912345678', null, 'x')
  assert.equal(purgeOldBookings('2026-11-27'), 1)
  const ids = db.prepare('SELECT id FROM bookings ORDER BY id').all().map((r) => r.id)
  assert.deepEqual(ids, ['futura', 'limite'])
})
