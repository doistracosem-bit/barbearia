// Entrada de privacidade.html e termos.html. A página escolhe o documento por <body data-doc>.
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Privacidade, Termos } from './legal/Legal.jsx'
import { ROTAS_SITE } from './legal/rotas.js'
import './fonts.js'
import './index.css'

const Doc = document.body.dataset.doc === 'termos' ? Termos : Privacidade

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Doc homeHref={ROTAS_SITE.home} links={ROTAS_SITE} />
  </React.StrictMode>,
)
