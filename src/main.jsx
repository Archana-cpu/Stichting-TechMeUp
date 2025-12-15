import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthWrapper } from './contexts/auth.context.jsx'
import { ToastWrapper } from './contexts/toast.context.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthWrapper>
        <ToastWrapper>
          <App />
        </ToastWrapper>
      </AuthWrapper>
    </BrowserRouter>
  </StrictMode>
)
