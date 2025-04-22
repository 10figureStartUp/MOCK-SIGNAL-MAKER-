import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import theme from './theme';

// Get the root element
const container = document.getElementById('root');

// Make sure container exists before proceeding
if (container) {
  // Create a root
  const root = createRoot(container);
  
  // Render app to root
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Normalizes CSS and applies theme background */}
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}

// Register the service worker from the public folder
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}