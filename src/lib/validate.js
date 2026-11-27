// Validação de agendamento compartilhada entre frontend e servidor (server/guard.js).
// Funções puras, sem dependências.

export const NAME_MAX = 80
export const SERVICE_MAX = 80

// ---------- validação ----------
// Telefone brasileiro: DDD + número (10 ou 11 dígitos), com ou sem +55.
// Devolve só dígitos com 55 na frente (pronto para wa.me) ou null se inválido.
export function normalizeBrPhone(raw) {
  let d = String(raw ?? '').replace(/\D/g, '').replace(/^0+/, '')
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2)
  if (d.length !== 10 && d.length !== 11) return null
  const ddd = Number(d.slice(0, 2))
  if (ddd < 11 || ddd > 99 || d[1] === '0') return null // DDDs válidos: 11–99, nunca terminam em 0
  if (d.length === 11 && d[2] !== '9') return null // celular com 11 dígitos começa com 9
  if (/^(\d)\1+$/.test(d.slice(2))) return null // 99999999, 00000000…
  return `55${d}`
}

// Nome: tira caracteres de controle, junta espaços, exige 2+ letras e respeita o máximo.
export function cleanName(raw) {
  const s = String(raw ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!s) return { ok: false, error: 'name_required' }
  if (s.length > NAME_MAX) return { ok: false, error: 'name_too_long' }
  if ((s.match(/\p{L}/gu) || []).length < 2) return { ok: false, error: 'invalid_name' }
  return { ok: true, value: s }
}

export function cleanService(raw) {
  const s = String(raw ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!s) return { ok: true, value: null }
  if (s.length > SERVICE_MAX) return { ok: false, error: 'invalid_service' }
  return { ok: true, value: s }
}
