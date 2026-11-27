import { Phone, MapPin, Clock, ArrowRight, ArrowUpRight, Star } from 'lucide-react'
import Reveal from './components/Reveal.jsx'
import Header from './components/Header.jsx'
import BookingCalendar from './components/BookingCalendar.jsx'

import { WA, WA_SIMPLE, TEL, TELEFONE, TELEFONE_EXIBICAO } from './lib/contato.js'
import { FOTOS } from './lib/fotos.js'

// [nome, descrição, preço]. Preços de exemplo: substitua pelos reais.
const SERVICES = [
  ['Corte clássico', 'Máquina e tesoura, acabamento na navalha.', 'R$ 45'],
  ['Corte + barba', 'O combo completo, uma passagem só.', 'R$ 70'],
  ['Barba', 'Modelagem, toalha quente e balm.', 'R$ 30'],
  ['Hot towel', 'Barba relaxante com toalha quente e óleo.', 'R$ 45'],
  ['Corte infantil', 'Crianças até 12 anos.', 'R$ 40'],
  ['Acabamento', 'Pezinho, pescoço e orelha.', 'R$ 15'],
  ['Sobrancelha', 'Alinhamento na navalha.', 'R$ 15'],
  ['Pacote mensal', '4 cortes no mês, sem pagar por atendimento.', 'R$ 160'],
]
const FEATURED = SERVICES.slice(0, 4)
const EXTRAS = SERVICES.slice(4)

// Números a confirmar com a barbearia. Não publique sem os valores reais.
const STATS = [
  ['X+', 'anos de ofício'],
  ['X+', 'clientes atendidos'],
  ['X,X', 'nota no Google'],
]

const GALERIA = ['Corte degradê', 'Barba na navalha', 'Cadeira e bancada', 'Produtos', 'Acabamento']

const SECTION = 'scroll-mt-[4.5rem] py-[clamp(3.5rem,9vw,7rem)]'
const WRAP = 'mx-auto max-w-[1200px] px-5 md:px-10'

function Photo({ src, label, className = '', tone = 'dark' }) {
  if (src) return <img src={src} alt={label} loading="lazy" className={`h-full w-full object-cover ${className}`} />
  return (
    <div role="img" aria-label={`Espaço para foto: ${label}`} className={`photo-ph photo-ph--${tone} grid h-full w-full place-items-center ${className}`}>
      <span aria-hidden="true" className="px-3 text-center text-[11px] uppercase tracking-[0.12em] opacity-70">Foto: {label}</span>
    </div>
  )
}

function Eyebrow({ children, dark }) {
  return <p className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] ${dark ? 'text-white/55' : 'text-black/50'}`}>{children}</p>
}

function Heading({ id, children, dark, className = '' }) {
  return (
    <h2 id={id} className={`font-display text-[clamp(1.9rem,4.6vw,3.25rem)] font-medium leading-[1.05] ${dark ? 'text-white' : 'text-ink'} ${className}`}>
      {children}
    </h2>
  )
}

function Placeholder({ children, dark }) {
  return <p className={`mt-4 text-xs italic ${dark ? 'text-white/50' : 'text-black/50'}`}>{children}</p>
}

export default function App() {
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black">
        Pular para o conteúdo
      </a>

      <Header />

      <main id="conteudo">
        {/* HERO */}
        <section id="topo" data-dark-section className="relative isolate flex min-h-[92svh] items-end overflow-hidden bg-coal text-white" aria-labelledby="hero-title">
          <div className="absolute inset-0 -z-10">
            <Photo src={FOTOS.hero} label="barbeiro finalizando um corte" className="!place-items-start pt-24 md:!place-items-center md:pl-[45%] md:pt-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-coal via-coal/70 to-coal/10 md:bg-gradient-to-r md:from-coal md:via-coal/80 md:to-transparent" />
          </div>
          <div className={`${WRAP} w-full pb-12 pt-28 md:pb-20`}>
            <div className="hero-reveal max-w-[760px]">
              <Eyebrow dark>Barbearia em [seu bairro, sua cidade]</Eyebrow>
              <h1 id="hero-title" className="font-display text-[clamp(2.35rem,8vw,4.75rem)] font-medium uppercase leading-[0.98]">
                Corte certo.<br />Barba em ponto.
              </h1>
              <p className="mt-5 max-w-[42ch] text-base text-white/75 md:text-lg">
                Corte, barba e acabamento na navalha com hora marcada. Você escolhe o horário e não pega fila.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a className="btn-solid" href={WA} target="_blank" rel="noopener">Agendar no WhatsApp <ArrowRight size={18} aria-hidden="true" /></a>
                <a className="btn-ghost text-white" href="#agendar">Escolher horário no site</a>
              </div>
              <dl className="mt-10 grid max-w-[460px] grid-cols-3 gap-4 border-t border-white/15 pt-5 text-xs text-white/60">
                <div><dt>Corte</dt><dd className="mt-1 text-base font-semibold text-white tabular-nums">R$ 45</dd></div>
                <div><dt>Corte + barba</dt><dd className="mt-1 text-base font-semibold text-white tabular-nums">R$ 70</dd></div>
                <div><dt>Seg a sex</dt><dd className="mt-1 text-base font-semibold text-white tabular-nums">9h–19h</dd></div>
              </dl>
            </div>
          </div>
        </section>

        {/* SERVIÇOS */}
        <section id="servicos" className={`${SECTION} bg-bone`} aria-labelledby="servicos-title">
          <div className={`${WRAP} grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-14`}>
            <Reveal>
              <Eyebrow>Serviços</Eyebrow>
              <Heading id="servicos-title">Nossos serviços</Heading>
              <p className="mt-4 max-w-[34ch] text-black/65">Corte, barba e cuidado feitos sem pressa, com material limpo e navalha afiada.</p>
              <a href="#lista-servicos" className="link-arrow mt-6">Ver todos os preços <ArrowRight size={16} aria-hidden="true" /></a>
            </Reveal>

            <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0" aria-label="Serviços em destaque">
              {FEATURED.map(([name, desc, price], i) => (
                <Reveal as="li" key={name} delay={i * 0.06} className="w-[72%] shrink-0 snap-start sm:w-[44%] md:w-auto">
                  <article className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-[18px] bg-coal text-white">
                    <div className="absolute inset-0"><Photo src={FOTOS.servicos[name]} label={name.toLowerCase()} /></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="relative p-4">
                      <h3 className="text-base font-semibold leading-tight">{name}</h3>
                      <p className="mt-1 text-xs text-white/65">{desc}</p>
                      <p className="mt-3 text-sm font-semibold tabular-nums">{price}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </ul>
          </div>

          <div className={`${WRAP} mt-12`}>
            <ul id="lista-servicos" className="scroll-mt-24 grid border-t border-black/10 md:grid-cols-2 md:gap-x-14" aria-label="Outros serviços">
              {EXTRAS.map(([name, desc, price]) => (
                <li key={name} className="grid grid-cols-[1fr_auto] gap-x-6 border-b border-black/10 py-5">
                  <span className="font-semibold">{name}</span>
                  <span className="row-span-2 self-center font-semibold tabular-nums">{price}</span>
                  <span className="text-sm text-black/55">{desc}</span>
                </li>
              ))}
            </ul>
            <Placeholder>Preços de exemplo. Substitua pelos valores reais antes de publicar.</Placeholder>
          </div>
        </section>

        {/* SOBRE */}
        <section id="sobre" data-dark-section className={`${SECTION} bg-coal text-white`} aria-labelledby="sobre-title">
          <div className={`${WRAP} grid items-center gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14`}>
            <Reveal className="aspect-[4/3] overflow-hidden rounded-[18px]">
              <Photo src={FOTOS.sobre} label="interior da barbearia" />
            </Reveal>
            <Reveal delay={0.06}>
              <Eyebrow dark>Sobre nós</Eyebrow>
              <Heading id="sobre-title" dark>Mais do que um corte</Heading>
              <p className="mt-5 max-w-[46ch] text-white/70">
                Aqui não tem pressa. Cada corte é feito no seu ritmo, com conversa de verdade enquanto o tempo passa.{' '}
                <strong className="font-semibold text-white">[Conte a história da barbearia aqui.]</strong>
              </p>
              <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
                {STATS.map(([n, l]) => (
                  <div key={l}>
                    <dt className="sr-only">{l}</dt>
                    <dd className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-medium tabular-nums">{n}</dd>
                    <dd className="mt-1 text-xs text-white/60">{l}</dd>
                  </div>
                ))}
              </dl>
              <Placeholder dark>Números a confirmar com a barbearia. Não publique com X.</Placeholder>
            </Reveal>
          </div>
        </section>

        {/* GALERIA */}
        <section id="galeria" className={`${SECTION} bg-bone`} aria-labelledby="galeria-title">
          <div className={WRAP}>
            <Reveal>
              <Eyebrow>Galeria</Eyebrow>
              <Heading id="galeria-title">O ambiente da barbearia</Heading>
            </Reveal>
            <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
              {GALERIA.map((label, i) => (
                <Reveal as="li" key={label} delay={i * 0.05} className={`overflow-hidden rounded-[14px] ${i === 0 ? 'col-span-2 aspect-[2/1] md:col-span-1 md:aspect-[3/4]' : 'aspect-[3/4]'}`}>
                  <Photo src={FOTOS.galeria[i]} label={label.toLowerCase()} tone="light" />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* EQUIPE */}
        <section id="equipe" data-dark-section className={`${SECTION} bg-coal text-white`} aria-labelledby="equipe-title">
          <div className={`${WRAP} grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-14`}>
            <Reveal>
              <Eyebrow dark>Equipe</Eyebrow>
              <Heading id="equipe-title" dark>Quem corta aqui</Heading>
              <p className="mt-4 max-w-[34ch] text-white/65">Barbeiros que conhecem o ofício e sabem ouvir o que você quer.</p>
              <a className="btn-ghost mt-6 text-white" href={WA} target="_blank" rel="noopener">Agendar com um barbeiro</a>
            </Reveal>
            <ul className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {FOTOS.equipe.map((src, i) => (
                <Reveal as="li" key={i} delay={i * 0.06} className="w-[64%] shrink-0 snap-start sm:w-[40%] md:w-auto">
                  <div className="aspect-[3/4] overflow-hidden rounded-[18px]"><Photo src={src} label={`barbeiro ${i + 1}`} /></div>
                  <p className="mt-3 font-semibold">[Nome do barbeiro]</p>
                  <p className="text-xs text-white/55">[Especialidade]</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* AVALIAÇÕES */}
        <section id="avaliacoes" className={`${SECTION} bg-bone`} aria-labelledby="avaliacoes-title">
          <div className={`${WRAP} grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-14`}>
            <Reveal>
              <Eyebrow>Avaliações</Eyebrow>
              <Heading id="avaliacoes-title">O que dizem os clientes</Heading>
            </Reveal>
            <ul className="grid gap-3 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <li key={n} className="flex flex-col gap-4 rounded-[18px] border border-dashed border-black/20 bg-white p-5">
                  <div className="flex gap-1 text-black/25" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((s) => <Star key={s} size={14} />)}
                  </div>
                  <p className="text-sm text-black/55">Espaço para uma avaliação real do Google, copiada com autorização do cliente.</p>
                  <p className="mt-auto text-xs font-semibold text-black/45">[Nome do cliente]</p>
                </li>
              ))}
            </ul>
          </div>
          <div className={WRAP}><Placeholder>Sem depoimentos inventados: entram só avaliações reais.</Placeholder></div>
        </section>

        {/* AGENDAR */}
        <section id="agendar" className={`${SECTION} border-t border-black/10 bg-paper`} aria-labelledby="agendar-title">
          <div className={WRAP}>
            <Reveal>
              <Eyebrow>Agendamento</Eyebrow>
              <Heading id="agendar-title">Escolha seu horário</Heading>
              <p className="mt-4 max-w-[52ch] text-black/65">Escolha o dia e um horário livre. Cada horário só aceita uma reserva e sai da agenda assim que você confirma.</p>
            </Reveal>
            <div className="mt-8"><BookingCalendar services={SERVICES} whatsapp={TELEFONE} /></div>
          </div>
        </section>

        {/* CONTATO */}
        <section id="contato" data-dark-section className={`${SECTION} bg-coal text-white`} aria-labelledby="contato-title">
          <div className={WRAP}>
            <Reveal>
              <Eyebrow dark>Contato</Eyebrow>
              <Heading id="contato-title" dark>Fale com a gente</Heading>
              <p className="mt-4 max-w-[46ch] text-white/65">Marque pelo WhatsApp. A resposta vem rápido.</p>
            </Reveal>

            <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
              <div>
                <h3 className="mb-5 flex items-center gap-2 font-semibold"><Clock size={18} aria-hidden="true" /> Horário</h3>
                <table className="w-full border-collapse text-sm">
                  <caption className="sr-only">Horário de funcionamento por dia da semana</caption>
                  <tbody>
                    {[['Segunda a sexta', '9h – 19h'], ['Sábado', '8h – 18h'], ['Domingo', 'Fechado']].map(([d, h]) => (
                      <tr key={d}><th scope="row" className="border-t border-white/15 py-2.5 text-left font-normal text-white/80">{d}</th><td className="border-t border-white/15 py-2.5 text-right tabular-nums">{h}</td></tr>
                    ))}
                  </tbody>
                </table>
                <Placeholder dark>Horários de exemplo.</Placeholder>
              </div>

              <div>
                <h3 className="mb-5 flex items-center gap-2 font-semibold"><MapPin size={18} aria-hidden="true" /> Endereço</h3>
                <address className="not-italic text-white/80">Rua Exemplo, 123<br />[Bairro], [Cidade]/[UF]<br />CEP 00000-000</address>
                <a className="link-arrow mt-4 text-white" href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Ver no mapa <ArrowUpRight size={16} aria-hidden="true" /></a>
                <Placeholder dark>Endereço de exemplo.</Placeholder>
              </div>

              <div>
                <h3 className="mb-5 flex items-center gap-2 font-semibold"><Phone size={18} aria-hidden="true" /> WhatsApp e telefone</h3>
                <div className="grid gap-3">
                  <a className="btn-solid w-full" href={WA} target="_blank" rel="noopener">Agendar no WhatsApp <ArrowRight size={18} aria-hidden="true" /></a>
                  <a className="btn-ghost w-full text-white" href={TEL}>Ligar: {TELEFONE_EXIBICAO}</a>
                </div>
                <Placeholder dark>Número de exemplo.</Placeholder>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* RODAPÉ */}
      <footer data-dark-section className="border-t border-white/10 bg-coal pb-28 pt-14 text-white/60 md:pb-12">
        <div className={`${WRAP} grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]`}>
          <div>
            <a href="#topo" className="flex items-center gap-2.5 text-white">
              <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" focusable="false">
                <rect x="10" y="4" width="3" height="24" fill="currentColor" />
                <rect x="19" y="4" width="3" height="24" fill="currentColor" />
              </svg>
              <span className="font-display text-sm font-medium uppercase tracking-[0.12em]">Barbearia Raiz</span>
            </a>
            <p className="mt-3 text-xs">Corte certo. Barba em ponto.</p>
          </div>
          <nav aria-label="Links do rodapé">
            <ul className="grid gap-1">
              {[['#servicos', 'Serviços'], ['#sobre', 'Sobre'], ['#galeria', 'Galeria'], ['#equipe', 'Equipe'], ['#agendar', 'Agendar'], ['#contato', 'Contato']].map(([href, label]) => (
                <li key={href}><a href={href} className="inline-block py-1 text-xs hover:text-white">{label}</a></li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="mb-2 text-xs text-white/40">Redes</p>
            <ul className="grid gap-1">
              <li><a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="inline-block py-1 text-xs hover:text-white">Instagram</a></li>
              <li><a href={WA_SIMPLE} target="_blank" rel="noopener noreferrer" className="inline-block py-1 text-xs hover:text-white">WhatsApp</a></li>
            </ul>
          </div>
        </div>
        <div className={`${WRAP} mt-10 flex flex-wrap justify-between gap-2 text-xs`}>
          <p>© {new Date().getFullYear()} Barbearia Raiz</p>
          <p className="italic">Conteúdo de exemplo. Substitua antes de publicar.</p>
        </div>
      </footer>

      {/* CTA fixo no celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-coal/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
        <a className="btn-solid w-full" href={WA} target="_blank" rel="noopener">Agendar no WhatsApp <ArrowRight size={18} aria-hidden="true" /></a>
      </div>
    </>
  )
}
