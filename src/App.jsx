import React, { createContext, useContext, useEffect, useState } from "react";
import Routes from "./Routes";

export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pv_theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('pv_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Routes />
    </ThemeContext.Provider>
  );
}

export default App;
