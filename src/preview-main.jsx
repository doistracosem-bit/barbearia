// Entrada da prévia publicada como artifact: um único HTML com a landing e,
// em #dono, o painel do dono. Os dois usam o mesmo banco (src/lib/agenda-preview.js).
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import App from './App.jsx'
import Owner from './Owner.jsx'
import './index.css'

const OWNER_HASH = '#dono'

function Preview() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => {
    if (hash === OWNER_HASH) { window.scrollTo(0, 0); return }
    // ao voltar do painel para #agendar etc., rola até a seção
    const el = hash && document.getElementById(hash.slice(1))
    if (el) requestAnimationFrame(() => el.scrollIntoView())
  }, [hash])
  return hash === OWNER_HASH ? <Owner /> : <App ownerHref={OWNER_HASH} />
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <Preview />
    </MotionConfig>
  </React.StrictMode>,
)
