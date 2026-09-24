import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tailwind.css';
import './styles/index.css';

// Apply dark mode (orange + dark green theme)
document.documentElement.classList.add('dark');

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<App />);
