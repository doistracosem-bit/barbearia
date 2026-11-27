import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  SLOT_MINUTES,
  addBooking,
  dateKey,
  fetchTaken,
  isPastSlot,
  keyToDate,
  slotKey,
  slotsForDate,
  startOfDay,
  todayKey,
} from '../lib/bookings.js'

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

export default function BookingCalendar({ services = [] }) {
  const todayK = todayKey()
  const today = keyToDate(todayK) // hoje em Brasília
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [version, setVersion] = useState(0)
  const [booked, setBooked] = useState(() => new Set()) // do servidor
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', service: services[0]?.[0] || '' })
  const [status, setStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const cells = useMemo(() => buildMonthGrid(month.getFullYear(), month.getMonth()), [month])
  const slots = selectedDate ? slotsForDate(selectedDate) : []

  const rangeFrom = dateKey(new Date(month.getFullYear(), month.getMonth(), 1))
  const rangeTo = dateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0))

  // carrega horários tomados do servidor (mês visível + dia selecionado)
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const keys = await fetchTaken(rangeFrom, rangeTo)
        if (!cancelled) setBooked(keys)
      } catch {
        if (!cancelled) setBooked(new Set())
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
  const slotDisabled = (key, time) => slotTaken(key, time) || isPastSlot(key, time)

  function dayDisabled(key) {
    if (!key) return true
    if (startOfDay(keyToDate(key)).getTime() < today.getTime()) return true
    const ss = slotsForDate(key)
    if (ss.length === 0) return true
    return !ss.some((t) => !slotTaken(key, t) && !isPastSlot(key, t))
  }

  function selectDay(key) { setSelectedDate(key); setSelectedTime(null); setStatus(null) }
  const formatDay = (key) => { const d = keyToDate(key); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}` }

  async function onSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true); setStatus(null)
    const res = await addBooking({ date: selectedDate, time: selectedTime, name: form.name, phone: form.phone, service: form.service })
    if (res.ok) {
      setStatus({ type: 'ok', msg: `Horário reservado: ${formatDay(selectedDate)} às ${selectedTime}. Você receberá confirmação.` })
      setForm((f) => ({ ...f, name: '', phone: '' }))
      setSelectedTime(null)
      setVersion((v) => v + 1) // recarrega disponibilidade do servidor
    } else {
      setStatus({ type: 'err', msg: res.error })
      setVersion((v) => v + 1)
    }
    setSubmitting(false)
  }

  const canSubmit = !!selectedDate && !!selectedTime && form.name.trim().length > 0 && !submitting

  return (
    <div className="mx-auto max-w-[1078px]">
      <p className="mb-4 text-xs text-felt-gray">
        Horários de <strong className="font-semibold">{SLOT_MINUTES} min</strong>, dentro do funcionamento
        {' '}(<span className="text-inkstone">Seg–Sex 9h–19h, Sáb 8h–18h, Dom fechado</span> — exemplo).
        Cada horário só pode ser reservado uma vez. {loading ? 'Atualizando…' : ''}
      </p>

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
                            aria-label={`${formatDay(key)}${isToday ? ', hoje' : ''}${disabled ? ', indisponível' : ''}`}
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
          {!selectedDate ? (
            <p className="text-sm text-felt-gray">Escolha um dia disponível no calendário para ver os horários.</p>
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

              <div className="space-y-3">
                <div><label htmlFor="bk-name" className="mb-1 block text-xs text-felt-gray">Nome *</label>
                  <input id="bk-name" name="name" type="text" required autoComplete="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-none border border-black/20 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2" /></div>
                <div><label htmlFor="bk-phone" className="mb-1 block text-xs text-felt-gray">Telefone / WhatsApp</label>
                  <input id="bk-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-none border border-black/20 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2" /></div>
                {services.length > 0 && (
                  <div><label htmlFor="bk-service" className="mb-1 block text-xs text-felt-gray">Serviço</label>
                    <select id="bk-service" name="service" value={form.service} onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                      className="w-full rounded-none border border-black/20 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2">
                      {services.map(([name]) => <option key={name} value={name}>{name}</option>)}
                    </select></div>
                )}
              </div>

              {!selectedTime && slots.length > 0 && <p className="mt-3 text-xs text-felt-gray">Escolha um horário acima.</p>}
              <button type="submit" disabled={!canSubmit} className="btn-pill mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40">{submitting ? 'Reservando…' : 'Confirmar agendamento'}</button>
            </form>
          )}

          <div aria-live="polite" aria-atomic="true" className="mt-4">
            {status && <p role={status.type === 'err' ? 'alert' : 'status'} className="text-sm text-inkstone">{status.type === 'err' ? '⚠ ' : '✓ '}{status.msg}</p>}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs italic text-felt-gray">
        PLACEHOLDER: horários/funcionamento de exemplo. Com backend, <strong>não duplica horário entre clientes</strong> (UNIQUE no servidor). Aba do dono (depois) usa <code>GET /api/bookings</code> com token.
      </p>
    </div>
  )
}

