import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/bricolage-grotesque'
import '../index.css'
import { Admin } from './Admin.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Admin />
  </StrictMode>,
)
