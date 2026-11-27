// Entrada da prévia publicada como artifact: um único HTML com a landing e,
// em #dono, o painel do dono. Os dois usam o mesmo banco (src/lib/agenda-preview.js).
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import App from './App.jsx'
import Owner from './Owner.jsx'
import { Privacidade, Termos } from './legal/Legal.jsx'
import { ROTAS_PREVIA } from './legal/rotas.js'
import './fonts.js'
import './index.css'

const OWNER_HASH = '#dono'
const PAGINAS = { [OWNER_HASH]: true, [ROTAS_PREVIA.privacidade]: true, [ROTAS_PREVIA.termos]: true }

function Preview() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => {
    if (PAGINAS[hash]) { window.scrollTo(0, 0); return }
    // ao voltar do painel para #agendar etc., rola até a seção
    const el = hash && document.getElementById(hash.slice(1))
    if (el) requestAnimationFrame(() => el.scrollIntoView())
  }, [hash])
  if (hash === OWNER_HASH) return <Owner />
  if (hash === ROTAS_PREVIA.privacidade) return <Privacidade homeHref={ROTAS_PREVIA.home} links={ROTAS_PREVIA} />
  if (hash === ROTAS_PREVIA.termos) return <Termos homeHref={ROTAS_PREVIA.home} links={ROTAS_PREVIA} />
  return <App ownerHref={OWNER_HASH} rotas={ROTAS_PREVIA} />
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <Preview />
    </MotionConfig>
  </React.StrictMode>,
)
