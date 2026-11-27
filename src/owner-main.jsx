import React from 'react'
import { createRoot } from 'react-dom/client'
import Owner from './Owner.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Owner />
  </React.StrictMode>,
)
