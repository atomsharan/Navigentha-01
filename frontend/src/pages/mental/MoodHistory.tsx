import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const MoodHistory = () => {
  const weekMoods = [
    { day: 'Monday', mood: 'Good', emoji: '😊', progress: 75 },
    { day: 'Tuesday', mood: 'Good', emoji: '😊', progress: 75 },
    { day: 'Wednesday', mood: 'Great', emoji: '😄', progress: 85 },
    { day: 'Thursday', mood: 'Good', emoji: '😊', progress: 75 },
    { day: 'Friday', mood: 'Good', emoji: '😊', progress: 75 }
  ];

  const calendarDays = [
    { date: 2, mood: '😊', active: true },
    { date: 3, mood: '😊', active: true },
    { date: 4, mood: '😄', active: true },
    { date: 5, mood: '😊', active: true },
    { date: 6, mood: '😊', active: true },
  ];

  const journalEntries = [
    {
      date: 'December 6, 2024',
      mood: '😊',
      entry: 'Had a great day working on my React project. Feeling confident about my progress and excited for what\'s next.',
      borderColor: 'border-l-green-400'
    },
    {
      date: 'December 5, 2024',
      mood: '😊',
      entry: 'Connected with a mentor today. Feeling supported and motivated to keep learning.',
      borderColor: 'border-l-green-400'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Mood History</h1>
          <p className="text-muted-foreground text-lg">Track your emotional journey over time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* This Week's Mood */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">This Week's Mood</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {weekMoods.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-muted-foreground w-20">{day.day}</span>
                  <div className="flex-1 mx-4">
                    <Progress value={day.progress} className="h-2" />
                  </div>
                  <span className="text-2xl">{day.emoji}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Calendar View */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">December 2024</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                <div className="font-medium text-muted-foreground">S</div>
                <div className="font-medium text-muted-foreground">M</div>
                <div className="font-medium text-muted-foreground">T</div>
                <div className="font-medium text-muted-foreground">W</div>
                <div className="font-medium text-muted-foreground">T</div>
                <div className="font-medium text-muted-foreground">F</div>
                <div className="font-medium text-muted-foreground">S</div>
                
                <div></div>
                {calendarDays.map((day, index) => (
                  <div key={index} className="p-2 rounded bg-accent text-accent-foreground font-medium flex flex-col items-center">
                    <div>{day.date}</div>
                    <div className="text-lg">{day.mood}</div>
                  </div>
                ))}
                
                {/* Fill remaining days */}
                {Array.from({ length: 7 - calendarDays.length - 1 }, (_, i) => (
                  <div key={i + 7} className="p-2 text-muted-foreground">
                    {i + 7}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Journal Entries */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Recent Journal Entries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {journalEntries.map((entry, index) => (
              <div key={index} className={`border-l-4 ${entry.borderColor} pl-4 py-2`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">{entry.date}</span>
                  <span className="text-2xl">{entry.mood}</span>
                </div>
                <p className="text-foreground">{entry.entry}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoodHistory;