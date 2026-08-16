import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './sw-register';
import { initSentry } from './lib/sentry';

// Initialize Sentry error monitoring as early as possible
initSentry();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

registerServiceWorker();
