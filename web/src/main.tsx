import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './estilos.css'
import Sysconf from './Sysconf.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sysconf />
  </StrictMode>,
)
