import React from 'react'
import { createRoot } from 'react-dom/client'
import Owner from './Owner.jsx'
// o painel usa Inter (servida pelo próprio site, sem Google Fonts)
import '@fontsource/inter/latin-300.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-ext-400.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Owner />
  </React.StrictMode>,
)
