import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays, ChevronRight, Clock, Download, LayoutGrid, LogOut, MessageCircle,
  RefreshCw, Scissors, Settings, Users,
} from 'lucide-react'
import { cancelBooking, listBookings, rescheduleBooking } from './lib/bookings.js'
import { dateKey, keyToDate, slotsForDate, todayKey } from './lib/slots.js'
import OwnerCalendar from './components/OwnerCalendar.jsx'

const API = (import.meta.env?.VITE_API_URL) || 'http://localhost:3001'
const TOKEN_KEY = 'barbearia-raiz.ownerToken'
const pad = (n) => String(n).padStart(2, '0')

const WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const WD_LONG = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

const NAV = [
  { id: 'visao', label: 'Visão geral', icon: LayoutGrid },
  { id: 'hoje', label: 'Hoje', icon: CalendarDays },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'config', label: 'Configurações', icon: Settings },
]

const shortDate = (key) => { const d = keyToDate(key); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}` }
const longDate = (key) => {
  const d = keyToDate(key)
  return `${WD_LONG[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`
}
const dayDiff = (key, base) => Math.round((keyToDate(key) - keyToDate(base)) / 86400000)
function relativeDay(key, base) {
  const diff = dayDiff(key, base)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  if (diff > 1) return `Em ${diff} dias`
  if (diff === -1) return 'Ontem'
  return `${Math.abs(diff)} dias atrás`
}
const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0] || '').join('').toUpperCase()

function downloadCsv(rows, name) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const head = ['data', 'hora', 'cliente', 'telefone', 'servico', 'minutos']
  const body = rows.map((b) => [b.date, b.time, b.name, b.phone || '', b.service || '', b.slot_minutes || 60].map(esc).join(','))
  const csv = [head.join(','), ...body].join('\r\n')
  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/* ------------------------------------------------------------------ */

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-inkstone text-white">
        <Scissors size={15} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold leading-none text-inkstone">Barbearia Raiz</span>
        <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-felt-gray">Painel do dono</span>
      </span>
    </div>
  )
}

function Card({ title, hint, action, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`rounded-2xl border border-black/10 bg-white p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[13px] font-medium leading-tight text-inkstone">{title}</h2>
          {hint && <p className="mt-0.5 text-[11px] leading-snug text-felt-gray">{hint}</p>}
        </div>
        {action}
      </div>
      <div className={`mt-3 ${bodyClassName}`}>{children}</div>
    </section>
  )
}

function NotificationBanner({ notification, onClose }) {
  if (!notification) return null
  return (
    <div className="mb-4 rounded-2xl bg-inkstone p-4 text-white" role="status">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Mensagem pronta no WhatsApp do cliente</p>
          <p className="mt-1 text-[11px] text-white/60">
            Modo <code>{notification.mode}</code> · envio automático: <strong>não</strong> ({notification.reason})
            {!notification.to && ' · sem telefone do cliente'}
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-[11px] text-white/70 hover:bg-white/10 hover:text-white">Fechar</button>
      </div>
      {notification.message && (
        <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/10 p-3 text-[13px] leading-relaxed">{notification.message}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {notification.waLink
          ? <a className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[13px] font-medium text-inkstone hover:opacity-90" href={notification.waLink} target="_blank" rel="noopener"><MessageCircle size={14} aria-hidden="true" /> Abrir WhatsApp e enviar</a>
          : <span className="text-[11px] text-white/60">Sem telefone — não há link.</span>}
      </div>
    </div>
  )
}

function RescheduleForm({ booking, token, onDone, onCancel }) {
  const [date, setDate] = useState(booking.date)
  const [time, setTime] = useState('')
  const [busy, setBusy] = useState(false)
  const slots = useMemo(() => slotsForDate(date), [date])

  async function submit(e) {
    e.preventDefault()
    if (!time || busy) return
    setBusy(true)
    const res = await rescheduleBooking(booking.id, { date, time }, token)
    setBusy(false)
    onDone(res)
  }

  return (
    <form onSubmit={submit} className="mt-3 grid gap-3 rounded-xl border border-black/10 bg-black/[0.02] p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]">
      <label className="text-[11px] text-felt-gray">Nova data
        <input type="date" value={date} min={todayKey()} onChange={(e) => { setDate(e.target.value); setTime('') }}
          className="mt-1 w-full rounded-lg border border-black/15 bg-white px-2 py-1.5 text-[13px] text-inkstone" />
      </label>
      <label className="text-[11px] text-felt-gray">Novo horário (1h)
        <select value={time} onChange={(e) => setTime(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/15 bg-white px-2 py-1.5 text-[13px] text-inkstone">
          <option value="">—</option>
          {slots.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <button type="submit" disabled={!time || busy}
        className="self-end rounded-lg bg-inkstone px-3 py-2 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-40">
        {busy ? 'Salvando…' : 'Remarcar'}
      </button>
      <button type="button" onClick={onCancel}
        className="self-end rounded-lg border border-black/15 px-3 py-2 text-[13px] text-inkstone hover:bg-black/5">
        Cancelar
      </button>
    </form>
  )
}

function RowActions({ booking, onReschedule, onCancel, open }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button type="button" aria-expanded={open} onClick={() => onReschedule(booking.id)}
        className="rounded-lg border border-black/15 px-2.5 py-1.5 text-[12px] text-inkstone hover:bg-black/5">
        Remarcar
      </button>
      <button type="button" onClick={() => onCancel(booking)}
        className="rounded-lg border border-black/15 px-2.5 py-1.5 text-[12px] text-inkstone hover:bg-inkstone hover:text-white">
        Cancelar
      </button>
    </div>
  )
}

function StatusBadge({ date, today }) {
  const diff = dayDiff(date, today)
  const label = diff === 0 ? 'Hoje' : diff === 1 ? 'Amanhã' : `Em ${diff} dias`
  const tone = diff === 0 ? 'bg-inkstone text-white' : 'border border-black/15 text-felt-gray'
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${tone}`}>{label}</span>
}

/* ------------------------------------------------------------------ */

export default function Owner() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '')
  const [tokenInput, setTokenInput] = useState(token)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [rescheduleId, setRescheduleId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [view, setView] = useState('visao')
  const [version, setVersion] = useState(0)
  const [lastLoadedAt, setLastLoadedAt] = useState(null)

  const today = todayKey()

  async function load() {
    if (!token) return
    setLoading(true); setError(null)
    const res = await listBookings(token)
    if (res.ok) { setBookings(res.bookings || []); setLastLoadedAt(new Date()) }
    else { setBookings([]); setError(res.error || 'Não autorizado / erro.') }
    setLoading(false)
  }

  useEffect(() => { load() }, [token, version]) // eslint-disable-line

  function saveToken() {
    const t = tokenInput.trim()
    if (!t) return
    sessionStorage.setItem(TOKEN_KEY, t)
    setToken(t); setVersion((v) => v + 1)
  }
  function logout() {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(''); setTokenInput(''); setBookings([]); setView('visao')
  }

  async function onCancel(b) {
    if (!window.confirm(`Cancelar o horário de ${b.name} em ${b.date} às ${b.time}? O cliente será avisado (você envia no WhatsApp).`)) return
    const res = await cancelBooking(b.id, token)
    if (res.ok) {
      setNotice(res.notification)
      setVersion((v) => v + 1)
      if (res.notification?.waLink) window.open(res.notification.waLink, '_blank', 'noopener')
    } else setError(res.error || 'Falha ao cancelar.')
  }

  function onRescheduled(res) {
    if (res.ok) {
      setNotice(res.notification)
      setRescheduleId(null)
      setVersion((v) => v + 1)
      if (res.notification?.waLink) window.open(res.notification.waLink, '_blank', 'noopener')
    } else setError(res.error || 'Falha ao remarcar.')
  }

  const sorted = useMemo(() => [...bookings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)), [bookings])
  const filtered = useMemo(() => (selectedDate ? sorted.filter((b) => b.date === selectedDate) : sorted), [sorted, selectedDate])
  const todayList = useMemo(() => sorted.filter((b) => b.date === today), [sorted, today])
  const upcoming = useMemo(() => sorted.filter((b) => b.date >= today), [sorted, today])

  const week = useMemo(() => {
    const start = keyToDate(today)
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
      const key = dateKey(d)
      const cap = slotsForDate(key).length
      const taken = bookings.filter((b) => b.date === key).length
      return { key, wd: WD[d.getDay()], taken, cap, pct: cap ? Math.round((taken / cap) * 100) : 0 }
    })
  }, [bookings, today])

  const month = useMemo(() => {
    const d = keyToDate(today)
    const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    let cap = 0, taken = 0
    for (let i = 1; i <= days; i++) {
      const key = dateKey(new Date(d.getFullYear(), d.getMonth(), i))
      cap += slotsForDate(key).length
      taken += bookings.filter((b) => b.date === key).length
    }
    return { taken, cap, pct: cap ? Math.round((taken / cap) * 100) : 0 }
  }, [bookings, today])

  const clients = useMemo(() => {
    const m = new Map()
    for (const b of sorted) {
      const k = (b.phone || b.name || '').trim().toLowerCase()
      const c = m.get(k)
      if (c) { c.count += 1; c.last = b.date }
      else m.set(k, { name: b.name, phone: b.phone, count: 1, next: b.date, last: b.date })
    }
    return [...m.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [sorted])

  const todayLong = longDate(today)

  /* ---------------- gate ---------------- */
  if (!token) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#e7e7e7] p-4">
        <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6">
          <Logo />
          <h1 className="mt-6 text-xl font-semibold leading-tight text-inkstone">Acesso do dono</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-felt-gray">Informe o segredo do servidor para abrir o painel de agendamentos.</p>
          <form onSubmit={(e) => { e.preventDefault(); saveToken() }}>
            <label htmlFor="owner-token" className="mt-5 block text-[10px] uppercase tracking-[0.14em] text-felt-gray">OWNER_TOKEN</label>
            <input id="owner-token" type="password" autoComplete="off" value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)} placeholder="segredo do servidor"
              className="mt-1.5 w-full rounded-lg border border-black/15 px-3 py-2 text-sm text-inkstone placeholder:text-black/35" />
            <button type="submit" className="mt-3 w-full rounded-lg bg-inkstone px-4 py-2.5 text-sm font-medium text-white hover:opacity-90">Entrar</button>
          </form>
          <p className="mt-4 text-[11px] leading-relaxed text-felt-gray">
            O servidor precisa rodar com <code>OWNER_TOKEN</code> (sem ele: <code>503</code>; valor errado: <code>401</code>). O token fica só no <code>sessionStorage</code>.
          </p>
        </div>
      </div>
    )
  }

  const title = view === 'visao' ? 'Olá, dono' : NAV.find((n) => n.id === view)?.label
  const subtitle = view === 'visao'
    ? `${todayList.length} agendamento(s) hoje · ${upcoming.length} de hoje em diante`
    : view === 'hoje'
      ? `${todayLong} · ${todayList.length} agendamento(s)`
      : view === 'clientes'
        ? `${clients.length} cliente(s) na base`
        : 'Sessão, servidor e limites honestos'

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-inkstone">
      {/* sidebar */}
      <aside className="hidden h-screen w-[264px] shrink-0 flex-col overflow-y-auto border-r border-black/10 bg-white px-4 py-6 md:flex">
          <div className="px-2"><Logo /></div>

          <p className="mt-8 px-2 text-[10px] uppercase tracking-[0.14em] text-felt-gray">Menu</p>
          <nav className="mt-2 grid gap-1" aria-label="Navegação do painel">
            {NAV.map(({ id, label, icon: Icon }) => {
              const active = view === id
              const count = id === 'hoje' ? todayList.length : id === 'clientes' ? clients.length : 0
              return (
                <button key={id} type="button" onClick={() => setView(id)} aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors ${active ? 'bg-inkstone text-white' : 'text-felt-gray hover:bg-black/5 hover:text-inkstone'}`}>
                  <Icon size={15} aria-hidden="true" className="shrink-0" />
                  <span className="truncate">{label}</span>
                  {count > 0 && (
                    <span className={`ml-auto rounded-full px-1.5 text-[10px] tabular-nums ${active ? 'bg-white/15 text-white' : 'bg-black/5 text-felt-gray'}`}>{count}</span>
                  )}
                </button>
              )
            })}
          </nav>

          <p className="mt-8 px-2 text-[10px] uppercase tracking-[0.14em] text-felt-gray">Canais</p>
          <div className="mt-2 grid gap-1">
            <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-felt-gray">
              <MessageCircle size={15} aria-hidden="true" className="shrink-0" />
              <span className="truncate">WhatsApp</span>
              <span className="ml-auto rounded-full bg-black/5 px-1.5 text-[10px] text-felt-gray">manual</span>
            </div>
            <a href="/#agendar" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-felt-gray hover:bg-black/5 hover:text-inkstone">
              <CalendarDays size={15} aria-hidden="true" className="shrink-0" />
              <span className="truncate">Agenda pública</span>
              <ChevronRight size={13} aria-hidden="true" className="ml-auto shrink-0" />
            </a>
          </div>

          <div className="mt-auto grid gap-1 border-t border-black/10 pt-4">
            <a href="/" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-felt-gray hover:bg-black/5 hover:text-inkstone">
              <ChevronRight size={15} aria-hidden="true" /> Ver landing page
            </a>
            <button type="button" onClick={logout}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-felt-gray hover:bg-black/5 hover:text-inkstone">
              <LogOut size={15} aria-hidden="true" /> Sair
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* topo mobile */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 py-3 md:hidden">
            <Logo />
            <button type="button" onClick={logout} className="rounded-lg border border-black/15 px-2.5 py-1.5 text-[12px] text-inkstone">Sair</button>
          </div>
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-black/10 px-3 py-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Navegação do painel">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setView(id)} aria-current={view === id ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] ${view === id ? 'bg-inkstone text-white' : 'text-felt-gray hover:bg-black/5'}`}>
                <Icon size={14} aria-hidden="true" /> {label}
              </button>
            ))}
          </nav>

          <header className="shrink-0 border-b border-black/10 bg-white px-4 py-3 md:px-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.14em] text-felt-gray">{todayLong}</p>
                <h1 className="mt-1 text-[clamp(1.4rem,2.4vw,1.9rem)] font-semibold leading-tight tracking-tight text-inkstone">{title}</h1>
                <p className="mt-1 text-[13px] text-felt-gray">{subtitle}</p>
              </div>
              <button type="button" onClick={() => setVersion((v) => v + 1)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-black/15 px-3 py-2 text-[13px] text-inkstone hover:bg-black/5">
                <RefreshCw size={14} aria-hidden="true" className={loading ? 'animate-spin' : ''} /> Atualizar
              </button>
            </div>
          </header>

          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-6">

            {error && (
              <div role="alert" className="mt-4 rounded-xl border border-black/15 bg-black/[0.03] p-3 text-[13px] text-inkstone">
                <p className="font-medium">⚠ {error}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-felt-gray">
                  A landing usa o <strong>mesmo backend</strong>. Confira: backend no ar em <code>{API}</code>;
                  servidor iniciado com <code>OWNER_TOKEN=&lt;segredo&gt;</code>; token digitado aqui igual ao do servidor; agendamentos no mesmo <code>server/data/bookings.db</code>.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setVersion((v) => v + 1)} className="rounded-lg border border-black/15 px-3 py-1.5 text-[12px] hover:bg-black/5">Tentar de novo</button>
                  <button type="button" onClick={logout} className="rounded-lg border border-black/15 px-3 py-1.5 text-[12px] hover:bg-black/5">Trocar token</button>
                </div>
              </div>
            )}

            {notice && <div className="mt-4"><NotificationBanner notification={notice} onClose={() => setNotice(null)} /></div>}

            {/* -------- visão geral -------- */}
            {view === 'visao' && (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* card escuro */}
                  <section className="rounded-2xl bg-inkstone p-4 text-white">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-[13px] font-medium text-white/75">Visão geral</h2>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70" aria-live="polite">
                        {loading ? 'atualizando…' : error ? 'sem conexão' : `conectado · ${API.replace(/^https?:\/\//, '')}`}
                      </span>
                    </div>
                    <p className="mt-3 text-[44px] font-light leading-none tabular-nums">{sorted.length}</p>
                    <p className="mt-1 text-[11px] text-white/60">
                      agendamentos ativos
                      {lastLoadedAt && !error && <span className="block text-white/55">atualizado às {pad(lastLoadedAt.getHours())}:{pad(lastLoadedAt.getMinutes())}</span>}
                    </p>
                    <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-white/55">Hoje</dt>
                        <dd className="mt-0.5 text-lg font-medium tabular-nums">{todayList.length}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-white/55">Clientes</dt>
                        <dd className="mt-0.5 text-lg font-medium tabular-nums">{clients.length}</dd>
                      </div>
                    </dl>
                  </section>

                  {/* semana */}
                  <Card title="Ocupação da semana" hint={`${week.reduce((s, d) => s + d.taken, 0)} horário${week.reduce((s, d) => s + d.taken, 0) === 1 ? '' : 's'} nos próximos 7 dias`}>
                    <div role="img" aria-label={week.map((d) => `${d.wd}: ${d.pct}%`).join(', ')}>
                      <div className="flex h-24 items-end gap-1.5">
                        {week.map((d) => (
                          <div key={d.key} className="flex h-full flex-1 items-end overflow-hidden rounded-md bg-black/5" title={`${shortDate(d.key)} · ${d.taken}/${d.cap} horários`}>
                            {d.taken > 0 && (
                              <div className="w-full rounded-md bg-inkstone" style={{ height: `${Math.max(12, d.pct)}%` }} />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-1.5 flex gap-1.5">
                        {week.map((d) => (
                          <span key={d.key} className="flex-1 text-center text-[10px] leading-tight text-felt-gray">
                            {d.wd}
                            <span className={`block tabular-nums ${d.taken ? 'font-semibold text-inkstone' : 'text-felt-gray'}`}>{d.taken}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-felt-gray">
                      Média de <strong className="font-medium text-inkstone">{Math.round(week.reduce((s, d) => s + d.pct, 0) / 7)}%</strong> de ocupação
                    </p>
                  </Card>

                  {/* mês */}
                  <Card title="Ocupação do mês" hint={`${month.taken} de ${month.cap} horários`} className="sm:col-span-2 lg:col-span-1">
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-[40px] font-light leading-none tabular-nums text-inkstone">{month.pct}<span className="text-lg">%</span></p>
                      <p className="pb-1 text-right text-[11px] leading-snug text-felt-gray">
                        {month.cap - month.taken} horários<br />livres no mês
                      </p>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/10">
                      <div className="h-full rounded-full bg-inkstone" style={{ width: `${Math.min(100, month.pct)}%` }} />
                    </div>
                    <p className="mt-2 text-[11px] text-felt-gray">Confirmados sobre os horários de funcionamento do mês.</p>
                  </Card>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.15fr]">
                  <Card title="Calendário" hint="Clique num dia para filtrar a lista"
                    action={selectedDate && (
                      <button type="button" onClick={() => setSelectedDate(null)} className="rounded-lg border border-black/15 px-2 py-1 text-[11px] text-inkstone hover:bg-black/5">Ver todos</button>
                    )}>
                    <OwnerCalendar bookings={sorted} selectedDate={selectedDate} onSelect={setSelectedDate} />
                  </Card>

                  <Card title="Em andamento" hint={selectedDate ? `Filtrado por ${shortDate(selectedDate)}` : 'Próximos agendamentos'}
                    className="flex flex-col"
                    bodyClassName="flex flex-1 flex-col"
                    action={<span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] text-felt-gray">{filtered.length}</span>}>
                    {filtered.length === 0 ? (
                      <p className="py-6 text-center text-[13px] text-felt-gray">
                        {selectedDate ? 'Nenhum agendamento neste dia.' : 'Nenhum agendamento.'}
                      </p>
                    ) : (
                      <ul className="grid gap-1.5">
                        {filtered.slice(0, 5).map((b) => (
                          <li key={b.id}>
                            <div className="flex items-center gap-3 rounded-xl border border-black/10 px-3 py-2.5">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/5 text-[11px] font-medium text-inkstone">{initials(b.name)}</span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-inkstone">{b.name}</p>
                                <p className="truncate text-[11px] text-felt-gray">
                                  {relativeDay(b.date, today)} · {b.time} · {b.service || 'serviço'}
                                </p>
                              </div>
                              <StatusBadge date={b.date} today={today} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <a href="/#agendar" className="mt-auto flex items-center justify-between rounded-xl border border-black/10 px-3 py-2 text-[12px] text-felt-gray hover:bg-black/5 hover:text-inkstone">
                      Abrir agenda pública <ChevronRight size={14} aria-hidden="true" />
                    </a>
                  </Card>
                </div>

                {/* lista completa */}
                <section className="mt-3 rounded-2xl border border-black/10 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-[13px] font-medium text-inkstone">Últimos agendamentos</h2>
                      <p className="mt-0.5 text-[11px] text-felt-gray">{selectedDate ? `Filtrado por ${shortDate(selectedDate)} · ${filtered.length} de ${sorted.length}` : `${sorted.length} no total`}</p>
                    </div>
                    {selectedDate && (
                      <button type="button" onClick={() => setSelectedDate(null)} className="rounded-lg border border-black/15 px-2 py-1 text-[11px] text-inkstone hover:bg-black/5">Limpar filtro</button>
                    )}
                    <button type="button" onClick={() => downloadCsv(filtered, `agendamentos-${today}`)} disabled={filtered.length === 0}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-black/15 px-2.5 py-1.5 text-[11px] text-inkstone hover:bg-black/5 disabled:opacity-40">
                      <Download size={13} aria-hidden="true" /> Baixar CSV
                    </button>
                  </div>

                  {sorted.length === 0 ? (
                    <p className="py-8 text-center text-[13px] text-felt-gray">Nenhum agendamento ainda. Quando um cliente agendar, aparece aqui.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-black/10">
                      {filtered.map((b) => (
                        <li key={b.id} className="py-2.5">
                          <div className="grid grid-cols-2 items-center gap-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                            <div className="col-span-2 flex min-w-0 items-center gap-2.5 lg:col-span-1">
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/5 text-[10px] font-medium text-inkstone">{initials(b.name)}</span>
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-medium text-inkstone">{b.name}</p>
                                <p className="truncate text-[11px] text-felt-gray">{b.phone || 'sem telefone'}</p>
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[12px] text-inkstone">
                                <time dateTime={`${b.date}T${b.time}`}>{shortDate(b.date)} · {b.time}</time>
                              </p>
                              <p className="text-[11px] text-felt-gray">{b.slot_minutes || 60} min</p>
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[12px] text-inkstone">{b.service || '—'}</p>
                            </div>
                            <div className="col-span-2 flex items-center justify-between gap-2 lg:col-span-1 lg:justify-end">
                              <StatusBadge date={b.date} today={today} />
                              <RowActions booking={b} open={rescheduleId === b.id} onReschedule={(id) => setRescheduleId(rescheduleId === id ? null : id)} onCancel={onCancel} />
                            </div>
                          </div>
                          {rescheduleId === b.id && (
                            <RescheduleForm booking={b} token={token} onDone={onRescheduled} onCancel={() => setRescheduleId(null)} />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            )}

            {/* -------- hoje -------- */}
            {view === 'hoje' && (
              <section className="mt-5 rounded-2xl border border-black/10 bg-white p-4">
                <h2 className="text-[13px] font-medium text-inkstone">Agenda de hoje</h2>
                <p className="mt-0.5 text-[11px] text-felt-gray">{todayLong}</p>
                {todayList.length === 0 ? (
                  <p className="py-10 text-center text-[13px] text-felt-gray">Nada marcado para hoje.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-black/10">
                    {todayList.map((b) => (
                      <li key={b.id} className="py-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black/5 text-[11px] font-medium text-inkstone">{initials(b.name)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-inkstone">{b.name} <span className="font-normal text-felt-gray">· {b.time}</span></p>
                            <p className="truncate text-[11px] text-felt-gray">{b.service || 'serviço'} · {b.phone || 'sem telefone'}</p>
                          </div>
                          <RowActions booking={b} open={rescheduleId === b.id} onReschedule={(id) => setRescheduleId(rescheduleId === id ? null : id)} onCancel={onCancel} />
                        </div>
                        {rescheduleId === b.id && (
                          <RescheduleForm booking={b} token={token} onDone={onRescheduled} onCancel={() => setRescheduleId(null)} />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* -------- clientes -------- */}
            {view === 'clientes' && (
              <section className="mt-5 rounded-2xl border border-black/10 bg-white p-4">
                <h2 className="text-[13px] font-medium text-inkstone">Clientes</h2>
                <p className="mt-0.5 text-[11px] text-felt-gray">Agrupados por telefone (ou nome, quando não há telefone).</p>
                {clients.length === 0 ? (
                  <p className="py-10 text-center text-[13px] text-felt-gray">Nenhum cliente ainda.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-black/10">
                    {clients.map((c) => (
                      <li key={(c.phone || c.name) + c.next} className="flex flex-wrap items-center gap-3 py-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/5 text-[10px] font-medium text-inkstone">{initials(c.name)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-inkstone">{c.name}</p>
                          <p className="truncate text-[11px] text-felt-gray">{c.phone || 'sem telefone — sem WhatsApp'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] text-inkstone">{c.count} agendamento(s)</p>
                          <p className="text-[11px] text-felt-gray">próximo: {shortDate(c.next)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {/* -------- configurações -------- */}
            {view === 'config' && (
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                <Card title="Sessão" hint="Token só no navegador (sessionStorage), nunca no repositório.">
                  <dl className="grid gap-2 text-[12px]">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-felt-gray">OWNER_TOKEN</dt>
                      <dd className="font-mono text-inkstone">••••••{token.slice(-4)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-felt-gray">API</dt>
                      <dd className="truncate font-mono text-[11px] text-inkstone">{API}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-felt-gray">Agendamentos</dt>
                      <dd className="tabular-nums text-inkstone">{sorted.length}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={logout} className="rounded-lg bg-inkstone px-3 py-2 text-[13px] font-medium text-white hover:opacity-90">Sair deste navegador</button>
                    <a href="/" className="rounded-lg border border-black/15 px-3 py-2 text-[13px] text-inkstone hover:bg-black/5">Ver landing page</a>
                  </div>
                </Card>

                <Card title="Como funciona" hint="Limites reais — sem promessa de automação.">
                  <ul className="grid gap-2 text-[12px] leading-relaxed text-felt-gray">
                    <li className="flex gap-2"><Clock size={14} className="mt-0.5 shrink-0" aria-hidden="true" /><span>Cancelar ou remarcar roda no servidor: não duplica horário e libera o horário antigo.</span></li>
                    <li className="flex gap-2"><MessageCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" /><span>A mensagem do WhatsApp abre pronta no <code>wa.me</code>; <strong className="font-medium text-inkstone">você toca em enviar</strong>. Não usa Meta e não envia sozinho.</span></li>
                    <li className="flex gap-2"><Users size={14} className="mt-0.5 shrink-0" aria-hidden="true" /><span>Cliente sem telefone não recebe link. Página <code>noindex</code>, sem login de cliente.</span></li>
                  </ul>
                </Card>
              </div>
            )}

            <p className="mt-5 text-[10px] leading-relaxed text-felt-gray">
              Barbearia Raiz · painel interno · conteúdo de exemplo (substitua antes de publicar) · sem envio automático de WhatsApp.
            </p>
          </main>
        </div>
    </div>
  )
}
