import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { WA } from '../lib/contato.js'

const LINKS = [
  ['#topo', 'Início'],
  ['#servicos', 'Serviços'],
  ['#sobre', 'Sobre'],
  ['#galeria', 'Galeria'],
  ['#depoimentos', 'Depoimentos'],
  ['#agendar', 'Agendar'],
  ['#contato', 'Contato'],
  ['/owner.html', 'Painel do dono'],
]


function Logo() {
  return (
    <a href="#topo" className="flex items-center gap-2.5 text-base font-normal text-inherit">
      <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false">
        <rect x="10" y="4" width="3" height="24" fill="currentColor" />
        <rect x="19" y="4" width="3" height="24" fill="currentColor" />
      </svg>
      <span>
        Barbearia <strong className="font-semibold">Raiz</strong>
      </span>
    </a>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [onDark, setOnDark] = useState(true)
  const headerRef = useRef(null)

  // header escuro sobre superfícies escuras
  useEffect(() => {
    const hero = document.querySelector('.hero-iridescent')
    const onScroll = () => {
      const h = headerRef.current?.offsetHeight ?? 66
      let dark = window.scrollY < (hero?.offsetHeight ?? 0) - h
      if (!dark) {
        const probe = document.elementFromPoint(window.innerWidth / 2, h + 4)
        dark = !!probe?.closest('[data-dark-section]')
      }
      setOnDark(dark)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
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
      className={`fixed inset-x-0 top-0 z-50 h-[66px] border-0 bg-transparent ${onDark ? 'text-white' : 'text-black'}`}
    >
      <div className="mx-auto flex h-full max-w-[1078px] items-center justify-between gap-4 px-5 md:px-10">
        <Logo />

        <button
          type="button"
          className="menu-toggle inline-grid h-11 w-11 place-items-center rounded-none border border-current md:hidden"
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
          className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col items-stretch gap-7 border-y border-black/15 bg-white px-5 py-7 text-black md:static md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0 md:text-inherit`}
        >
          <ul className="flex flex-col items-stretch gap-0 md:flex-row md:items-center md:gap-7">
            {LINKS.map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block border-t border-black/10 py-3.5 text-xs font-normal no-underline hover:opacity-60 md:border-0 md:py-1"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={WA}
            target="_blank"
            rel="noopener"
            onClick={() => setOpen(false)}
            className="btn-pill whitespace-nowrap !border-black !text-black md:!border-current md:!text-inherit"
          >
            Agendar horário
          </a>
        </nav>
      </div>
    </header>
  )
}
