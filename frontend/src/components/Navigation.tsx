import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleThemeSwitch = (newTheme: 'career' | 'mental') => {
    setTheme(newTheme);
    if (newTheme === 'career') {
      navigate('/career');
    } else {
      navigate('/mental');
    }
  };

  // Only show on homepage
  if (location.pathname === '/') {
    return (
      <header className="bg-background border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">NEXORA</h1>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')}
              className="text-foreground hover:text-primary"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/register')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-primary text-primary-foreground px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Button 
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-2xl font-bold text-primary-foreground hover:text-primary-foreground/80 p-0"
        >
          NEXORA
        </Button>
      </div>
    </header>
  );
};

export default Navigation;