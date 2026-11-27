// Notificação no WhatsApp do cliente — SEM Meta / SEM provedor.
//
// Abordagem (honesto): click-to-chat via wa.me.
// O backend, ao cancelar/remarcar, monta a MENSAGEM PRONTA e devolve `waLink`
// (https://wa.me/<numero-do-cliente>?text=<mensagem>). A guia do dono redireciona/abre
// o WhatsApp com o texto preenchido; o dono só toca em ENVIAR.
//
// NÃO é envio 100% automático. Não usa WhatsApp Business API / Meta. Sem credenciais.
// Se não houver telefone do cliente, não há link. Número deve ter consentido.

const BRAND = process.env.BARBERSHOP_NAME || 'Barbearia Raiz'

export function cleanPhone(raw) {
  if (!raw) return null
  let d = String(raw).replace(/\D/g, '').replace(/^0+/, '')
  if (!d) return null
  if (d.startsWith('55')) return d
  if (d.length === 10 || d.length === 11) return `55${d}` // DDD local -> +55 (Brasil)
  return d
}

export function waLink(phone, message) {
  const p = cleanPhone(phone)
  if (!p) return null
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`
}

export function messages() {
  return {
    cancel({ name, date, time }) {
      return `Olá ${name || ''}! Seu horário na ${BRAND} em ${date} às ${time} foi cancelado. Pedimos desculpas pelo inconveniente; é só responder aqui para reagendar.`.replace(/\s+/g, ' ').trim()
    },
    reschedule({ name, oldDate, oldTime, newDate, newTime }) {
      return `Olá ${name || ''}! Seu horário na ${BRAND} foi remarcado: de ${oldDate} ${oldTime} para ${newDate} às ${newTime}. Se não puder, responda aqui.`.replace(/\s+/g, ' ').trim()
    },
  }
}

// resultado serializável; NÃO lança (não derruba cancel/remarcação); NÃO loga segredos.
// mantém a chave `sent:false` honesta: nada foi enviado automaticamente.
export async function notifyWhatsApp({ phone, message, event }) {
  const to = cleanPhone(phone)
  const link = waLink(phone, message)
  return {
    event,
    mode: 'manual_wa.me',
    to: to || null,
    waLink: link,
    sent: false, // não enviado automaticamente; dono abre e clica em enviar
    reason: link ? 'wa_link_ready' : 'no_phone',
    message,
  }
}
