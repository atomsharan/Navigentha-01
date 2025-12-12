import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, TrendingUp } from 'lucide-react';

interface CareerDashboardProps {
  // Replace `any` with the actual type of your dashboard data
  dashboardData: any;
  onReset: () => void;
}

export function CareerDashboard({ dashboardData, onReset }: CareerDashboardProps) {
  const summary = dashboardData?.summary || {};
  const suggestedCareers = dashboardData?.suggestedCareers || [];
  const nextSteps = dashboardData?.nextSteps || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Your Personalized Career Dashboard</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {summary.greeting || "Based on your assessment, here's what we recommend for you:"}
        </p>
      </div>

      {/* Summary Section */}
      {summary.text && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Your Profile Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">
              {summary.text}
            </p>
            {summary.recommendation && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                {summary.recommendation}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommended Career Paths */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Recommended Career Paths
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestedCareers.length > 0 ? (
            suggestedCareers.map((career: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <h4 className="font-medium text-foreground">{career.title || `Career Path ${index + 1}`}</h4>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((career.confidence || 0.75) * 100)}% Match
                  </p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {career.confidence >= 0.8 ? "Great Fit" : career.confidence >= 0.7 ? "Good Match" : "Consider"}
                </Badge>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Software Engineer</h4>
                <p className="text-xs text-muted-foreground">85% Match</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Great Fit
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Career Roadmap / Next Steps */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            Your Career Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nextSteps.length > 0 ? (
              nextSteps.map((step: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-foreground flex-1">{step}</p>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold mt-0.5">
                    1
                  </div>
                  <p className="text-sm text-foreground flex-1">Strengthen your core skills in your area of interest</p>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold mt-0.5">
                    2
                  </div>
                  <p className="text-sm text-foreground flex-1">Build practical projects to showcase your abilities</p>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold mt-0.5">
                    3
                  </div>
                  <p className="text-sm text-foreground flex-1">Seek mentorship or guidance from professionals</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={onReset}
        variant="outline" 
        className="w-full text-sm"
      >
        Take Assessment Again
      </Button>
    </div>
  );
}