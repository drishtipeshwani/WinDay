import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className='main-ctn'>
      <App />
    </div>
  </StrictMode>,
)
