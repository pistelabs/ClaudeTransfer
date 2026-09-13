import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

/**
 * The standalone dev shell — `npm run dev` and nothing else.
 *
 * A host application does not use this file. It imports `Scheduler` from
 * `src/index.ts`, mounts it wherever it likes, and brings its own data; see the
 * note at the top of that file for the order.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
