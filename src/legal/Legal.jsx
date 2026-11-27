// Política de privacidade e Termos de uso.
// Textos escritos para o que o site faz HOJE (agendamento com nome e WhatsApp, sem pagamento,
// sem cookies, sem analytics). Se o site ganhar pagamento, login, analytics, pixel ou newsletter,
// estes textos precisam ser revistos ANTES da mudança ir ao ar.
// RASCUNHO: revisar com advogado antes de publicar.
import { ArrowLeft } from 'lucide-react'
import { EMPRESA, EMPRESA_INCOMPLETA } from '../lib/empresa.js'
import { TELEFONE_EXIBICAO } from '../lib/contato.js'

// destaca qualquer [placeholder] para ninguém publicar sem ver
export function Dado({ children }) {
  const v = String(children)
  if (!v.includes('[')) return <>{v}</>
  return <mark className="rounded-sm bg-[#fff1a8] px-1 text-ink">{v}</mark>
}

function Section({ id, title, children }) {
  return (
    <section aria-labelledby={id} className="mt-10 first:mt-0">
      <h2 id={id} className="font-display text-xl font-medium leading-tight text-ink md:text-2xl">{title}</h2>
      <div className="legal-body mt-4">{children}</div>
    </section>
  )
}

export function LegalLayout({ title, children, homeHref = '/', links }) {
  return (
    <div className="min-h-screen bg-bone text-ink">
      <a href="#conteudo" onClick={(e) => { e.preventDefault(); document.getElementById('conteudo')?.focus() }} className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black">
        Pular para o conteúdo
      </a>
      <header className="border-b border-black/10 bg-coal text-white">
        <div className="mx-auto flex max-w-[760px] items-center justify-between gap-4 px-5 py-4">
          <a href={homeHref} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
            <ArrowLeft size={18} aria-hidden="true" /> Voltar ao site
          </a>
          <span className="font-display text-xs font-medium uppercase tracking-[0.12em]">{EMPRESA.nomeFantasia}</span>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1} className="mx-auto outline-none max-w-[760px] px-5 py-10 md:py-14">
        <h1 className="font-display text-[clamp(1.9rem,6vw,2.75rem)] font-medium leading-[1.05]">{title}</h1>
        <p className="mt-3 text-sm text-black/70">Última atualização: <Dado>{EMPRESA.revisaoPoliticas}</Dado></p>
        {EMPRESA_INCOMPLETA && (
          <p role="note" className="mt-6 rounded-lg border border-dashed border-black/40 bg-white p-4 text-sm">
            <strong>Rascunho.</strong> Os trechos marcados em amarelo são dados da empresa que ainda faltam.
            Este texto precisa ser revisado por um advogado antes de o site ir ao ar.
          </p>
        )}
        <div className="mt-10">{children}</div>
        <nav aria-label="Documentos legais" className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-black/10 pt-6 text-sm">
          <a href={links.privacidade} className="underline underline-offset-4">Política de privacidade</a>
          <a href={links.termos} className="underline underline-offset-4">Termos de uso</a>
          <a href={homeHref} className="underline underline-offset-4">Página inicial</a>
        </nav>
      </main>
    </div>
  )
}

function Controlador() {
  return (
    <ul>
      <li><strong>Nome:</strong> {EMPRESA.nomeFantasia} (<Dado>{EMPRESA.razaoSocial}</Dado>)</li>
      <li><strong>CNPJ:</strong> <Dado>{EMPRESA.cnpj}</Dado></li>
      <li><strong>Endereço:</strong> <Dado>{EMPRESA.endereco}</Dado>, <Dado>{EMPRESA.bairroCidadeUf}</Dado>, <Dado>{EMPRESA.cep}</Dado></li>
      <li><strong>WhatsApp:</strong> {TELEFONE_EXIBICAO}</li>
      <li><strong>E-mail:</strong> <Dado>{EMPRESA.email}</Dado></li>
    </ul>
  )
}

/* ------------------------------------------------------------------ */

export function Privacidade({ homeHref, links }) {
  const dias = EMPRESA.retencaoDias
  return (
    <LegalLayout title="Política de privacidade" homeHref={homeHref} links={links}>
      <Section id="resumo" title="Resumo">
        <ul>
          <li>Para reservar um horário, pedimos só <strong>nome e WhatsApp</strong>, além do serviço, do dia e da hora que você escolhe.</li>
          <li>Usamos esses dados apenas para o seu agendamento. Não vendemos, não usamos para propaganda e não fazemos perfil de ninguém.</li>
          <li>A reserva é apagada automaticamente <strong>{dias} dias depois da data do atendimento</strong>.</li>
          <li>O site <strong>não usa cookies</strong>, não tem ferramenta de estatística (analytics) nem pixel de anúncio.</li>
          <li>Você pode pedir para ver, corrigir ou apagar seus dados a qualquer momento pelo canal indicado no fim desta página.</li>
        </ul>
      </Section>

      <Section id="quem" title="1. Quem cuida dos seus dados">
        <p>
          A responsável pelos dados coletados neste site (a “controladora”, nos termos da Lei Geral de Proteção de Dados,
          Lei nº 13.709/2018, a LGPD) é:
        </p>
        <Controlador />
      </Section>

      <Section id="dados" title="2. Quais dados coletamos">
        <h3>Quando você reserva um horário</h3>
        <ul>
          <li><strong>Nome</strong>, para saber quem vamos atender;</li>
          <li><strong>Número de WhatsApp</strong>, para confirmar, remarcar ou avisar se o horário precisar ser cancelado;</li>
          <li><strong>Serviço, dia e hora</strong> escolhidos, e a data em que a reserva foi feita.</li>
        </ul>
        <h3>Para proteger a agenda contra abuso</h3>
        <p>
          O servidor registra o <strong>endereço IP</strong> de quem tenta reservar, apenas na memória e por no máximo 15 minutos,
          para limitar tentativas repetidas (por exemplo, alguém tentando ocupar todos os horários). Esse registro não é salvo em banco de dados.
        </p>
        <h3>Registros técnicos da hospedagem</h3>
        <p>
          Como qualquer site, o provedor de hospedagem (<Dado>{EMPRESA.hospedagem}</Dado>) pode registrar dados técnicos das visitas,
          como IP, data e hora e página acessada, para segurança e funcionamento do serviço.
        </p>
        <h3>O que não coletamos</h3>
        <p>
          Não pedimos CPF, e-mail, endereço, data de nascimento nem dados de pagamento. Não coletamos dados sensíveis
          (como saúde, religião ou origem racial). Por favor, não escreva esse tipo de informação nos campos do formulário.
        </p>
      </Section>

      <Section id="finalidade" title="3. Para que usamos e com qual base legal">
        <div className="-mx-5 overflow-x-auto px-5" role="region" aria-label="Tabela de finalidades (role para os lados no celular)" tabIndex={0}>
          <table>
            <caption className="sr-only">Finalidades e bases legais do tratamento de dados</caption>
            <thead><tr><th scope="col">Finalidade</th><th scope="col">Dados</th><th scope="col">Base legal (LGPD)</th></tr></thead>
            <tbody>
              <tr>
                <td>Registrar e gerenciar a sua reserva, confirmar, remarcar ou avisar cancelamento pelo WhatsApp</td>
                <td>Nome, WhatsApp, serviço, dia e hora</td>
                <td>Procedimentos preliminares e execução do contrato de prestação de serviço, a seu pedido (art. 7º, V)</td>
              </tr>
              <tr>
                <td>Impedir reservas em massa e uso abusivo do agendamento</td>
                <td>Endereço IP (15 minutos, só em memória)</td>
                <td>Legítimo interesse em manter o serviço seguro e disponível (art. 7º, IX)</td>
              </tr>
              <tr>
                <td>Registros técnicos de acesso mantidos pela hospedagem</td>
                <td>IP, data e hora, página</td>
                <td>Cumprimento de obrigação legal, quando aplicável (Marco Civil da Internet, Lei nº 12.965/2014, art. 15), e legítimo interesse em segurança (art. 7º, II e IX)</td>
              </tr>
              <tr>
                <td>Defender direitos em eventual reclamação ou processo</td>
                <td>Os dados da reserva, pelo prazo de guarda</td>
                <td>Exercício regular de direitos (art. 7º, VI)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Não usamos seus dados para enviar promoções. Se um dia quisermos fazer isso, vamos pedir sua autorização
          separadamente, e você poderá recusar sem perder o direito de agendar.
        </p>
      </Section>

      <Section id="menores" title="4. Agendamento para crianças e adolescentes">
        <p>
          O agendamento deve ser feito por uma pessoa maior de 18 anos. Para o corte de uma criança ou de um adolescente, quem reserva
          é a mãe, o pai ou o responsável, com o próprio nome e WhatsApp. Não pedimos nenhum dado da criança no site
          (LGPD, art. 14).
        </p>
      </Section>

      <Section id="compartilhamento" title="5. Com quem compartilhamos">
        <p>Não vendemos nem alugamos dados. Eles só são acessados por:</p>
        <ul>
          <li>a equipe da barbearia, na área restrita do dono, protegida por senha;</li>
          <li>o provedor de hospedagem do site (<Dado>{EMPRESA.hospedagem}</Dado>), que guarda os dados em nosso nome;</li>
          <li>quem mantém o site tecnicamente (<Dado>{EMPRESA.operadorTecnico}</Dado>), apenas para manutenção e sempre sob nossas instruções;</li>
          <li>autoridades públicas, somente quando houver obrigação legal ou ordem judicial.</li>
        </ul>
        <p>
          <strong>WhatsApp:</strong> quando você toca em um botão de WhatsApp, você sai do site e passa a usar o aplicativo
          WhatsApp, da Meta. A conversa segue os termos e a política de privacidade do WhatsApp. O mesmo vale para os links do
          Instagram e do Google Maps: eles só carregam quando você clica, e a partir daí valem as regras dessas empresas.
        </p>
      </Section>

      <Section id="internacional" title="6. Transferência para fora do Brasil">
        <p>
          Se o provedor de hospedagem mantiver servidores fora do Brasil, os dados da reserva podem ser armazenados no exterior.
          Nesse caso, a transferência segue o art. 33 da LGPD e as regras da ANPD sobre transferência internacional.
          Servidores do provedor atual: <Dado>{EMPRESA.hospedagem}</Dado>.
        </p>
      </Section>

      <Section id="retencao" title="7. Por quanto tempo guardamos">
        <ul>
          <li><strong>Reservas:</strong> apagadas automaticamente {dias} dias depois da data do atendimento. Esse prazo serve para
            resolver dúvidas ou reclamações sobre o serviço prestado. Se a reserva for cancelada, ela é apagada na hora.</li>
          <li><strong>Endereço IP do limite de tentativas:</strong> até 15 minutos, só em memória.</li>
          <li><strong>Registros técnicos da hospedagem:</strong> pelo prazo que a lei exigir (no Marco Civil, 6 meses, quando aplicável) ou
            o prazo informado pelo provedor.</li>
          <li><strong>Conversas no WhatsApp:</strong> ficam no aparelho e na conta da barbearia. Você pode pedir que sejam apagadas.</li>
        </ul>
        <p>Planilhas exportadas da área do dono seguem o mesmo prazo e devem ser apagadas quando não forem mais necessárias.</p>
      </Section>

      <Section id="seguranca" title="8. Como protegemos">
        <p>
          Coletamos o mínimo de dados, a área do dono exige senha, a conexão do site é criptografada (HTTPS) e a lista de reservas não
          é exibida publicamente: a página de agendamento só mostra quais horários estão ocupados, sem nomes ou telefones.
          Se acontecer um incidente de segurança que possa causar risco ou dano relevante a você, vamos comunicar você e a
          Autoridade Nacional de Proteção de Dados (ANPD), como manda o art. 48 da LGPD.
        </p>
      </Section>

      <Section id="direitos" title="9. Seus direitos">
        <p>Pela LGPD (art. 18), você pode pedir a qualquer momento, sem custo:</p>
        <ul>
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei;</li>
          <li>eliminação da sua reserva e dos seus dados, ressalvadas as hipóteses de guarda previstas em lei (art. 16);</li>
          <li>portabilidade dos dados, nos termos da regulamentação da ANPD;</li>
          <li>informação sobre com quem compartilhamos seus dados;</li>
          <li>revisão de decisões tomadas apenas de forma automatizada (o site não toma esse tipo de decisão);</li>
          <li>oposição a um tratamento baseado em legítimo interesse, se você achar que ele não respeita a lei.</li>
        </ul>
        <p>
          Para fazer um pedido, fale com a gente pelo canal da seção 11. Podemos pedir uma confirmação simples de que o número de
          WhatsApp é seu, para não entregar dados a outra pessoa. Respondemos em até 15 dias. Se não ficar satisfeito, você pode
          reclamar à ANPD em <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">gov.br/anpd</a> ou aos órgãos de defesa do consumidor.
        </p>
      </Section>

      <Section id="cookies" title="10. Cookies e armazenamento no navegador">
        <p><strong>Este site não usa cookies.</strong> Por isso não há banner de cookies: não existe nada para aceitar ou recusar.</p>
        <ul>
          <li>A página pública não grava nada no seu navegador.</li>
          <li>A área restrita do dono guarda a senha de acesso no <em>sessionStorage</em> do navegador apenas enquanto a aba estiver aberta.
            Isso é estritamente necessário para o painel funcionar e é apagado ao fechar a aba ou sair.</li>
          <li>As fontes de letra são servidas pelo próprio site. Nenhum conteúdo de outra empresa (vídeo, mapa, rede social, estatística) é carregado
            automaticamente quando você abre a página.</li>
        </ul>
        <p>
          Se algum dia o site passar a usar estatísticas de visita, pixel de anúncio ou conteúdo incorporado de terceiros,
          esta política será atualizada antes, e esses recursos só serão ativados depois do seu consentimento.
        </p>
      </Section>

      <Section id="contato" title="11. Contato e encarregado de dados">
        <p>Para qualquer assunto sobre seus dados pessoais:</p>
        <ul>
          <li><strong>Canal de privacidade:</strong> <Dado>{EMPRESA.canalPrivacidade}</Dado></li>
          <li><strong>Encarregado (DPO):</strong> <Dado>{EMPRESA.encarregado}</Dado></li>
        </ul>
      </Section>

      <Section id="mudancas" title="12. Mudanças nesta política">
        <p>
          Podemos atualizar esta política quando o site ou a lei mudarem. A data da última atualização fica no topo da página.
          Mudanças relevantes serão destacadas no site.
        </p>
      </Section>
    </LegalLayout>
  )
}

/* ------------------------------------------------------------------ */

export function Termos({ homeHref, links }) {
  return (
    <LegalLayout title="Termos de uso" homeHref={homeHref} links={links}>
      <Section id="sobre" title="1. Sobre este site">
        <p>
          Este site apresenta os serviços da {EMPRESA.nomeFantasia} e permite reservar um horário de atendimento.
          Ao usar o site e fazer uma reserva, você concorda com estes termos. Leia também a{' '}
          <a href={links.privacidade}>Política de privacidade</a>.
        </p>
        <Controlador />
      </Section>

      <Section id="agendamento" title="2. Como funciona o agendamento">
        <ul>
          <li>Cada reserva ocupa um horário de 60 minutos, dentro do horário de funcionamento. Cada horário aceita uma única reserva.</li>
          <li>A reserva precisa ser feita por uma pessoa maior de 18 anos, com nome e WhatsApp verdadeiros. Para menores de idade, quem reserva é o responsável.</li>
          <li>Cada número de WhatsApp pode ter até 2 reservas futuras ao mesmo tempo.</li>
          <li>Depois de reservar, você pode enviar a mensagem de confirmação pelo WhatsApp. A barbearia pode entrar em contato pelo mesmo número para confirmar ou ajustar o horário.</li>
          <li>Se a agenda do site estiver fora do ar, a reserva pelo site fica pausada e você pode agendar direto pelo WhatsApp.</li>
        </ul>
      </Section>

      <Section id="precos" title="3. Preços e pagamento">
        <ul>
          <li>Os preços aparecem em reais (R$) e são pagos <strong>no estabelecimento</strong>, depois do atendimento. O site não faz cobranças e não pede dados de pagamento.</li>
          <li>Vale o preço que estava no site no momento da reserva (Código de Defesa do Consumidor, art. 30).</li>
          <li>Formas de pagamento aceitas: <Dado>[Pix, dinheiro, cartões aceitos]</Dado>.</li>
          <li>Pacote mensal: as regras (validade, quantidade de cortes, o que acontece com cortes não usados) são estas: <Dado>[descreva as condições do pacote]</Dado>.</li>
        </ul>
      </Section>

      <Section id="cancelamento" title="4. Cancelamento, atraso e falta">
        <ul>
          <li>Para cancelar ou remarcar, avise pelo WhatsApp com pelo menos <Dado>[X horas]</Dado> de antecedência.</li>
          <li>Tolerância de atraso: <Dado>[X minutos]</Dado>. Depois disso, o horário pode ser liberado para outro cliente.</li>
          <li>Não há cobrança de multa ou taxa por cancelamento ou falta, porque o site não recebe nenhum pagamento antecipado.</li>
          <li>Se a barbearia precisar cancelar ou remarcar, ela avisa você pelo WhatsApp informado na reserva.</li>
        </ul>
        <p>
          <strong>Reembolso:</strong> como não existe pagamento pelo site, não há política de reembolso online. Qualquer problema
          com um serviço pago no estabelecimento é tratado diretamente com a barbearia, de acordo com o Código de Defesa do Consumidor.
        </p>
      </Section>

      <Section id="uso" title="5. Uso correto do site">
        <p>Não é permitido:</p>
        <ul>
          <li>fazer reservas falsas, em nome de outra pessoa sem autorização ou com número de WhatsApp de terceiros;</li>
          <li>usar programas automáticos para reservar ou consultar a agenda;</li>
          <li>tentar acessar a área restrita do dono ou interferir no funcionamento do site.</li>
        </ul>
        <p>Reservas que violem estas regras podem ser canceladas, com aviso pelo WhatsApp informado.</p>
      </Section>

      <Section id="imagens" title="6. Marca, textos e imagens">
        <p>
          A marca, os textos e as fotos do site pertencem à {EMPRESA.nomeFantasia} ou são usados com licença ou autorização.
          Não podem ser copiados para uso comercial sem permissão. As pessoas que aparecem nas fotos autorizaram o uso da própria
          imagem. Se você aparece em alguma foto e quer que ela seja retirada, fale com a gente pelo WhatsApp ou pelo e-mail <Dado>{EMPRESA.email}</Dado>.
        </p>
      </Section>

      <Section id="links" title="7. Links para outros sites">
        <p>
          Os botões de WhatsApp, Instagram e Google Maps levam a serviços de outras empresas, com termos e políticas próprios.
          A barbearia não controla esses serviços.
        </p>
      </Section>

      <Section id="disponibilidade" title="8. Disponibilidade e responsabilidade">
        <p>
          Fazemos o possível para manter o site no ar e a agenda correta, mas o site pode ficar fora do ar por manutenção
          ou falha técnica. Nada nestes termos limita os direitos que o Código de Defesa do Consumidor garante a você.
        </p>
      </Section>

      <Section id="lei" title="9. Lei aplicável">
        <p>
          Estes termos seguem as leis brasileiras. Se houver um processo, você pode propor a ação no foro do seu domicílio,
          como garante o Código de Defesa do Consumidor (art. 101, I).
        </p>
      </Section>

      <Section id="mudancas-termos" title="10. Mudanças nestes termos">
        <p>
          Podemos atualizar estes termos. A versão em vigor é a publicada nesta página, com a data no topo. Reservas já feitas
          seguem os termos da data em que foram feitas.
        </p>
      </Section>
    </LegalLayout>
  )
}
