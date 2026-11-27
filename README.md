# Barbearia Raiz — Landing page responsiva (React + Tailwind + build)

Landing page de uma barbearia (conteúdo **fictício de exemplo**). **HTML/CSS/JS estático → reestilizada (monopo saigon) → reestruturada em Vite + React + Tailwind v4 + Motion + Lucide.**

## Stack
- **Vite 6 + React 18** (`@vitejs/plugin-react`)
- **Tailwind CSS v4** (`@tailwindcss/vite`, `@import "tailwindcss"`, `@theme`)
- **motion** (`motion/react`, `MotionConfig reducedMotion="user"`)
- **lucide-react** (ícones monocromáticos, `aria-hidden`)
- Fontes **Manrope** (texto) e **Unbounded** (títulos) servidas pelo próprio site via `@fontsource` (`src/fonts.js`), sem Google Fonts; fallback `system-ui`. Fotos em `src/lib/fotos.js` (null = espaço marcado).

### Pacotes listados pelo usuário que **não** foram instalados
`shadcn-ui/ui`, `radix-ui/primitives`, `dip/cmdk`, `emilkowalski/sonner`, `davidjerleke/embla-carousel`, `clauderic/dnd-kit`, `recharts/recharts`, `storybookjs/storybook`, `floating-ui`, `penpot`, `nextlevelbuilder/ui-ux-pro-max-skill`, etc. — sem caso de uso. `dequelabs/axe-core` + `microsoft/playwright` podem ser adicionados em dev (não no bundle). **Escopo só para este agente**, não afeta outras IAs. Ver vault `[[Skills e repositórios exclusivos deste agente]]`.

## Rodar

**Frontend:**
```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
npm run preview  # serve dist/ (ex. http://localhost:4173)
```

**Backend** (agendamento real; terminal à parte):
```sh
cp .env.example .env          # preencha OWNER_TOKEN; NÃO commitar .env
npm run server                 # lê .env (`node --env-file-if-exists=.env`); http://localhost:3001
# ou: OWNER_TOKEN=<segredo> npm run server
# frontend (build-time): VITE_API_URL=http://localhost:3001
```
**Sem `OWNER_TOKEN`, a landing continua agendando, mas os endpoints do dono ficam desabilitados (`503 owner_disabled`)** — é a causa nº 1 de "landing conectada, painel sem conectar". O servidor loga `owner endpoints: disabled (set OWNER_TOKEN)`. Sem backend rodando, a seção `#agendar` mostra erro e **não** reserva.

### Conectar landing + painel (checklist)
1. **Mesmo backend**: `GET /api/health` → `{"ok":true,"slotMinutes":60}` em `VITE_API_URL` (default `http://localhost:3001`); `ALLOWED_ORIGINS` incluindo a origem da landing; `VITE_API_URL` é **build-time** → rebuildar.
2. **Mesmo `OWNER_TOKEN`**: servidor `OWNER_TOKEN=x` + digitar exatamente `x` no painel (`sessionStorage`, por aba). `503 owner_disabled` = não definido no servidor; `401` = token diferente; `network` = backend fora ou CORS.
3. **Mesmo SQLite**: `server/data/bookings.db` (`DATA_DIR`/`DB_PATH`); bookings feitos na landing aparecem no painel na hora + `Atualizar`.
4. **Mesma origem**: landing `/` e painel `/owner.html`; links `Painel do dono` na header/footer/`#agendar` e volta `← Landing page`.
O painel mostra `conectado · <host>` + `atualizado às HH:MM`, ou `sem conexão` com diagnóstico.

## Estrutura
- `index.html`, `vite.config.js`, `package.json`, `public/robots.txt`
- `src/main.jsx`, `src/App.jsx`, `src/index.css`
- `src/components/Header.jsx` — header transparente fixo + menu mobile acessível + dark-on-dark.
- `src/components/Reveal.jsx` — scroll reveal (Motion `whileInView`, once, `reducedMotion`).
- `src/components/ScrollIndicator.jsx` — selo circular girando ("ROLE PARA VER").
- `src/components/BookingCalendar.jsx` — seção `#agendar`, calendário.
- `src/components/OwnerCalendar.jsx` — calendário na guia do dono.
- `src/lib/bookings.js` — store async (backend).
- `src/lib/slots.js` — lógica de slots pura compartilhada.

## Design (monopo saigon)
Monocromático `#000`/`#fff` + cinzas mínimos; sem cor de CTA; **um hero iridescente** full-bleed (CSS puro + scrim; sem shader real); tipografia monumental (Inter; 300/400; nunca >400 em tamanhos grandes; hero `clamp(2.25rem,5vw,4rem)`, `leading-1.02`); `0px` salvo botões `9999px`; sem sombra; hairline `1px`; max-width `1078px`; motion `cubic-bezier(0.19,1,0.22,1)` `.8s/1.25s`; `prefers-reduced-motion`; a11y. Mantém **CTA de agendamento** no hero. **Scroll reveal** restrito + **rotating scroll indicator**. **Legibilidade:** `font-size clamp`, `line-height 1.65`, `text-wrap`, `max-width 75ch`.

## Efeitos de rolagem
Scroll reveal `opacity`+`y`, once, stagger, `useReducedMotion`; `MotionConfig reducedMotion="user"`; CSS reduced-motion. Selo `14s linear`, `animation:none` com movimento reduzido; `aria-label` contém texto visível; SVG `aria-hidden`. Sem parallax pesado, sem lib extra.

## Seção de calendário `#agendar`
`BookingCalendar` (responsivo, a11y): navegação de mês, grid semanal, dias fechados/passados/lotados desabilitados, **slots de 1 hora** dentro do funcionamento (placeholder), formulário (nome* / telefone / serviço), `aria-pressed`/`aria-live`/`role`, foco, sem rolagem horizontal. **Anti-duplicação:** UI `disabled` + **servidor `UNIQUE(date,time)` + re-checagem atômica**; `409 slot_taken`. Store async `src/lib/bookings.js` → backend; `bookings:changed`. Também na nav + rodapé.

**Agora com backend** (`server/`): **anti-conflito real entre clientes**; aba do dono usa `GET /api/bookings`. Antes era `localStorage`; hoje servidor. **Guia do dono `/owner.html` construída** (ver abaixo). Horário/serviços placeholder.

## Backend (`server/`, Node puro, sem deps)
`node server/index.js` / `npm run server`. **`node:http` + `node:sqlite` (`DatabaseSync`, síncrono)**, `UNIQUE(date,time)` + re-checagem atômica no mesmo tick → **sem corrida/duplicação**. SQLite `server/data/bookings.db`. `src/lib/slots.js` compartilhado. CORS. **Nada secreto no repo**; `.env`.

**Endpoints:**
- `GET /api/health`
- `GET /api/availability?from&to` — horários tomados (`YYYY-MM-DDTHH:00`), **sem PII**
- `GET /api/slots?date` — `{time, available}`
- `POST /api/bookings` `{date,time,name,phone,service}` — **1h** + funcionamento + não-passado; nome (2+ letras, máx. 80); **WhatsApp obrigatório** (DDD + número BR, salvo como `55…`); `201` / `400 invalid_*` / **`409 slot_taken`** / `409 phone_limit` (máx. `MAX_ACTIVE_PER_PHONE`=2 horários futuros por telefone) / **`429 rate_limited`** (máx. `BOOKING_MAX_PER_IP`=5 tentativas a cada `BOOKING_WINDOW_MIN`=15 min por IP; atrás de proxy defina `TRUST_PROXY=1`) / `413` corpo > 10 KB
- `GET /api/bookings` — dono, **`Authorization: Bearer <OWNER_TOKEN>`**, `503` sem token, `401` se errado
- `DELETE /api/bookings/:id` — dono, token
- `POST /api/bookings/:id/cancel` — dono; **cancela + gera `wa.me`** (mensagem pronta; o dono envia; `sent:false`; **sem Meta**; sem telefone → sem link)
- `POST /api/bookings/:id/reschedule` `{date,time}` — dono; **remarca** (1h + funcionamento + não-passado + **anti-duplicação no novo slot, excluindo o próprio**, `BEGIN/COMMIT/ROLLBACK`, `409 slot_taken`; **libera o horário antigo**) + **gera `wa.me`**; **sem Meta**

**Frontend `src/lib/bookings.js`:** async `addBooking`, `fetchTaken`, `fetchSlots`, `listBookings`, `removeBooking`, `cancelBooking`, `rescheduleBooking`, `VITE_API_URL`, sem `localStorage`. **Testes:** slots puros; backend e2e **29/29**; owner e2e **30/30**; frontend-store **8/8**.

## Guia do dono (`/owner.html`, separada mas interligada)
Página própria (`owner.html`, Vite multi-page, `noindex`), **mesmo backend + `src/lib/slots.js` + calendário de 1h**; link `Guia do dono` da landing + volta. **Token `OWNER_TOKEN`** (`sessionStorage`, não repo).

**Layout de painel (referência de dashboard, 2026-11-27):** **app shell em tela cheia** (`h-screen w-full`, sem margem, sem arredondamento, sem fundo cinza fora; `overflow-hidden`, sidebar `h-screen`, conteúdo rola por dentro, topo fixo), fundo branco, cards brancos com borda fina, **sidebar** `w-264px` (logo, menu `Visão geral` / `Hoje` / `Clientes` / `Configurações`, canais, sair; `mt-auto` no rodapé). No mobile a sidebar vira barra superior + nav horizontal. Cards: **escuro com o total** (agendamentos, hoje, clientes), **ocupação da semana** (7 dias, barras CSS), **ocupação do mês** (% + barra), **Calendário** (tela larga, células 44px) e **Em andamento**. Fecha com **Últimos agendamentos** (nome, telefone, data/hora, serviço, status, ações) e **Baixar CSV**.

**Views:** `Visão geral` (dashboard), `Hoje` (agenda do dia), `Clientes` (agrupado por telefone/nome, nº de agendamentos e próximo), `Configurações` (token mascarado, API, sair, limites). **Calendário do dono** (`OwnerCalendar`): mês + grid, dias com agendamento marcados, dias fechados, clique filtra a lista, `role=grid`/`aria`, responsivo. **Cancelar** (`confirm`, libera horário) e **Remarcar** (data + horário 1h, `slotsForDate`, servidor re-checa; libera antigo). `src/Owner.jsx`, `src/owner-main.jsx`, `src/components` reuso. **Responsivo; Lighthouse 1.0/1.0/1.0.**

### WhatsApp ao cliente — **sem Meta**
`server/notify.js`: **`wa.me`**. Ao cancelar/remarcar, backend monta **mensagem pronta** e devolve `notification.waLink` (`https://wa.me/<numero-cliente>?text=...`, número normalizado `+55`, DDD→`55`, mensagem em pt-BR); a guia **redireciona/abre (`window.open`)** e **o dono só toca em enviar**; também botão. **`sent:false`, `mode:'manual_wa.me'`, `reason`**. **NÃO é envio 100% automático; NÃO usa WhatsApp Business API / Meta; sem credenciais; sem template; sem mensagem se cliente sem telefone; número deve ter consentido; nada secreto.**

**Limites honestos:** **sem auth de cliente**, **sem rate-limit**, **sem TLS/deploy**, token do dono simples (`Bearer`, não comparação constante-tempo; use auth real + `OWNER_TOKEN` forte + `ALLOWED_ORIGINS` restrito), **sem e-mail/confirmação**, **sem pagamento**; `node:sqlite` em arquivo (não distribuído); conflito entre clientes **exige o backend no ar**.

## LGPD, termos e acessibilidade
- **Páginas legais:** `privacidade.html` e `termos.html` (texto em `src/legal/Legal.jsx`). Na prévia viram `#privacidade` e `#termos`.
- **Dados da empresa:** só em `src/lib/empresa.js` (razão social, CNPJ, endereço, e-mail, canal de privacidade, hospedagem). Tudo entre `[colchetes]` aparece **destacado em amarelo** no site até ser preenchido.
- **Retenção:** o servidor apaga reservas `BOOKING_RETENTION_DAYS` (padrão `retencaoDias` = 90) dias depois da data do atendimento, ao iniciar e a cada 6 h (`server/retention.js`). O número aparece na política: mude nos dois lugares. A agenda da prévia (artifact) não tem essa limpeza.
- **Sem cookies, analytics ou pixel.** Se algum dia entrar Google Analytics, Meta Pixel, mapa ou vídeo incorporado, é preciso banner de consentimento **antes** de carregar e atualizar a política.
- **Formulário:** aviso de uso dos dados + aceite obrigatório dos termos (maior de 18 ou responsável). A base legal do agendamento é execução de contrato (LGPD art. 7º, V), não consentimento.
- **Fotos:** autorização de uso de imagem por escrito de cada pessoa que aparece (ver `src/lib/fotos.js`).
- **Acessibilidade:** axe (WCAG 2.2 AA) sem violações em `/`, `/privacidade.html`, `/termos.html` e `/owner.html`, em 390 px e 1280 px; agendamento completo feito só pelo teclado.
- **Os textos legais são rascunho e precisam de revisão de advogado antes de publicar.** Publicar só com HTTPS.

## Antes de publicar (placeholders)
Tudo marcado `PLACEHOLDER` / "Sua foto aqui" / "de exemplo": nome, endereço, **horário/funcionamento**, telefone/WhatsApp, preços/serviços, história, depoimentos, **fotos reais** (trocar `Photo` por `<img>`), redes, mapa, URL canônica/OG, `robots.txt`. **Backend** pra agendamento real. Nenhum dado real inventado.

## Verificação
`npm run build` verde; Lighthouse (build servido): **Accessibility 1.0 / Best Practices 1.0 / SEO 1.0** em `/` e `/owner.html`; sem falhas; sem overflow; sem erros de console. Store `bookings.js` testado em Node `18/18`. **Render conferido por screenshot** (nesta sessão a ferramenta devolveu imagem) e **mobile simulado em iframe de 390px** (a ferramenta não redimensiona a viewport).
