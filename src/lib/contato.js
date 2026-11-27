// Contato da barbearia: troque o número SÓ aqui.
// Formato: DDI + DDD + número, só dígitos (ex.: 5511987654321).
export const TELEFONE = '5516994215925'

const MENSAGEM_INICIAL = 'Olá, gostaria de agendar um horário'

export const WA = `https://wa.me/${TELEFONE}?text=${encodeURIComponent(MENSAGEM_INICIAL)}`
export const WA_SIMPLE = `https://wa.me/${TELEFONE}`
export const TEL = `tel:+${TELEFONE}`

// (11) 99999-9999 a partir dos dígitos acima
const local = TELEFONE.slice(2)
export const TELEFONE_EXIBICAO = `(${local.slice(0, 2)}) ${local.slice(2, -4)}-${local.slice(-4)}`
