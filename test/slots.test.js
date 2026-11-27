// Rode com: npm test  (node:test, sem dependências)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isPastSlot, todayKey, zonedNow } from '../src/lib/slots.js'

// Instantes em UTC; Brasília = UTC-3 (sem horário de verão desde 2019).
const at = (iso) => new Date(iso)

test('servidor em UTC não recusa horário livre de Brasília', () => {
  // 12:30 UTC = 09:30 em Brasília. 10:00 ainda está livre.
  const now = at('2026-11-27T12:30:00Z')
  assert.equal(isPastSlot('2026-11-27', '10:00', now), false)
  assert.equal(isPastSlot('2026-11-27', '09:00', now), true)
})

test('perto da meia-noite em UTC o dia ainda é o de Brasília', () => {
  // 01:30 UTC do dia 28 = 22:30 do dia 27 em Brasília.
  const now = at('2026-11-28T01:30:00Z')
  assert.equal(todayKey(now), '2026-11-27')
  assert.deepEqual(zonedNow(now), { key: '2026-11-27', time: '22:30' })
  assert.equal(isPastSlot('2026-11-28', '09:00', now), false)
  assert.equal(isPastSlot('2026-11-27', '18:00', now), true)
})

test('horário que começa exatamente agora já conta como passado', () => {
  const now = at('2026-11-27T13:00:00Z') // 10:00 em Brasília
  assert.equal(isPastSlot('2026-11-27', '10:00', now), true)
  assert.equal(isPastSlot('2026-11-27', '11:00', now), false)
})

test('virada de mês e ano', () => {
  const now = at('2027-01-01T02:00:00Z') // 23:00 de 31/12 em Brasília
  assert.equal(todayKey(now), '2026-12-31')
  assert.equal(isPastSlot('2027-01-02', '09:00', now), false)
})

test('entrada inválida continua bloqueada', () => {
  const now = at('2026-11-27T12:00:00Z')
  assert.equal(isPastSlot('2026-02-30', '10:00', now), true)
  assert.equal(isPastSlot('2026-11-28', '9:00', now), true)
})
