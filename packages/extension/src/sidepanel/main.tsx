// 진입점 (ApiProvider, QueryClient 세팅)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '../App'
import '@san/ui/styles/globals.css'; // ✅ 경로 구체화 + 확장자 포함

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
