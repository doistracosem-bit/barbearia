import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { dateKey, keyToDate, slotsForDate, todayKey } from '../lib/slots.js'

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const WEEKDAYS_LONG = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
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

// Calendário do dono: dias com agendamento marcados; clique filtra a lista.
export default function OwnerCalendar({ bookings = [], selectedDate, onSelect }) {
  const todayK = todayKey()
  const today = keyToDate(todayK) // hoje em Brasília
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const cells = useMemo(() => buildMonthGrid(month.getFullYear(), month.getMonth()), [month])

  const byDay = useMemo(() => {
    const m = new Map()
    for (const b of bookings) {
      if (!m.has(b.date)) m.set(b.date, [])
      m.get(b.date).push(b)
    }
    return m
  }, [bookings])

  const formatDay = (key) => { const d = keyToDate(key); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}` }

  return (
    <div aria-label="Calendário do dono">
      <div className="flex items-center justify-between gap-2">
        <button type="button" aria-label="Mês anterior"
          onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          className="grid h-8 w-8 place-items-center rounded-lg border border-black/15 text-inkstone hover:bg-black/5">
          <ChevronLeft size={15} aria-hidden="true" />
        </button>
        <p className="text-[13px] font-medium capitalize text-inkstone" aria-live="polite">{MONTHS[month.getMonth()]} {month.getFullYear()}</p>
        <button type="button" aria-label="Próximo mês"
          onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          className="grid h-8 w-8 place-items-center rounded-lg border border-black/15 text-inkstone hover:bg-black/5">
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>

      <table className="mt-3 w-full table-fixed border-collapse" role="grid"
        aria-label={`Agendamentos de ${MONTHS[month.getMonth()]} ${month.getFullYear()}`}>
        <thead>
          <tr>
            {WEEKDAYS.map((w, i) => (
              <th key={i} scope="col" className="pb-1.5 text-[10px] font-normal uppercase tracking-[0.08em] text-felt-gray">
                <span aria-hidden="true">{w}</span>
                <span className="sr-only">{WEEKDAYS_LONG[i]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: cells.length / 7 }).map((_, week) => (
            <tr key={week}>
              {cells.slice(week * 7, week * 7 + 7).map((key, i) => {
                if (!key) return <td key={`e-${week}-${i}`} className="p-1"><span aria-hidden="true" /></td>
                const count = (byDay.get(key) || []).length
                const capacity = slotsForDate(key).length
                const isSelected = key === selectedDate
                const isToday = key === todayK
                const closed = capacity === 0
                return (
                  <td key={key} className="p-1">
                    <button type="button" aria-pressed={isSelected} disabled={closed}
                      title={`${formatDay(key)}${count ? ` · ${count} agendamento(s)` : ''}${closed ? ' · fechado' : ''}`}
                      aria-label={`${formatDay(key)}, ${WEEKDAYS_LONG[keyToDate(key).getDay()]}${isToday ? ', hoje' : ''}${count ? `, ${count} agendamento(s)` : ', sem agendamentos'}${closed ? ', fechado' : `, ${capacity} horário(s)`}`}
                      onClick={() => onSelect(isSelected ? null : key)}
                      className={[
                        'relative flex h-11 w-full flex-col items-center justify-center rounded-lg text-[13px] tabular-nums transition-colors',
                        closed ? 'text-felt-gray line-through decoration-black/20' : 'text-inkstone hover:bg-black/5',
                        isSelected ? 'bg-inkstone text-white hover:bg-inkstone' : '',
                        isToday && !isSelected ? 'border border-inkstone' : '',
                        count ? 'font-semibold' : 'font-normal',
                      ].join(' ')}>
                      {keyToDate(key).getDate()}
                      {count > 0 && (
                        <span className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-inkstone'}`} aria-hidden="true" />
                      )}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-felt-gray">
        <span className="inline-flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-inkstone" aria-hidden="true" /> com agendamento</span>
        <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded border border-inkstone" aria-hidden="true" /> hoje</span>
        <span className="inline-flex items-center gap-1"><span className="line-through" aria-hidden="true">12</span> fechado</span>
      </div>

      {selectedDate && (
        <p className="mt-2 text-[11px] text-felt-gray">
          Filtrando <strong className="font-medium text-inkstone">{formatDay(selectedDate)}</strong> · {(byDay.get(selectedDate) || []).length} agendamento(s).{' '}
          <button type="button" className="underline underline-offset-2 hover:text-inkstone" onClick={() => onSelect(null)}>limpar</button>
        </p>
      )}
    </div>
  )
}

