// Mensagens de aviso ao cliente (cancelamento/remarcação) para a prévia.
// Mesmo texto e mesmo formato de resposta de server/notify.js: o dono abre o wa.me e toca em enviar.
const BRAND = 'Barbearia Raiz'

export function avisoWhatsApp({ phone, event, name, date, time, oldDate, oldTime }) {
  const message = (event === 'cancelled'
    ? `Olá ${name || ''}! Seu horário na ${BRAND} em ${date} às ${time} foi cancelado. Pedimos desculpas pelo inconveniente; é só responder aqui para reagendar.`
    : `Olá ${name || ''}! Seu horário na ${BRAND} foi remarcado: de ${oldDate} ${oldTime} para ${date} às ${time}. Se não puder, responda aqui.`
  ).replace(/\s+/g, ' ').trim()
  const to = phone ? String(phone).replace(/\D/g, '') : null
  const waLink = to ? `https://wa.me/${to}?text=${encodeURIComponent(message)}` : null
  return { event, mode: 'manual_wa.me', to, waLink, sent: false, reason: waLink ? 'wa_link_ready' : 'no_phone', message }
}
