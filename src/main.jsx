import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import Studio from './Studio.jsx';
import './app.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Studio />
  </StrictMode>
);

// PWA: installable, offline-capable, and registered as the handler for .pinwheel files.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .catch(err => console.warn('Service worker registration failed:', err));
  });
}
