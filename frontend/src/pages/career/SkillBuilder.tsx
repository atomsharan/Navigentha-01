import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Database, Palette, GitBranch, Smartphone, Code } from 'lucide-react';

const SkillBuilder = () => {
  const skills = [
    {
      title: 'React Hooks',
      description: 'Master useState, useEffect, and custom hooks',
      duration: '45 min',
      level: 'Intermediate',
      icon: <Code className="w-6 h-6" />,
      bgColor: 'bg-accent'
    },
    {
      title: 'Database Design',
      description: 'Learn SQL, NoSQL, and data modeling',
      duration: '2 hours',
      level: 'Advanced',
      icon: <Database className="w-6 h-6" />,
      bgColor: 'bg-primary'
    },
    {
      title: 'UI/UX Basics',
      description: 'Design principles for developers',
      duration: '30 min',
      level: 'Beginner',
      icon: <Palette className="w-6 h-6" />,
      bgColor: 'bg-accent'
    },
    {
      title: 'Git & GitHub',
      description: 'Version control mastery',
      duration: '1 hour',
      level: 'Beginner',
      icon: <GitBranch className="w-6 h-6" />,
      bgColor: 'bg-secondary'
    },
    {
      title: 'API Development',
      description: 'Build RESTful APIs with Node.js',
      duration: '3 hours',
      level: 'Advanced',
      icon: <Code className="w-6 h-6" />,
      bgColor: 'bg-accent'
    },
    {
      title: 'Mobile Development',
      description: 'React Native fundamentals',
      duration: '4 hours',
      level: 'Intermediate',
      icon: <Smartphone className="w-6 h-6" />,
      bgColor: 'bg-secondary'
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Skill Builder</h1>
          <p className="text-muted-foreground text-lg">Micro-modules to boost your expertise</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, index) => (
            <Card key={index} className="bg-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 ${skill.bgColor} rounded-lg flex items-center justify-center text-white`}>
                    {skill.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{skill.title}</h3>
                    <p className="text-muted-foreground text-sm">{skill.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {skill.duration}
                  </div>
                  <Badge className={getLevelColor(skill.level)}>
                    {skill.level}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillBuilder;