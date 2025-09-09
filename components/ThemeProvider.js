import { useState, useEffect, createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('blue');

  const themes = {
    dark: {
      name: 'Karanlık',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      border: '#334155'
    },
    light: {
      name: 'Aydınlık',
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0'
    },
    cosmic: {
      name: 'Kozmik',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundSecondary: 'rgba(102, 126, 234, 0.1)',
      text: '#ffffff',
      textSecondary: '#e2e8f0',
      border: 'rgba(255, 255, 255, 0.2)'
    },
    nature: {
      name: 'Doğa',
      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      backgroundSecondary: 'rgba(17, 153, 142, 0.1)',
      text: '#ffffff',
      textSecondary: '#f0fdf4',
      border: 'rgba(255, 255, 255, 0.2)'
    },
    sunset: {
      name: 'Günbatımı',
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      backgroundSecondary: 'rgba(255, 154, 158, 0.1)',
      text: '#1f2937',
      textSecondary: '#4b5563',
      border: 'rgba(0, 0, 0, 0.1)'
    }
  };

  const accentColors = {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    green: '#10b981',
    orange: '#f59e0b',
    pink: '#ec4899',
    red: '#ef4444'
  };

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('studyflow-theme');
    const savedAccent = localStorage.getItem('studyflow-accent');
    
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
    
    if (savedAccent && accentColors[savedAccent]) {
      setAccentColor(savedAccent);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const theme = themes[currentTheme];
    const accent = accentColors[accentColor];
    
    const root = document.documentElement;
    
    // Apply theme variables
    root.style.setProperty('--theme-bg', theme.background);
    root.style.setProperty('--theme-bg-secondary', theme.backgroundSecondary);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-text-secondary', theme.textSecondary);
    root.style.setProperty('--theme-border', theme.border);
    root.style.setProperty('--theme-accent', accent);
    
    // Save to localStorage
    localStorage.setItem('studyflow-theme', currentTheme);
    localStorage.setItem('studyflow-accent', accentColor);
    
    // Add theme class to body
    document.body.className = `theme-${currentTheme} accent-${accentColor}`;
  }, [currentTheme, accentColor]);

  const toggleTheme = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setCurrentTheme(themeKeys[nextIndex]);
    
    // Add transition effect
    document.body.style.transition = 'all 0.5s ease-in-out';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 500);
  };

  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const setAccent = (colorName) => {
    if (accentColors[colorName]) {
      setAccentColor(colorName);
    }
  };

  const value = {
    currentTheme,
    accentColor,
    themes,
    accentColors,
    toggleTheme,
    setTheme,
    setAccent,
    theme: themes[currentTheme],
    accent: accentColors[accentColor]
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};