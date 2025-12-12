import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FloatingChatbot } from '@/components/chatbot/FloatingChatbot';
import { 
  Building, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  Clock, 
  Users, 
  Search,
  Filter,
  ExternalLink,
  Star,
  Heart,
  Share2,
  TrendingUp,
  Target,
  Bookmark
} from 'lucide-react';
import { useJobs } from '@/contexts/JobsContext';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { useAuth } from '@/contexts/AuthContext';

const JobsInternships = () => {
  const { jobs, internships, personalizedJobs, isLoading, searchJobs } = useJobs();
  const { roadmapItems } = useRoadmap();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  
  // Get user skills from roadmap and profile
  const userSkills = roadmapItems.flatMap(item => item.skills);
  const userInterests = roadmapItems.map(item => item.title.toLowerCase());
  
  // Get personalized jobs based on user profile
  const personalizedJobRecommendations = personalizedJobs.length > 0 ? personalizedJobs : 
    searchJobs('', { type: 'all' }).slice(0, 6);
  
  const filteredJobs = searchJobs(searchTerm, {
    type: selectedType === 'all' ? undefined : selectedType,
    location: selectedLocation === 'all' ? undefined : selectedLocation,
    source: selectedSource === 'all' ? undefined : selectedSource
  });
  
  const filteredInternships = internships.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });
  
  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };
  
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'linkedin':
        return '💼';
      case 'naukri':
        return '🔍';
      case 'fiverr':
        return '🎯';
      case 'company':
        return '🏢';
      default:
        return '💼';
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'bg-green-100 text-green-800';
      case 'part-time':
        return 'bg-blue-100 text-blue-800';
      case 'contract':
        return 'bg-purple-100 text-purple-800';
      case 'internship':
        return 'bg-pink-100 text-pink-800';
      case 'freelance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="h-8 w-8 text-primary" />
            <Badge className="bg-primary/10 text-primary border-primary/20">Career Opportunities</Badge>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Jobs & Internships</h1>
          <p className="text-muted-foreground text-lg">Discover opportunities from LinkedIn, Naukri, Fiverr and more, perfectly matched to your skills</p>
        </div>

        <Tabs defaultValue="all-jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all-jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              All Jobs ({filteredJobs.length})
            </TabsTrigger>
            <TabsTrigger value="internships" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Internships ({filteredInternships.length})
            </TabsTrigger>
            <TabsTrigger value="personalized" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              For You ({personalizedJobRecommendations.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Saved ({savedJobs.length})
            </TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search jobs by title, company, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote</option>
              <option value="bangalore">Bangalore</option>
              <option value="mumbai">Mumbai</option>
              <option value="hyderabad">Hyderabad</option>
              <option value="pune">Pune</option>
            </select>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Sources</option>
              <option value="linkedin">LinkedIn</option>
              <option value="naukri">Naukri</option>
              <option value="fiverr">Fiverr</option>
              <option value="company">Company Direct</option>
            </select>
          </div>

          <TabsContent value="all-jobs" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading jobs...</p>
              </div>
            ) : (
        <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <Badge className={getTypeColor(job.type)}>
                                {job.type.replace('-', ' ')}
                              </Badge>
                              {job.isUrgent && (
                                <Badge className="bg-red-100 text-red-800">
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDate(job.postedDate)}
                              </div>
                              <div className="flex items-center gap-1">
                                <span>{getSourceIcon(job.source)}</span>
                                {job.source}
                              </div>
                              {job.isRemote && (
                                <Badge variant="outline" className="text-xs">
                                  Remote
                                </Badge>
                              )}
                            </div>
                          </div>
                    </div>
                        <div className="flex items-center gap-2">
                          {job.matchScore && (
                            <Badge className="bg-green-100 text-green-800">
                              {job.matchScore}% match
                        </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSaveJob(job.id)}
                            className={savedJobs.includes(job.id) ? 'text-red-500' : 'text-muted-foreground'}
                          >
                            <Heart className={`h-4 w-4 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4">{job.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center text-lg font-semibold text-green-600">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.salary}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="h-4 w-4 mr-1" />
                            {job.experience}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => window.open(job.applyUrl, '_blank')}
                            className="bg-primary hover:bg-primary/90 text-white"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Apply
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-1">
                        {job.skills.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            +{job.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="internships" className="space-y-6">
            <div className="space-y-6">
              {filteredInternships.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow border-pink-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
                          <Bookmark className="h-6 w-6 text-pink-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <Badge className="bg-pink-100 text-pink-800">
                              Internship
                            </Badge>
                            {job.isUrgent && (
                              <Badge className="bg-red-100 text-red-800">
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDate(job.postedDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <span>{getSourceIcon(job.source)}</span>
                              {job.source}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.matchScore && (
                          <Badge className="bg-green-100 text-green-800">
                            {job.matchScore}% match
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaveJob(job.id)}
                          className={savedJobs.includes(job.id) ? 'text-red-500' : 'text-muted-foreground'}
                        >
                          <Heart className={`h-4 w-4 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{job.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-lg font-semibold text-pink-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {job.salary}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          {job.experience}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => window.open(job.applyUrl, '_blank')}
                          className="bg-pink-600 hover:bg-pink-700 text-white"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Apply
                        </Button>
                  </div>
                </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="personalized" className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Personalized for You</h3>
              </div>
              <p className="text-purple-700 text-sm">
                These jobs are recommended based on your roadmap skills: {userSkills.slice(0, 3).join(', ')}
                {userSkills.length > 3 && ` and ${userSkills.length - 3} more`}
              </p>
            </div>
            <div className="space-y-6">
              {personalizedJobRecommendations.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <Badge className={getTypeColor(job.type)}>
                              {job.type.replace('-', ' ')}
                            </Badge>
                            <Badge className="bg-purple-100 text-purple-800">
                              Recommended
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDate(job.postedDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <span>{getSourceIcon(job.source)}</span>
                              {job.source}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.matchScore && (
                          <Badge className="bg-green-100 text-green-800">
                            {job.matchScore}% match
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaveJob(job.id)}
                          className={savedJobs.includes(job.id) ? 'text-red-500' : 'text-muted-foreground'}
                        >
                          <Heart className={`h-4 w-4 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{job.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-lg font-semibold text-green-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {job.salary}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          {job.experience}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => window.open(job.applyUrl, '_blank')}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Apply
                        </Button>
                    </div>
                  </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Saved Jobs</h3>
              <p className="text-muted-foreground">
                {savedJobs.length === 0 
                  ? "You haven't saved any jobs yet. Click the heart icon on any job to save it."
                  : `You have ${savedJobs.length} saved jobs.`
                }
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Chatbot */}
      <FloatingChatbot />
    </div>
  );
};

export default JobsInternships;