import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const MentalDashboard = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [journalEntry, setJournalEntry] = useState('');

  const moods = [
    { emoji: '😰', label: 'Sad' },
    { emoji: '😐', label: 'Okay' },
    { emoji: '😊', label: 'Good' },
    { emoji: '😄', label: 'Great' },
    { emoji: '🤩', label: 'Amazing' }
  ];

  const activities = [
    {
      title: '5-Minute Meditation',
      icon: '🧘',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700'
    },
    {
      title: 'Breathing Exercise',
      icon: '🌿',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700'
    },
    {
      title: 'Gratitude Journal',
      icon: '💡',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">How are you feeling today?</h1>
          <p className="text-muted-foreground text-lg">Take a moment to check in with yourself</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mood Check */}
          <Card className="lg:col-span-2 bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Today's Mood Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center space-x-6">
                {moods.map((mood, index) => (
                  <div 
                    key={index} 
                    className={`text-center cursor-pointer p-4 rounded-lg transition-colors ${
                      selectedMood === mood.label ? 'bg-accent' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedMood(mood.label)}
                  >
                    <div className="text-4xl mb-2">{mood.emoji}</div>
                    <div className="text-sm font-medium">{mood.label}</div>
                  </div>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Quick Journal (Optional)</label>
                <Textarea 
                  placeholder="What's on your mind today?"
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                Save Today's Entry
              </Button>
            </CardContent>
          </Card>

          {/* This Week Stats */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">This Week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mood Average</span>
                <div className="flex items-center">
                  <span className="text-secondary font-semibold mr-2">Good</span>
                  <span className="text-2xl">😊</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Journal Entries</span>
                <span className="font-bold text-2xl">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mindful Minutes</span>
                <span className="font-bold text-2xl text-secondary">45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-ins</span>
                <span className="font-bold text-2xl">7/7</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wellness Activities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activities.map((activity, index) => (
            <Card key={index} className="bg-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto ${activity.bgColor} rounded-full flex items-center justify-center text-2xl mb-4`}>
                  {activity.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{activity.title}</h3>
                <Button 
                  variant="outline" 
                  className={`w-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground`}
                >
                  Start Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentalDashboard;