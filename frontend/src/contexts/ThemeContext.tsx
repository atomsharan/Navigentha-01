import React, { createContext, useContext, useState, ReactNode } from 'react';

type Theme = 'career' | 'mental';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('career');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme === 'career' ? 'career-theme' : 'mental-theme'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};