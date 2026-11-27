export default function ScrollIndicator({ href = '#servicos', label = 'ROLE PARA VER' }) {
  const text = `${label} · ${label} · `
  return (
    <a
      className="scroll-indicator absolute bottom-5 left-4 sm:bottom-9 sm:left-8 inline-grid h-20 w-20 place-items-center rounded-full text-white transition-opacity hover:opacity-70 sm:h-24 sm:w-24"
      href={href}
      aria-label={`${label}: ir para os serviços`}
    >
      <svg viewBox="0 0 120 120" className="block h-full w-full" aria-hidden="true" focusable="false">
        <defs>
          <path id="scroll-circ" d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0" />
        </defs>
        <text className="fill-current text-[9px] font-normal uppercase tracking-[0.08em]" x="0" y="0">
          <textPath href="#scroll-circ" xlinkHref="#scroll-circ" startOffset="0">
            {text}
          </textPath>
        </text>
        <circle cx="60" cy="60" r="2.5" fill="currentColor" />
      </svg>
    </a>
  )
}
