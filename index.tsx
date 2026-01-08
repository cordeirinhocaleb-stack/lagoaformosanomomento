import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// PRODUCTION LOG SUPPRESSION
// Inclui dev.webgho.com como ambiente de "produção" para fins de logs limpos
const isProduction = process.env.NODE_ENV === 'production' || window.location.hostname.includes('webgho.com');

if (isProduction) {
  console.log = () => { };
  console.warn = () => { };
  console.error = () => { };
  // Keep console.info for critical debug if needed, or suppress it too
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
