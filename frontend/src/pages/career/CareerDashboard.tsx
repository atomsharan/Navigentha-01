import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FloatingChatbot } from '@/components/chatbot/FloatingChatbot';
import { 
  Monitor, Target, Award, Briefcase, GraduationCap, TrendingUp, BookOpen, Clock, 
  Users, Star, MessageCircle, ArrowRight, Calendar, BarChart3, Activity, Zap, 
  TrendingDown, Eye, Heart, Share2, ExternalLink, MapPin, User, 
  Settings, Bell, CheckCircle, AlertCircle, Plus, Minus
} from 'lucide-react';
import { useTrendingCareers } from '@/contexts/TrendingCareersContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { useMentors } from '@/contexts/MentorsContext';
import { useJobs } from '@/contexts/JobsContext';

interface UserProfile {
  name: string;
  currentPath: string;
  progress: number;
  skills: string[];
  completedCourses: number;
  skillsGained: number;
  level: string;
  nextMilestone: string;
  streak: number;
  achievements: string[];
  connectionsCount: number;
  profileViews: number;
  lastActive: string;
}

const CareerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trendingCareers, isLoading: careersLoading, error: careersError } = useTrendingCareers();
  const { roadmapItems } = useRoadmap();
  const { mentors } = useMentors();
  const { jobs, internships, getPersonalizedJobs } = useJobs();
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: user?.username || user?.first_name || 'Student',
    currentPath: 'Software Engineering',
    progress: 68,
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Git'],
    completedCourses: 3,
    skillsGained: 2,
    level: 'Intermediate',
    nextMilestone: 'Build a Full-Stack Application',
    streak: 7,
    achievements: ['First Project', 'Code Review Master', 'Team Player'],
    connectionsCount: 0,
    profileViews: 0,
    lastActive: '2 hours ago'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [personalizedJobs, setPersonalizedJobs] = useState<any[]>([]);
  const [recommendedMentors, setRecommendedMentors] = useState<any[]>([]);

  // Get user skills from roadmap
  const userSkills = roadmapItems.flatMap(item => item.skills);
  const completedRoadmapItems = roadmapItems.filter(item => item.status === 'completed').length;
  const inProgressRoadmapItems = roadmapItems.filter(item => item.status === 'in-progress').length;
  const pendingTasksCount = roadmapItems.filter(item => item.status === 'pending').length;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate loading user profile data
        setTimeout(() => {
          setUserProfile(prev => ({
            ...prev,
            completedCourses: Math.floor(Math.random() * 5) + 1,
            studyHours: Math.floor(Math.random() * 20) + 5,
            skillsGained: Math.floor(Math.random() * 5) + 1,
            totalEarnings: Math.floor(Math.random() * 5000) + 1000,
            connectionsCount: Math.floor(Math.random() * 50) + 10,
            profileViews: Math.floor(Math.random() * 100) + 20,
            lastActive: '2 hours ago'
          }));
          
          // Generate recent activity
          setRecentActivity([
            { id: 1, type: 'course_completed', title: 'Completed React Advanced Patterns', time: '2 hours ago', icon: CheckCircle },
            { id: 2, type: 'job_applied', title: 'Applied to Senior Developer at Microsoft', time: '1 day ago', icon: Briefcase },
            { id: 3, type: 'mentor_connected', title: 'Connected with Sarah Chen', time: '2 days ago', icon: Users },
            { id: 4, type: 'skill_added', title: 'Added TypeScript to skills', time: '3 days ago', icon: Award },
            { id: 5, type: 'roadmap_updated', title: 'Updated career roadmap', time: '1 week ago', icon: Target }
          ]);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Get personalized jobs based on user skills
    if (userSkills.length > 0) {
      const personalized = getPersonalizedJobs(userSkills, []);
      setPersonalizedJobs(personalized.slice(0, 3));
    }
    
    // Get recommended mentors
    setRecommendedMentors(mentors.slice(0, 3));
  }, [userSkills, mentors, getPersonalizedJobs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Professional Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.name}`} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-primary to-accent text-white">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">
                  Welcome back, {userProfile.name}
                </h1>
                <div className="flex items-center gap-4 text-slate-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Last active {userProfile.lastActive}</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    {userProfile.level} Level
                  </Badge>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    🔥 {userProfile.streak} day streak
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                size="sm"
                onClick={() => navigate('/chatbot')}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                AI Mentor
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Profile Views</p>
                  <p className="text-2xl font-bold text-blue-900">{userProfile.profileViews}</p>
                  <p className="text-xs text-blue-600">+12% this week</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Connections</p>
                  <p className="text-2xl font-bold text-green-900">{userProfile.connectionsCount}</p>
                  <p className="text-xs text-green-600">+3 this week</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Pending Tasks</p>
                  <p className="text-2xl font-bold text-slate-900">{pendingTasksCount}</p>
                  <p className="text-xs text-slate-600">To be completed</p>
                </div>
                <Clock className="h-8 w-8 text-slate-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Tasks Table */}
        <Card className="bg-white shadow-xl border border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl border-b border-slate-200">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {roadmapItems.filter(item => item.status === 'pending').length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-300">
                      <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">#</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">Title</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">Priority</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">Estimated Time</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">Skills</th>
                      <th className="text-left py-4 px-4 text-sm font-bold text-slate-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roadmapItems
                      .filter(item => item.status === 'pending')
                      .map((item, index) => (
                        <tr 
                          key={item.id} 
                          className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-slate-900 mb-1">{item.title}</div>
                            <div className="text-xs text-slate-500">{item.description.substring(0, 80)}...</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge 
                              className={
                                item.priority === 'high' 
                                  ? 'bg-red-100 text-red-800 border-red-200' 
                                  : item.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  : 'bg-green-100 text-green-800 border-green-200'
                              }
                            >
                              {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-sm text-slate-700">
                              <Clock className="h-4 w-4 text-slate-400" />
                              <span>{item.estimatedTime || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1">
                              {item.skills.slice(0, 2).map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {item.skills.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{item.skills.length - 2}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="bg-slate-100 text-slate-800 border-slate-200">
                              Pending
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No pending tasks at the moment</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Learning Progress & Roadmap */}
          <Card className="lg:col-span-2 bg-white shadow-xl border border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl border-b border-slate-200">
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Learning Progress & Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-900">{completedRoadmapItems}</div>
                  <div className="text-sm text-blue-600">Completed</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-2xl font-bold text-orange-900">{inProgressRoadmapItems}</div>
                  <div className="text-sm text-orange-600">In Progress</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-2xl font-bold text-slate-900">{roadmapItems.length - completedRoadmapItems - inProgressRoadmapItems}</div>
                  <div className="text-sm text-slate-600">Pending</div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="font-semibold text-slate-900">{userProfile.currentPath} Path</span>
                    <p className="text-sm text-slate-600">Overall Progress</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">{userProfile.progress}%</Badge>
                </div>
                <Progress value={userProfile.progress} className="h-3" />
              </div>
              
              <div className="space-y-4">
              <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-900">JavaScript Fundamentals</span>
                    <Badge className="bg-blue-100 text-blue-800">85%</Badge>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-900">React Development</span>
                    <Badge className="bg-orange-100 text-orange-800">42%</Badge>
                  </div>
                  <Progress value={42} className="h-2" />
              </div>
              <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-900">TypeScript & Git</span>
                    <Badge className="bg-purple-100 text-purple-800">28%</Badge>
                  </div>
                  <Progress value={28} className="h-2" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-slate-900">Next Milestone:</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/career/roadmap')}
                    className="text-primary border-primary hover:bg-primary hover:text-white"
                  >
                    View Roadmap
                  </Button>
                </div>
                <p className="text-sm text-slate-600 mt-1">{userProfile.nextMilestone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity & Quick Stats */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="bg-white shadow-xl border border-slate-200">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl border-b border-slate-200">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {recentActivity.map((activity) => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <IconComponent className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                          <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-3 text-slate-600 hover:text-slate-900"
                >
                  View All Activity
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white shadow-xl border border-slate-200">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl border-b border-slate-200">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-900">{userProfile.completedCourses}</div>
                    <div className="text-xs text-blue-600">Courses</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-900">{userProfile.skillsGained}</div>
                    <div className="text-xs text-green-600">Skills</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Learning Streak</span>
                    <span className="font-semibold text-slate-900">{userProfile.streak} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recommended Jobs */}
          <Card className="bg-white shadow-xl border border-slate-200">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-t-xl border-b border-emerald-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  Recommended Jobs
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/career/jobs')}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {personalizedJobs.length > 0 ? personalizedJobs.map((job) => (
                  <div key={job.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-sm">{job.title}</h4>
                        <p className="text-xs text-slate-600">{job.company}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                            {job.matchScore}% match
                          </Badge>
                          <span className="text-xs text-slate-500">{job.location}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(job.applyUrl, '_blank')}
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-slate-500">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm">No personalized jobs yet</p>
                    <p className="text-xs">Complete your roadmap to get recommendations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Mentors */}
          <Card className="bg-white shadow-xl border border-slate-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-xl border-b border-purple-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Recommended Mentors
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/career/mentors')}
                  className="text-purple-600 hover:text-purple-700"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {recommendedMentors.map((mentor) => (
                  <div key={mentor.id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={mentor.image} />
                        <AvatarFallback className="text-xs">
                          {mentor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-sm">{mentor.name}</h4>
                        <p className="text-xs text-slate-600">{mentor.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs text-slate-600">{mentor.rating}</span>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            {mentor.availability}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(mentor.linkedin, '_blank')}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        Connect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trending Careers & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trending Careers */}
          <Card className="lg:col-span-2 bg-white shadow-xl border border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Trending Careers
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/career/jobs')}
                  className="text-primary hover:text-primary/80"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {careersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-slate-500 mt-2">Loading trending careers...</p>
                </div>
              ) : careersError ? (
                <div className="text-center py-8">
                  <p className="text-red-500">Error loading careers: {careersError}</p>
                </div>
              ) : trendingCareers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trendingCareers.slice(0, 4).map((career) => (
                    <div key={career.id} className="group p-4 border border-slate-200 rounded-lg hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors text-sm">{career.title}</h3>
                        <Badge className="bg-emerald-100 text-emerald-800 text-xs font-medium">
                          +{career.growth}%
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mb-2 font-medium">{career.salary}</p>
                      <div className="flex flex-wrap gap-1">
                        {career.skills.slice(0, 2).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs hover:bg-primary/5 transition-colors">
                            {skill}
                          </Badge>
                        ))}
                        {career.skills.length > 2 && (
                          <Badge variant="outline" className="text-xs text-slate-500">
                            +{career.skills.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No trending careers available at the moment.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white shadow-xl border border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl border-b border-slate-200">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Button 
                className="w-full justify-start bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                onClick={() => navigate('/chatbot')}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Ask AI Mentor
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={() => navigate('/career/roadmap')}
              >
                <Target className="h-4 w-4 mr-2" />
                View Roadmap
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={() => navigate('/career/jobs')}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={() => navigate('/career/mentors')}
              >
                <Users className="h-4 w-4 mr-2" />
                Find Mentors
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Professional Footer */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-2xl border-0">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <GraduationCap className="h-8 w-8 text-emerald-400" />
                <h3 className="text-2xl font-bold">Ready to accelerate your career?</h3>
              </div>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                Join thousands of professionals who are already using our platform to advance their careers. 
                Get personalized guidance, connect with mentors, and land your dream job.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
                  onClick={() => navigate('/chatbot')}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Start with AI Mentor
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-slate-300 text-slate-300 hover:bg-slate-700 hover:text-white px-8 py-3"
                  onClick={() => navigate('/career/roadmap')}
                >
                  <Target className="h-5 w-5 mr-2" />
                  Create Roadmap
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Chatbot */}
      <FloatingChatbot />
    </div>
  );
};

export default CareerDashboard;