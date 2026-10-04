import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'

// HashRouter вместо BrowserRouter: на GitHub Pages нет сервера, который умеет
// отдавать index.html на любой путь, поэтому обновление страницы на разделе
// с обычным роутером давало бы 404. С хэшем (#/kanji) всё остаётся на клиенте.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
