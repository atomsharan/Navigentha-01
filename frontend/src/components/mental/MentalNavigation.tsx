import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Brain, Briefcase } from 'lucide-react';

const MentalNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleThemeSwitch = () => {
    setTheme('career');
    navigate('/career');
  };
  
  const navItems = [
    { path: '/mental', label: 'Dashboard' },
    { path: '/mental/mood-history', label: 'Mood History' },
    { path: '/mental/resources', label: 'Resources' },
    { path: '/mental/emergency', label: 'Emergency Help' },
  ];

  return (
    <nav className="bg-card border-b border-border px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`pb-3 border-b-2 font-medium transition-colors ${
                location.pathname === item.path
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative bg-muted rounded-full p-1 flex items-center">
            <div 
              className="absolute top-1 bottom-1 bg-primary rounded-full transition-all duration-300 ease-in-out"
              style={{ 
                width: 'calc(50% - 4px)', 
                right: '2px',
                transform: 'translateX(0)'
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleThemeSwitch}
              className="relative z-10 bg-transparent text-muted-foreground hover:text-foreground font-medium px-4 py-2"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Career
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="relative z-10 bg-transparent text-primary-foreground font-medium px-4 py-2"
            >
              <Brain className="h-4 w-4 mr-2" />
              Mental
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MentalNavigation;