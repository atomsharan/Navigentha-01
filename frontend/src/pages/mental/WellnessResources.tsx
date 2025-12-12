import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const WellnessResources = () => {
  const resources = [
    {
      title: 'Guided Meditations',
      description: 'Collection of mindfulness exercises for different situations',
      icon: '🧘',
      bgColor: 'bg-purple-100',
      buttonColor: 'bg-purple-500 hover:bg-purple-600',
      buttonText: 'Explore Sessions'
    },
    {
      title: 'Self-Help Articles',
      description: 'Evidence-based strategies for managing stress and anxiety',
      icon: '📚',
      bgColor: 'bg-green-100',
      buttonColor: 'bg-green-500 hover:bg-green-600',
      buttonText: 'Read Articles'
    },
    {
      title: 'Breathing Exercises',
      description: 'Quick techniques to calm your mind and reduce stress',
      icon: '🌿',
      bgColor: 'bg-teal-100',
      buttonColor: 'bg-teal-500 hover:bg-teal-600',
      buttonText: 'Start Practice'
    },
    {
      title: 'Thought Exercises',
      description: 'Cognitive techniques to reframe negative thinking patterns',
      icon: '☁️',
      bgColor: 'bg-purple-100',
      buttonColor: 'bg-purple-500 hover:bg-purple-600',
      buttonText: 'Try Exercises'
    },
    {
      title: 'Relaxation Sounds',
      description: 'Ambient sounds and music for relaxation and focus',
      icon: '🎵',
      bgColor: 'bg-green-100',
      buttonColor: 'bg-green-500 hover:bg-green-600',
      buttonText: 'Listen Now'
    },
    {
      title: 'Journaling Prompts',
      description: 'Guided questions to help you reflect and process emotions',
      icon: '📝',
      bgColor: 'bg-teal-100',
      buttonColor: 'bg-teal-500 hover:bg-teal-600',
      buttonText: 'Get Prompts'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Wellness Resources</h1>
          <p className="text-muted-foreground text-lg">Tools and techniques for mental well-being</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <Card key={index} className="bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`w-16 h-16 ${resource.bgColor} rounded-lg flex items-center justify-center text-2xl mb-4`}>
                  {resource.icon}
                </div>
                
                <h3 className="font-bold text-xl mb-3">{resource.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {resource.description}
                </p>
                
                <Button className={`w-full ${resource.buttonColor} text-white`}>
                  {resource.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WellnessResources;