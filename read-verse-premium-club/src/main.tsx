import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize performance monitoring only in production
if (import.meta.env.PROD) {
  import('./lib/performance').then(({ default: performanceMonitor }) => {
    performanceMonitor.init();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
