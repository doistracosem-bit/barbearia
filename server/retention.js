// Prazo de guarda das reservas (LGPD art. 15 e 16). O padrão vem de src/lib/empresa.js,
// o mesmo número que aparece na Política de privacidade; BOOKING_RETENTION_DAYS no .env sobrescreve.
import { db } from './db.js'
import { todayKey, dateKey, keyToDate } from './slots.js'
import { EMPRESA } from '../src/lib/empresa.js'

const fromEnv = Number(process.env.BOOKING_RETENTION_DAYS)
export const RETENTION_DAYS = Number.isFinite(fromEnv) && fromEnv >= 1 ? Math.floor(fromEnv) : EMPRESA.retencaoDias

// data (AAAA-MM-DD, Brasília) a partir da qual as reservas ficam; antes dela, apaga
export function retentionCutoff(today = todayKey(), days = RETENTION_DAYS) {
  const d = keyToDate(today)
  d.setDate(d.getDate() - days)
  return dateKey(d)
}

const purgeStmt = db.prepare('DELETE FROM bookings WHERE date < ?')

export function purgeOldBookings(today) {
  return Number(purgeStmt.run(retentionCutoff(today)).changes || 0)
}
