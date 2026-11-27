import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { WA } from '../lib/contato.js'

const LINKS = [
  ['#topo', 'Início'],
  ['#servicos', 'Serviços'],
  ['#sobre', 'Sobre'],
  ['#galeria', 'Galeria'],
  ['#equipe', 'Equipe'],
  ['#agendar', 'Agendar'],
  ['#contato', 'Contato'],
]


function Logo() {
  return (
    <a href="#topo" className="flex items-center gap-2.5 text-base font-normal text-inherit">
      <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false">
        <rect x="10" y="4" width="3" height="24" fill="currentColor" />
        <rect x="19" y="4" width="3" height="24" fill="currentColor" />
      </svg>
      <span className="font-display text-sm font-medium uppercase tracking-[0.12em]">Barbearia Raiz</span>
    </a>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const headerRef = useRef(null)

  // fundo sólido depois que a página rola
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Esc + clique fora fecha
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onClick = (e) => {
      if (!e.target.closest('#menu') && !e.target.closest('.menu-toggle')) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [open])

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 h-[66px] text-white transition-colors duration-300 ${scrolled || open ? 'border-b border-white/10 bg-coal/90 backdrop-blur' : 'bg-transparent'}`}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4 px-5 md:px-10">
        <Logo />

        <button
          type="button"
          className="menu-toggle inline-grid h-11 w-11 place-items-center rounded-full border border-white/30 md:hidden"
          aria-expanded={open}
          aria-controls="menu"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>

        <nav
          id="menu"
          aria-label="Navegação principal"
          className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col items-stretch gap-7 border-b border-white/10 bg-coal px-5 py-7 text-white md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0 md:text-inherit`}
        >
          <ul className="flex flex-col items-stretch gap-0 md:flex-row md:items-center md:gap-7">
            {LINKS.map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block border-t border-white/10 py-3.5 text-sm font-medium md:text-xs no-underline hover:opacity-60 md:border-0 md:py-1"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="btn-solid whitespace-nowrap !min-h-10 !px-5 !text-sm"
          >
            Agendar horário
          </a>
        </nav>
      </div>
    </header>
  )
}
