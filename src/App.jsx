import { Phone, MapPin, Clock, ArrowRight } from 'lucide-react'
import Reveal from './components/Reveal.jsx'
import ScrollIndicator from './components/ScrollIndicator.jsx'
import Header from './components/Header.jsx'
import BookingCalendar from './components/BookingCalendar.jsx'

import { WA, WA_SIMPLE, TEL, TELEFONE_EXIBICAO } from './lib/contato.js'

const SERVICES = [
  ['Corte clássico', 'Máquina e tesoura, acabamento na navalha.', 'R$ 45'],
  ['Corte + barba', 'O combo completo, uma passagem só.', 'R$ 70'],
  ['Barba', 'Modelagem, toalha quente e balm.', 'R$ 30'],
  ['Hot towel', 'Barba relaxante com toalha quente e óleo.', 'R$ 45'],
  ['Corte infantil', 'Crianças até 12 anos.', 'R$ 40'],
  ['Acabamento', 'Pézinho, pescoço e orelha.', 'R$ 15'],
  ['Sobrancelha', 'Alinhamento na navalha.', 'R$ 15'],
  ['Pacote mensal', '4 cortes no mês, sem pagar por atendimento.', 'R$ 160'],
]

const QUOTES = [
  ['Sai pronto pra trabalhar. Não preciso passar no salão depois.', 'Cliente satisfeito'],
  ['Barba em ponto, sem dor e sem pressa. Recomendo demais.', 'Cliente satisfeito'],
  ['Pacote mensal pagou o próprio preço. Atendimento sem fila.', 'Cliente satisfeito'],
]

function Photo({ label, className = '', aspect = 'aspect-[4/5]', ...rest }) {
  return (
    <div
      className={`grid place-items-center rounded-none bg-ash-mist ${aspect} ${className}`}
      role="img"
      aria-label={label}
      {...rest}
    >
      <span className="border border-current bg-white px-3 py-1.5 text-xs text-felt-gray" aria-hidden="true">
        Sua foto aqui
      </span>
    </div>
  )
}

function SectionHeading({ id, title, lead, dark = false }) {
  return (
    <>
      <Reveal>
        <h2 id={id} className={`text-[clamp(1.75rem,4vw,3rem)] font-light leading-tight ${dark ? 'text-white' : 'text-black'}`}>
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.06}>
          <p className={`mt-3 max-w-[60ch] ${dark ? 'text-white/75' : 'text-felt-gray'}`}>{lead}</p>
        </Reveal>
      )}
    </>
  )
}

export default function App() {
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-black focus:px-4 focus:py-2 focus:text-white">
        Pular para o conteúdo
      </a>

      <Header />

      <main id="conteudo">
        {/* HERO */}
        <section className="hero-iridescent hero-reveal flex min-h-[100svh] flex-col items-center justify-center px-5 pb-28 pt-24 text-center text-white md:px-10" aria-labelledby="hero-title">
          <div className="mx-auto max-w-[1078px]">
            <h1 id="hero-title" className="mb-7 text-[clamp(2.25rem,5vw,4rem)] font-normal leading-[1.02] tracking-normal text-balance">
              Corte certo.<br />Barba em ponto.
            </h1>
            <p className="mx-auto mb-10 max-w-[48ch] text-lg text-white/75">
              Barbearia tradicional <strong className="font-semibold text-white">em [seu bairro, sua cidade]</strong>. Hora marcada, sem fila, acabamento no detalhe.
            </p>
            <div className="flex flex-wrap justify-center gap-3.5">
              <a className="btn-pill" href={WA} target="_blank" rel="noopener">Agendar no WhatsApp</a>
              <a className="btn-pill" href="#servicos">Ver serviços e preços</a>
            </div>
            <p className="mt-7 text-xs text-white/70">Agende com ao menos um dia de antecedência. Chegue 5 minutos antes.</p>
          </div>
          <ScrollIndicator />
        </section>

        {/* SERVIÇOS */}
        <section className="scroll-mt-[4.5rem] border-t border-black/15 py-[clamp(3.5rem,8vw,6rem)]" id="servicos" aria-labelledby="servicos-title">
          <div className="mx-auto max-w-[1078px] px-5 md:px-10">
            <SectionHeading id="servicos-title" title="Serviços e preços" lead="Preços de tabela. Combine pacotes e horários no WhatsApp." />
            <ul className="mt-7 border-t border-black/15">
              {SERVICES.map(([name, desc, price], i) => (
                <Reveal as="li" key={name} delay={(i % 8) * 0.07} className="grid list-none grid-cols-[1fr_auto] gap-x-7 border-b border-black/15 py-7">
                  <span className="text-lg font-semibold">{name}</span>
                  <span className="row-span-2 self-center whitespace-nowrap text-lg font-semibold tabular-nums text-obsidian">{price}</span>
                  <span className="max-w-[52ch] text-xs text-felt-gray">{desc}</span>
                </Reveal>
              ))}
            </ul>
            <p className="mt-3 text-xs italic text-felt-gray">Preços de exemplo — substitua pelos valores reais antes de publicar.</p>
            <p className="mt-7"><a className="btn-pill" href={WA} target="_blank" rel="noopener">Agendar meu horário</a></p>
          </div>
        </section>

        {/* SOBRE */}
        <section className="scroll-mt-[4.5rem] border-t border-black/15 py-[clamp(3.5rem,8vw,6rem)]" id="sobre" aria-labelledby="sobre-title">
          <div className="mx-auto grid max-w-[1078px] items-center gap-12 px-5 md:grid-cols-[0.85fr_1.15fr] md:px-10">
            <Reveal><Photo label="Foto do barbeiro trabalhando" className="w-full" /></Reveal>
            <Reveal delay={0.06} className="max-w-none">
              <h2 id="sobre-title" className="mb-7 text-[clamp(1.75rem,4vw,3rem)] font-light leading-tight">Ofício de quem gosta do que faz</h2>
              <p className="max-w-[58ch] text-inkstone">Aqui não tem pressa. Cada corte é feito no seu ritmo, com material limpo, navalha afiada e conversa de verdade enquanto o tempo passa.</p>
              <p className="max-w-[58ch] text-inkstone">
                {/* PLACEHOLDER: conte sua história real */}
                Tradição de bairro com atendimento de barbeiro de ofício. <strong className="font-semibold">[Conte a história da sua barbearia aqui.]</strong>
              </p>
              <ul className="mt-7 flex flex-col gap-3.5">
                {['Atendimento com horário marcado', 'Produtos de qualidade, sem truques', 'Ambiente limpo, acessível e sem barulho excessivo'].map((t) => (
                  <li key={t} className="relative pl-7">
                    <span className="absolute left-0 top-[0.62em] h-px w-3 bg-current" aria-hidden="true" />{t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* GALERIA */}
        <section className="scroll-mt-[4.5rem] border-t border-black/15 py-[clamp(3.5rem,8vw,6rem)]" id="galeria" aria-labelledby="galeria-title">
          <div className="mx-auto max-w-[1078px] px-5 md:px-10">
            <SectionHeading id="galeria-title" title="Resultados recentes" lead="Fotos de cortes e barbas. Troque pelas fotos da sua barbearia." />
            <ul className="mt-7 grid grid-cols-2 gap-3.5 md:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n, i) => (
                <li key={n}>
                  <Reveal delay={(i % 8) * 0.07}>
                    <Photo label={`Foto de resultado ${n}`} aspect="aspect-square" />
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* DEPOIMENTOS */}
        <section className="scroll-mt-[4.5rem] border-t border-black/15 py-[clamp(3.5rem,8vw,6rem)]" id="depoimentos" aria-labelledby="depoimentos-title">
          <div className="mx-auto max-w-[1078px] px-5 md:px-10">
            <SectionHeading id="depoimentos-title" title="Quem vem volta" />
            <ul className="mt-7 grid gap-10 md:grid-cols-3">
              {QUOTES.map(([q, c], i) => (
                <li key={q}>
                  <Reveal delay={(i % 8) * 0.07}>
                    <blockquote className="m-0"><p className="mb-3 text-[1.375rem] font-light leading-tight">“{q}”</p></blockquote>
                    <cite className="text-xs not-italic text-felt-gray">— {c}</cite>
                  </Reveal>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs italic text-felt-gray">Depoimentos de exemplo — substitua por avaliações reais.</p>
          </div>
        </section>

        {/* AGENDAR (calendário) */}
        <section className="scroll-mt-[4.5rem] border-t border-black/15 py-[clamp(3.5rem,8vw,6rem)]" id="agendar" aria-labelledby="agendar-title">
          <div className="mx-auto max-w-[1078px] px-5 md:px-10">
            <Reveal><h2 id="agendar-title" className="text-[clamp(1.75rem,4vw,3rem)] font-light leading-tight">Agende seu horário</h2></Reveal>
            <Reveal delay={0.06}><p className="mt-3 max-w-[60ch] text-felt-gray">Escolha o dia e um horário livre. <strong className="font-semibold">Intervalo de 1 hora</strong>; cada horário só pode ser reservado uma vez.</p></Reveal>
            <div className="mt-8"><BookingCalendar services={SERVICES} /></div>
            <p className="mt-4 text-xs text-felt-gray">
              Os agendamentos desta página aparecem na hora no <a className="underline underline-offset-2 hover:text-inkstone" href="/owner.html">painel do dono</a>. Dono da barbearia? <a className="underline underline-offset-2 hover:text-inkstone" href="/owner.html">Entrar no painel</a>.
            </p>
          </div>
        </section>

        {/* CONTATO */}
        <section data-dark-section className="scroll-mt-[4.5rem] border-y border-black/15 bg-black py-[clamp(3.5rem,8vw,6rem)] text-white" id="contato" aria-labelledby="contato-title">
          <div className="mx-auto max-w-[1078px] px-5 md:px-10">
            <Reveal><h2 id="contato-title" className="text-[clamp(1.75rem,4vw,3rem)] font-light leading-tight text-white">Agende seu horário</h2></Reveal>
            <Reveal delay={0.06}><p className="mt-3 max-w-[60ch] text-white/75">Marque pelo WhatsApp. Respondemos rápido.</p></Reveal>

            <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
              <Reveal className="!max-w-none">
                <h3 className="mb-7 flex items-center gap-2 text-lg font-normal text-white"><Clock size={18} aria-hidden="true" /> Horário de funcionamento</h3>
                <table className="w-full border-collapse text-base">
                  <caption className="sr-only">Horário de funcionamento por dia da semana</caption>
                  <tbody>
                    <tr><th scope="row" className="border-t border-white/20 py-2 text-left font-normal">Segunda a sexta</th><td className="border-t border-white/20 py-2 text-right tabular-nums text-white/85">9h – 19h</td></tr>
                    <tr><th scope="row" className="border-t border-white/20 py-2 text-left font-normal">Sábado</th><td className="border-t border-white/20 py-2 text-right tabular-nums text-white/85">8h – 18h</td></tr>
                    <tr><th scope="row" className="border-t border-white/20 py-2 text-left font-normal">Domingo</th><td className="border-t border-white/20 py-2 text-right text-white/85">Fechado</td></tr>
                  </tbody>
                </table>
                <p className="mt-3 text-xs italic text-white/70">Horários de exemplo — confirme os reais.</p>
              </Reveal>

              <Reveal delay={0.06} className="!max-w-none">
                <h3 className="mb-7 flex items-center gap-2 text-lg font-normal text-white"><MapPin size={18} aria-hidden="true" /> Onde ficamos</h3>
                <address className="not-italic mb-3 text-white/85">Rua Exemplo, 123<br />[Bairro] — [Cidade]/[UF]<br />CEP 00000-000</address>
                <p><a className="inline-flex items-center gap-1 border-b border-current pb-px hover:opacity-75" href="https://www.google.com/maps" target="_blank" rel="noopener">Ver no mapa <ArrowRight size={14} aria-hidden="true" /></a></p>
                <p className="mt-3 text-xs italic text-white/70">Endereço de exemplo.</p>
              </Reveal>

              <Reveal delay={0.12} className="!max-w-none">
                <h3 className="mb-7 flex items-center gap-2 text-lg font-normal text-white"><Phone size={18} aria-hidden="true" /> Fale com a gente</h3>
                <p><a className="btn-pill !w-full" href={WA} target="_blank" rel="noopener">Agendar no WhatsApp</a></p>
                <p className="mt-3.5"><a className="btn-pill !w-full" href={TEL}>Ligar: {TELEFONE_EXIBICAO}</a></p>
                <p className="mt-3 text-xs italic text-white/70">Telefone e WhatsApp de exemplo.</p>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-black/15 pt-16 pb-12">
        <div className="mx-auto grid max-w-[1078px] gap-12 px-5 md:grid-cols-[1.5fr_1fr_1fr] md:px-10">
          <div>
            <a href="#topo" className="flex items-center gap-2.5 text-base font-normal text-black">
              <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false">
                <rect x="10" y="4" width="3" height="24" fill="currentColor" />
                <rect x="19" y="4" width="3" height="24" fill="currentColor" />
              </svg>
              <span>Barbearia <strong className="font-semibold">Raiz</strong></span>
            </a>
            <p className="mt-3 text-xs text-felt-gray">Corte certo. Barba em ponto.</p>
          </div>

          <nav aria-label="Links do rodapé">
            <ul className="grid gap-2">
              {[['#servicos', 'Serviços'], ['#sobre', 'Sobre'], ['#galeria', 'Galeria'], ['#depoimentos', 'Depoimentos'], ['#agendar', 'Agendar'], ['#contato', 'Contato'], ['/owner.html', 'Painel do dono']].map(([href, label]) => (
                <li key={href}><a href={href} className="text-[11px] text-felt-gray hover:text-black">{label}</a></li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-3 text-[11px] text-felt-gray">Redes</h3>
            <ul className="grid gap-2">
              <li><a href="https://www.instagram.com" target="_blank" rel="noopener" className="text-[11px] text-felt-gray hover:text-black">Instagram</a></li>
              <li><a href={WA_SIMPLE} target="_blank" rel="noopener" className="text-[11px] text-felt-gray hover:text-black">WhatsApp</a></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-[1078px] flex-wrap justify-between gap-2 px-5 text-[11px] text-felt-gray md:px-10">
          <p>© {new Date().getFullYear()} Barbearia Raiz. Todos os direitos reservados.</p>
          <p className="italic">Conteúdo de exemplo — substitua antes de publicar.</p>
          <a className="hover:text-black" href="/owner.html">Painel do dono</a>
        </div>
      </footer>
    </>
  )
}


