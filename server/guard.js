// Proteções do POST /api/bookings: limite de requisições por IP e validação de campos.
// Sem dependências; estado em memória (zera ao reiniciar o servidor, o que é aceitável
// para uma barbearia com um único processo).

// ---------- limite de requisições (janela deslizante por chave) ----------
export function createRateLimiter({ windowMs, max }) {
  const hits = new Map() // chave -> [timestamps]

  function check(key, now = Date.now()) {
    const since = now - windowMs
    const list = (hits.get(key) || []).filter((t) => t > since)
    if (list.length >= max) {
      hits.set(key, list)
      const retryAfterMs = list[0] + windowMs - now
      return { ok: false, retryAfter: Math.max(1, Math.ceil(retryAfterMs / 1000)) }
    }
    list.push(now)
    hits.set(key, list)
    return { ok: true }
  }

  // limpeza periódica para o Map não crescer sem limite
  const timer = setInterval(() => {
    const since = Date.now() - windowMs
    for (const [k, list] of hits) {
      const kept = list.filter((t) => t > since)
      if (kept.length) hits.set(k, kept)
      else hits.delete(k)
    }
  }, Math.min(windowMs, 60_000))
  timer.unref?.()

  return { check }
}

// IP do cliente. Só confia em X-Forwarded-For se TRUST_PROXY=1 (atrás de um proxy/CDN);
// caso contrário qualquer um forjaria o cabeçalho para escapar do limite. Usa a ÚLTIMA
// entrada, que é a que o proxy acrescentou; as anteriores vêm do próprio cliente.
export function clientIp(req, trustProxy) {
  if (trustProxy) {
    const xff = String(req.headers['x-forwarded-for'] || '').split(',').map((s) => s.trim()).filter(Boolean).pop()
    if (xff) return xff
  }
  return req.socket?.remoteAddress || 'unknown'
}

// validação compartilhada com o frontend (mesmo arquivo)
export { NAME_MAX, SERVICE_MAX, normalizeBrPhone, cleanName, cleanService } from '../src/lib/validate.js'
