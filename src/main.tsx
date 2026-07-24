import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DuckDBProvider } from './context/DuckDBContext';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* DuckDBProvider initialises WASM once and shares the connection app-wide */}
    <DuckDBProvider>
      <App />
    </DuckDBProvider>
  </StrictMode>
);
