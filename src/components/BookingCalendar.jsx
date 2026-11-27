import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  NAME_MAX,
  SLOT_MINUTES,
  addBooking,
  cleanName,
  dateKey,
  fetchTaken,
  isPastSlot,
  keyToDate,
  normalizeBrPhone,
  slotKey,
  slotsForDate,
  startOfDay,
  todayKey,
} from '../lib/bookings.js'
import { EMPRESA } from '../lib/empresa.js'
import { ROTAS_SITE } from '../legal/rotas.js'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const pad = (n) => String(n).padStart(2, '0')

function buildMonthGrid(year, month) {
  const startDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(dateKey(new Date(year, month, d)))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

// mensagem que o cliente manda para a barbearia confirmar o horário
function confirmLink(whatsapp, { date, time, name, service }) {
  if (!whatsapp) return null
  const d = keyToDate(date)
  const txt = `Olá! Acabei de reservar pelo site: ${pad(d.getDate())}/${pad(d.getMonth() + 1)} às ${time}${service ? `, ${service}` : ''}. Nome: ${name}. Podem confirmar?`
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(txt)}`
}

export default function BookingCalendar({ services = [], whatsapp = '', rotas = ROTAS_SITE }) {
  const todayK = todayKey()
  const today = keyToDate(todayK) // hoje em Brasília
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [version, setVersion] = useState(0)
  const [booked, setBooked] = useState(() => new Set()) // do servidor
  const [loading, setLoading] = useState(false)
  const [loadedRange, setLoadedRange] = useState(null) // intervalo com dados confirmados do servidor
  const [loadError, setLoadError] = useState(false)
  const [touched, setTouched] = useState({ name: false, phone: false, terms: false })
  const [form, setForm] = useState({ name: '', phone: '', service: services[0]?.[0] || '', terms: false })
  const [status, setStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const cells = useMemo(() => buildMonthGrid(month.getFullYear(), month.getMonth()), [month])
  const slots = selectedDate ? slotsForDate(selectedDate) : []

  const rangeFrom = dateKey(new Date(month.getFullYear(), month.getMonth(), 1))
  const rangeTo = dateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0))
  const rangeId = `${rangeFrom}|${rangeTo}`
  // sem resposta do servidor para este mês, nada aparece como livre
  const availabilityKnown = loadedRange === rangeId && !loadError

  // carrega horários tomados do servidor (mês visível + dia selecionado)
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const keys = await fetchTaken(rangeFrom, rangeTo)
        if (!cancelled) { setBooked(keys); setLoadedRange(`${rangeFrom}|${rangeTo}`); setLoadError(false) }
      } catch {
        if (!cancelled) setLoadError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [rangeFrom, rangeTo, version])

  // recarrega quando muda (esta aba / outras)
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1)
    window.addEventListener('bookings:changed', bump)
    window.addEventListener('storage', bump)
    return () => {
      window.removeEventListener('bookings:changed', bump)
      window.removeEventListener('storage', bump)
    }
  }, [])

  const slotTaken = (key, time) => booked.has(slotKey(key, time))
  const slotDisabled = (key, time) => !availabilityKnown || slotTaken(key, time) || isPastSlot(key, time)

  function dayDisabled(key) {
    if (!key) return true
    if (!availabilityKnown) return true
    if (startOfDay(keyToDate(key)).getTime() < today.getTime()) return true
    const ss = slotsForDate(key)
    if (ss.length === 0) return true
    return !ss.some((t) => !slotTaken(key, t) && !isPastSlot(key, t))
  }

  function selectDay(key) { setSelectedDate(key); setSelectedTime(null); setStatus(null) }
  const formatDay = (key) => { const d = keyToDate(key); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}` }

  const NAME_ERR = { name_required: 'Informe seu nome.', name_too_long: `Use no máximo ${NAME_MAX} caracteres.`, invalid_name: 'Informe um nome válido.' }
  const nameResult = cleanName(form.name)
  const nameCheck = nameResult.ok ? null : NAME_ERR[nameResult.error]
  const phoneCheck = !form.phone.trim()
    ? 'Informe seu WhatsApp com DDD.'
    : (normalizeBrPhone(form.phone) ? null : 'Use DDD + número, ex.: (11) 91234-5678.')

  const termsCheck = form.terms ? null : 'Marque esta opção para reservar.'

  async function onSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setTouched({ name: true, phone: true, terms: true })
    // leva o foco ao primeiro campo com erro (teclado e leitor de tela)
    const firstErr = nameCheck ? 'bk-name' : phoneCheck ? 'bk-phone' : termsCheck ? 'bk-terms' : null
    if (firstErr) { document.getElementById(firstErr)?.focus(); return }
    setSubmitting(true); setStatus(null)
    const res = await addBooking({ date: selectedDate, time: selectedTime, name: form.name, phone: form.phone, service: form.service })
    if (res.ok) {
      const b = res.booking
      setStatus({
        type: 'ok',
        msg: `Horário reservado: ${formatDay(selectedDate)} às ${selectedTime}. Para confirmar com a barbearia, envie a mensagem pelo WhatsApp.`,
        link: confirmLink(whatsapp, { date: b.date, time: b.time, name: b.name, service: b.service }),
      })
      setTouched({ name: false, phone: false, terms: false })
      setForm((f) => ({ ...f, name: '', phone: '', terms: false }))
      setSelectedTime(null)
      setVersion((v) => v + 1) // recarrega disponibilidade do servidor
    } else {
      setStatus({ type: 'err', msg: res.error })
      setVersion((v) => v + 1)
    }
    setSubmitting(false)
  }

  const canSubmit = availabilityKnown && !!selectedDate && !!selectedTime && !submitting
  const showNameErr = touched.name && nameCheck
  const showPhoneErr = touched.phone && phoneCheck
  const showTermsErr = touched.terms && termsCheck
  const externo = rotas.novaAba ? { target: '_blank', rel: 'noopener' } : {}
  const novaAba = rotas.novaAba ? <span className="sr-only"> (abre em nova aba)</span> : null

  return (
    <div className="mx-auto max-w-[1078px]">
      <p className="mb-4 text-xs text-felt-gray">
        Horários de <strong className="font-semibold">{SLOT_MINUTES} min</strong>, dentro do funcionamento
        {' '}(<span className="text-inkstone">Seg–Sex 9h–19h, Sáb 8h–18h, Dom fechado</span> — exemplo).
        Cada horário só pode ser reservado uma vez. {loading ? 'Atualizando…' : ''}
      </p>

      {loadError && (
        <div role="alert" className="mb-6 border border-black p-4 text-sm">
          <p className="font-semibold">Não conseguimos carregar a agenda agora.</p>
          <p className="mt-1 text-felt-gray">Para não marcar um horário que já está ocupado, a reserva pelo site fica pausada até a agenda voltar.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" className="btn-pill" onClick={() => setVersion((v) => v + 1)} disabled={loading}>
              {loading ? 'Tentando…' : 'Tentar de novo'}
            </button>
            {whatsapp && (
              <a className="btn-pill" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá, gostaria de agendar um horário')}`} target="_blank" rel="noopener">
                Agendar pelo WhatsApp
              </a>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
        {/* CALENDÁRIO */}
        <div className="rounded-none border border-black/15 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" className="inline-grid h-9 w-9 place-items-center rounded-none border border-current transition-opacity hover:opacity-60 disabled:opacity-30"
              aria-label="Mês anterior" onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              disabled={month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth()}>
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <p className="text-sm font-semibold capitalize" aria-live="polite">{MONTHS[month.getMonth()]} {month.getFullYear()}</p>
            <button type="button" className="inline-grid h-9 w-9 place-items-center rounded-none border border-current transition-opacity hover:opacity-60"
              aria-label="Próximo mês" onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>

          <table className="w-full table-fixed border-collapse" role="grid" aria-label={`Calendário de ${MONTHS[month.getMonth()]} ${month.getFullYear()}`}>
            <thead><tr>{WEEKDAYS.map((w) => <th key={w} scope="col" className="pb-2 text-[11px] font-normal text-felt-gray">{w}</th>)}</tr></thead>
            <tbody>
              {Array.from({ length: cells.length / 7 }).map((_, week) => (
                <tr key={week}>
                  {cells.slice(week * 7, week * 7 + 7).map((key, i) => {
                    const disabled = dayDisabled(key)
                    const isSelected = key && key === selectedDate
                    const isToday = key === todayK
                    return (
                      <td key={key ?? `e-${week}-${i}`} className="p-0.5">
                        {key ? (
                          <button type="button" disabled={disabled} aria-pressed={isSelected}
                            aria-label={`${keyToDate(key).getDate()} de ${MONTHS[keyToDate(key).getMonth()]}${isToday ? ', hoje' : ''}${disabled ? ', indisponível' : ''}`}
                            onClick={() => selectDay(key)}
                            className={['aspect-square w-full rounded-none text-sm tabular-nums transition-colors',
                              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                              disabled ? 'cursor-not-allowed text-ash-mist line-through' : 'hover:bg-black hover:text-white',
                              isSelected ? 'bg-black text-white hover:bg-black' : '',
                              isToday && !isSelected ? 'border border-current' : ''].join(' ')}>
                            {keyToDate(key).getDate()}
                          </button>
                        ) : <span aria-hidden="true" />}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* HORÁRIOS + FORM */}
        <div className="rounded-none border border-black/15 p-4 sm:p-5">
          {!availabilityKnown && !loadError ? (
            <p className="text-sm text-felt-gray">Carregando horários disponíveis…</p>
          ) : !selectedDate ? (
            <p className="text-sm text-felt-gray">{loadError ? 'Agenda indisponível no momento.' : 'Escolha um dia disponível no calendário para ver os horários.'}</p>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <h3 className="mb-3 text-lg font-normal"><time dateTime={selectedDate}>{formatDay(selectedDate)}</time> — horários ({SLOT_MINUTES}min)</h3>
              {slots.length === 0 ? <p className="text-sm text-felt-gray">Sem horários neste dia.</p> : (
                <ul className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {slots.map((t) => {
                    const taken = slotTaken(selectedDate, t); const past = isPastSlot(selectedDate, t); const disabled = slotDisabled(selectedDate, t); const isSel = t === selectedTime
                    return (
                      <li key={t}>
                        <button type="button" disabled={disabled} aria-pressed={isSel} aria-label={`${t}${taken ? ', já reservado' : ''}${past ? ', já passou' : ''}`}
                          onClick={() => { setSelectedTime(t); setStatus(null) }}
                          className={['w-full rounded-none border px-2 py-2 text-sm tabular-nums transition-colors',
                            disabled ? 'cursor-not-allowed border-black/10 text-ash-mist line-through' : 'border-black hover:bg-black hover:text-white',
                            isSel ? 'bg-black text-white hover:bg-black' : ''].join(' ')}>
                          {t}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}

              <p className="mb-2 text-xs text-felt-gray">Campos com * são obrigatórios.</p>
              <div className="space-y-3">
                <div><label htmlFor="bk-name" className="mb-1 block text-xs text-felt-gray">Nome *</label>
                  <input id="bk-name" name="name" type="text" required maxLength={NAME_MAX} autoComplete="name" value={form.name}
                    aria-invalid={showNameErr ? 'true' : undefined} aria-describedby={showNameErr ? 'bk-name-err' : undefined}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    className={`w-full rounded-none border bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 ${showNameErr ? 'border-black' : 'border-black/50'}`} />
                  {showNameErr && <p id="bk-name-err" className="mt-1 text-xs text-inkstone">⚠ {nameCheck}</p>}</div>
                <div><label htmlFor="bk-phone" className="mb-1 block text-xs text-felt-gray">WhatsApp com DDD *</label>
                  <input id="bk-phone" name="phone" type="tel" required maxLength={20} autoComplete="tel" inputMode="tel" placeholder="(11) 91234-5678" value={form.phone}
                    aria-invalid={showPhoneErr ? 'true' : undefined} aria-describedby={showPhoneErr ? 'bk-phone-err' : undefined}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    className={`w-full rounded-none border bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 ${showPhoneErr ? 'border-black' : 'border-black/50'}`} />
                  {showPhoneErr && <p id="bk-phone-err" className="mt-1 text-xs text-inkstone">⚠ {phoneCheck}</p>}</div>
                {services.length > 0 && (
                  <div><label htmlFor="bk-service" className="mb-1 block text-xs text-felt-gray">Serviço</label>
                    <select id="bk-service" name="service" value={form.service} onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                      className="w-full rounded-none border border-black/50 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2">
                      {services.map(([name]) => <option key={name} value={name}>{name}</option>)}
                    </select></div>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-start gap-3">
                  <input id="bk-terms" name="terms" type="checkbox" checked={form.terms} required
                    aria-invalid={showTermsErr ? 'true' : undefined} aria-describedby={showTermsErr ? 'bk-terms-err' : undefined}
                    onChange={(e) => setForm((f) => ({ ...f, terms: e.target.checked }))}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-black" />
                  <label htmlFor="bk-terms" className="cursor-pointer text-sm leading-snug">
                    Tenho 18 anos ou mais (ou sou o responsável por quem vai ser atendido) e li os{' '}
                    <a href={rotas.termos} {...externo} className="underline underline-offset-2">Termos de uso{novaAba}</a>. *
                  </label>
                </div>
                {showTermsErr && <p id="bk-terms-err" className="mt-1 text-xs text-inkstone">⚠ {termsCheck}</p>}
              </div>

              <p id="bk-privacidade" className="mt-3 text-xs leading-relaxed text-felt-gray">
                Usamos seu nome e WhatsApp só para este agendamento: confirmar, remarcar ou avisar se algo mudar.
                Nada de propaganda. A reserva é apagada {EMPRESA.retencaoDias} dias depois do atendimento.
                Saiba mais na <a href={rotas.privacidade} {...externo} className="underline underline-offset-2">Política de privacidade{novaAba}</a>.
              </p>

              {!selectedTime && slots.length > 0 && <p className="mt-3 text-xs text-felt-gray">Escolha um horário acima.</p>}
              <button type="submit" disabled={!canSubmit} aria-describedby="bk-privacidade" className="btn-pill mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40">{submitting ? 'Reservando…' : 'Confirmar agendamento'}</button>
            </form>
          )}

          <div aria-live="polite" aria-atomic="true" className="mt-4">
            {status && <p role={status.type === 'err' ? 'alert' : 'status'} className="text-sm text-inkstone">{status.type === 'err' ? '⚠ ' : '✓ '}{status.msg}</p>}
            {status?.link && (
              <a className="btn-pill mt-3 w-full" href={status.link} target="_blank" rel="noopener">Confirmar pelo WhatsApp</a>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs italic text-felt-gray">
        Cada horário só aceita uma reserva. Horários de funcionamento de exemplo.
      </p>
    </div>
  )
}

