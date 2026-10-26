import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AnalysisProvider } from './state/AnalysisContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <AnalysisProvider>
        <App />
      </AnalysisProvider>
    </HashRouter>
  </React.StrictMode>
);
