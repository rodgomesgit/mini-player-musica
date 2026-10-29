import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/bricolage-grotesque'
import './index.css'
import App from './App.jsx'
import { avisarAppPronto, verificarAtualizacao } from './lib/atualizacao.js'

avisarAppPronto()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

verificarAtualizacao()
