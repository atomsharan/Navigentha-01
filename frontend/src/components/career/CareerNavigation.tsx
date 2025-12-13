import React from 'react';
import { Link, useLocation } from 'react-router-dom';
const CareerNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/career', label: 'Dashboard' },
    { path: '/career/roadmap', label: 'Career Roadmap' },
    { path: '/career/skill-builder', label: 'Skill Builder' },
    { path: '/career/jobs', label: 'Jobs & Internships' },
    { path: '/career/mentors', label: 'Mentors & Community' },
    { path: '/chatbot', label: 'AI Mentor' },
  ];

  return (
    <nav className="bg-card border-b border-border px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`pb-3 border-b-2 font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? 'border-primary text-primary'
                  : item.path === '/chatbot'
                  ? 'border-transparent text-purple-600 hover:text-purple-700 hover:border-purple-300'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
              }`}
            >
              {item.path === '/chatbot' && '🤖 '}
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CareerNavigation;