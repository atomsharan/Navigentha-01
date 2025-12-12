import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  salary: string;
  experience: string;
  skills: string[];
  description: string;
  postedDate: string;
  source: 'linkedin' | 'naukri' | 'fiverr' | 'indeed' | 'company';
  applyUrl: string;
  companyLogo?: string;
  isRemote: boolean;
  isUrgent: boolean;
  matchScore?: number;
}

interface JobsContextType {
  jobs: Job[];
  internships: Job[];
  personalizedJobs: Job[];
  isLoading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  fetchInternships: () => Promise<void>;
  getPersonalizedJobs: (userSkills: string[], userInterests: string[]) => Job[];
  searchJobs: (query: string, filters?: any) => Job[];
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export const JobsProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [internships, setInternships] = useState<Job[]>([]);
  const [personalizedJobs, setPersonalizedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample jobs data from various sources
  const sampleJobs: Job[] = [
    // LinkedIn Jobs
    {
      id: '1',
      title: 'Senior React Developer',
      company: 'Microsoft',
      location: 'Bangalore, India',
      type: 'full-time',
      salary: '₹15-25 LPA',
      experience: '3-5 years',
      skills: ['React', 'JavaScript', 'TypeScript', 'Redux', 'Node.js'],
      description: 'We are looking for a passionate React developer to join our team and build amazing user experiences.',
      postedDate: '2024-01-15',
      source: 'linkedin',
      applyUrl: 'https://linkedin.com/jobs/view/1234567890',
      isRemote: true,
      isUrgent: false,
      matchScore: 95
    },
    {
      id: '2',
      title: 'Full Stack Developer',
      company: 'Google',
      location: 'Hyderabad, India',
      type: 'full-time',
      salary: '₹20-35 LPA',
      experience: '4-6 years',
      skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
      description: 'Join Google to build scalable web applications and work on cutting-edge technologies.',
      postedDate: '2024-01-14',
      source: 'linkedin',
      applyUrl: 'https://linkedin.com/jobs/view/1234567891',
      isRemote: false,
      isUrgent: true,
      matchScore: 88
    },
    // Naukri Jobs
    {
      id: '3',
      title: 'Python Developer',
      company: 'TCS',
      location: 'Mumbai, India',
      type: 'full-time',
      salary: '₹8-15 LPA',
      experience: '2-4 years',
      skills: ['Python', 'Django', 'Flask', 'PostgreSQL', 'Git'],
      description: 'TCS is hiring Python developers for exciting projects in fintech and healthcare domains.',
      postedDate: '2024-01-13',
      source: 'naukri',
      applyUrl: 'https://naukri.com/job-listings-python-developer-tcs',
      isRemote: false,
      isUrgent: false,
      matchScore: 75
    },
    {
      id: '4',
      title: 'Data Scientist',
      company: 'Infosys',
      location: 'Pune, India',
      type: 'full-time',
      salary: '₹12-20 LPA',
      experience: '3-5 years',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'SQL'],
      description: 'Work on AI/ML projects and help build intelligent solutions for our clients.',
      postedDate: '2024-01-12',
      source: 'naukri',
      applyUrl: 'https://naukri.com/job-listings-data-scientist-infosys',
      isRemote: true,
      isUrgent: false,
      matchScore: 82
    },
    // Fiverr/Upwork Jobs
    {
      id: '5',
      title: 'React Native App Developer',
      company: 'Freelance Project',
      location: 'Remote',
      type: 'contract',
      salary: '$25-50/hour',
      experience: '2-3 years',
      skills: ['React Native', 'JavaScript', 'Firebase', 'API Integration'],
      description: 'Looking for a React Native developer to build a mobile app for e-commerce platform.',
      postedDate: '2024-01-11',
      source: 'fiverr',
      applyUrl: 'https://fiverr.com/gigs/react-native-developer',
      isRemote: true,
      isUrgent: true,
      matchScore: 70
    },
    {
      id: '6',
      title: 'UI/UX Designer',
      company: 'StartupX',
      location: 'Remote',
      type: 'contract',
      salary: '$30-60/hour',
      experience: '2-4 years',
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Systems'],
      description: 'Design beautiful and intuitive user interfaces for our mobile and web applications.',
      postedDate: '2024-01-10',
      source: 'fiverr',
      applyUrl: 'https://fiverr.com/gigs/ui-ux-designer',
      isRemote: true,
      isUrgent: false,
      matchScore: 65
    },
    // Company Direct Jobs
    {
      id: '7',
      title: 'DevOps Engineer',
      company: 'Amazon',
      location: 'Bangalore, India',
      type: 'full-time',
      salary: '₹18-30 LPA',
      experience: '4-6 years',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'],
      description: 'Join Amazon to build and maintain cloud infrastructure for our global services.',
      postedDate: '2024-01-09',
      source: 'company',
      applyUrl: 'https://amazon.jobs/en/jobs/1234567',
      isRemote: false,
      isUrgent: false,
      matchScore: 90
    },
    {
      id: '8',
      title: 'Product Manager',
      company: 'Flipkart',
      location: 'Bangalore, India',
      type: 'full-time',
      salary: '₹20-35 LPA',
      experience: '5-8 years',
      skills: ['Product Management', 'Agile', 'Analytics', 'User Research', 'Strategy'],
      description: 'Lead product initiatives and drive growth for our e-commerce platform.',
      postedDate: '2024-01-08',
      source: 'company',
      applyUrl: 'https://flipkartcareers.com/jobs/product-manager',
      isRemote: false,
      isUrgent: true,
      matchScore: 85
    }
  ];

  const sampleInternships: Job[] = [
    {
      id: 'i1',
      title: 'Software Development Intern',
      company: 'Microsoft',
      location: 'Hyderabad, India',
      type: 'internship',
      salary: '₹25,000/month',
      experience: '0-1 years',
      skills: ['Python', 'C#', 'Azure', 'Git', 'Problem Solving'],
      description: '6-month internship program for final year students to work on real projects.',
      postedDate: '2024-01-15',
      source: 'linkedin',
      applyUrl: 'https://linkedin.com/jobs/view/intern-1234567890',
      isRemote: false,
      isUrgent: true,
      matchScore: 95
    },
    {
      id: 'i2',
      title: 'Data Science Intern',
      company: 'Google',
      location: 'Bangalore, India',
      type: 'internship',
      salary: '₹30,000/month',
      experience: '0-1 years',
      skills: ['Python', 'Machine Learning', 'Pandas', 'SQL', 'Statistics'],
      description: 'Work on ML models and data analysis projects under senior data scientists.',
      postedDate: '2024-01-14',
      source: 'linkedin',
      applyUrl: 'https://linkedin.com/jobs/view/intern-1234567891',
      isRemote: true,
      isUrgent: false,
      matchScore: 88
    },
    {
      id: 'i3',
      title: 'Frontend Development Intern',
      company: 'Zomato',
      location: 'Gurgaon, India',
      type: 'internship',
      salary: '₹20,000/month',
      experience: '0-1 years',
      skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Responsive Design'],
      description: 'Build user interfaces for our food delivery platform and mobile app.',
      postedDate: '2024-01-13',
      source: 'naukri',
      applyUrl: 'https://naukri.com/job-listings-frontend-intern-zomato',
      isRemote: false,
      isUrgent: false,
      matchScore: 75
    },
    {
      id: 'i4',
      title: 'UI/UX Design Intern',
      company: 'Swiggy',
      location: 'Bangalore, India',
      type: 'internship',
      salary: '₹18,000/month',
      experience: '0-1 years',
      skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Design Thinking'],
      description: 'Design user experiences for our food delivery and grocery platform.',
      postedDate: '2024-01-12',
      source: 'company',
      applyUrl: 'https://swiggy.com/careers/ux-intern',
      isRemote: true,
      isUrgent: true,
      matchScore: 70
    }
  ];

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be API calls to different job sources
      // const linkedinJobs = await api.get('/api/jobs/linkedin');
      // const naukriJobs = await api.get('/api/jobs/naukri');
      // const fiverrJobs = await api.get('/api/jobs/fiverr');
      
      setJobs(sampleJobs);
    } catch (e) {
      setError('Failed to fetch jobs');
      console.error('Error fetching jobs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInternships = async () => {
    setIsLoading(true);
    try {
      setInternships(sampleInternships);
    } catch (e) {
      setError('Failed to fetch internships');
      console.error('Error fetching internships:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonalizedJobs = (userSkills: string[], userInterests: string[]): Job[] => {
    const allJobs = [...jobs, ...internships];
    
    return allJobs.map(job => {
      const skillMatches = job.skills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      ).length;
      
      const interestMatches = userInterests.some(interest =>
        job.title.toLowerCase().includes(interest.toLowerCase()) ||
        job.description.toLowerCase().includes(interest.toLowerCase())
      );
      
      const matchScore = Math.min(100, (skillMatches / job.skills.length) * 70 + (interestMatches ? 30 : 0));
      
      return {
        ...job,
        matchScore: Math.round(matchScore)
      };
    }).filter(job => job.matchScore && job.matchScore >= 60)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  };

  const searchJobs = (query: string, filters: any = {}): Job[] => {
    let results = [...jobs, ...internships];
    
    if (query) {
      results = results.filter(job =>
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    if (filters.type) {
      results = results.filter(job => job.type === filters.type);
    }
    
    if (filters.location) {
      results = results.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase()) ||
        (filters.location === 'remote' && job.isRemote)
      );
    }
    
    if (filters.source) {
      results = results.filter(job => job.source === filters.source);
    }
    
    return results;
  };

  useEffect(() => {
    fetchJobs();
    fetchInternships();
  }, []);

  return (
    <JobsContext.Provider value={{
      jobs,
      internships,
      personalizedJobs,
      isLoading,
      error,
      fetchJobs,
      fetchInternships,
      getPersonalizedJobs,
      searchJobs
    }}>
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};
