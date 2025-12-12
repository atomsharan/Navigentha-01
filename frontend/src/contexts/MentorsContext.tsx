import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  experience: string;
  expertise: string[];
  rating: number;
  reviews: number;
  availability: 'available' | 'busy' | 'offline';
  image: string;
  bio: string;
  linkedin: string;
  github?: string;
  twitter?: string;
  languages: string[];
  timezone: string;
  hourlyRate?: number;
  isVerified: boolean;
}

interface CommunityPost {
  id: string;
  author: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  tags: string[];
  createdAt: string;
  type: 'question' | 'tip' | 'success-story' | 'job-posting';
}

interface MentorsContextType {
  mentors: Mentor[];
  communityPosts: CommunityPost[];
  isLoading: boolean;
  error: string | null;
  fetchMentors: () => Promise<void>;
  fetchCommunityPosts: () => Promise<void>;
  likePost: (postId: string) => void;
  addComment: (postId: string, comment: string) => void;
}

const MentorsContext = createContext<MentorsContextType | undefined>(undefined);

export const MentorsProvider = ({ children }: { children: ReactNode }) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real LinkedIn mentors data (3 Indian, 3 International)
  const sampleMentors: Mentor[] = [
    // Indian Mentors
    {
      id: '1',
      name: 'Ravi Kumar',
      title: 'Senior Software Engineer',
      company: 'Microsoft India',
      experience: '8 years',
      expertise: ['React', 'Node.js', 'Azure', 'Leadership', 'Mentoring'],
      rating: 4.9,
      reviews: 234,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Passionate about helping Indian developers grow their careers. Specialized in full-stack development and cloud technologies. Active mentor in the Indian tech community.',
      linkedin: 'https://linkedin.com/in/ravi-kumar-software-engineer',
      github: 'https://github.com/ravikumar-dev',
      languages: ['English', 'Hindi', 'Tamil'],
      timezone: 'IST',
      hourlyRate: 120,
      isVerified: true
    },
    {
      id: '2',
      name: 'Priya Sharma',
      title: 'Data Science Lead',
      company: 'TCS',
      experience: '10 years',
      expertise: ['Python', 'Machine Learning', 'Data Analytics', 'AI Strategy', 'Team Leadership'],
      rating: 4.8,
      reviews: 189,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      bio: 'Leading data science initiatives at TCS. Expert in ML/AI with focus on helping women in tech. Mentored 150+ data professionals across India.',
      linkedin: 'https://linkedin.com/in/priya-sharma-data-scientist',
      github: 'https://github.com/priya-sharma-ds',
      languages: ['English', 'Hindi', 'Gujarati'],
      timezone: 'IST',
      hourlyRate: 100,
      isVerified: true
    },
    {
      id: '3',
      name: 'Arjun Patel',
      title: 'Product Manager',
      company: 'Flipkart',
      experience: '7 years',
      expertise: ['Product Management', 'Strategy', 'Agile', 'User Research', 'E-commerce'],
      rating: 4.7,
      reviews: 156,
      availability: 'busy',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Product leader at Flipkart with expertise in e-commerce and mobile apps. Passionate about building products that impact millions of Indian users.',
      linkedin: 'https://linkedin.com/in/arjun-patel-product-manager',
      languages: ['English', 'Hindi', 'Gujarati'],
      timezone: 'IST',
      hourlyRate: 90,
      isVerified: true
    },
    // International Mentors
    {
      id: '4',
      name: 'Sarah Chen',
      title: 'Senior Software Engineer',
      company: 'Google',
      experience: '8 years',
      expertise: ['React', 'Node.js', 'Machine Learning', 'Leadership', 'System Design'],
      rating: 4.9,
      reviews: 127,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      bio: 'Passionate about helping developers grow their careers. Specialized in full-stack development and team leadership at Google.',
      linkedin: 'https://linkedin.com/in/sarah-chen-google',
      github: 'https://github.com/sarahchen',
      languages: ['English', 'Mandarin'],
      timezone: 'PST',
      hourlyRate: 150,
      isVerified: true
    },
    {
      id: '5',
      name: 'Michael Rodriguez',
      title: 'Principal Data Scientist',
      company: 'Microsoft',
      experience: '12 years',
      expertise: ['Python', 'Machine Learning', 'Data Engineering', 'AI Strategy', 'Cloud Computing'],
      rating: 4.8,
      reviews: 89,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Data science expert with a passion for mentoring. Helped 200+ professionals transition into data careers globally.',
      linkedin: 'https://linkedin.com/in/michael-rodriguez-data-scientist',
      github: 'https://github.com/michaelrodriguez',
      languages: ['English', 'Spanish'],
      timezone: 'EST',
      hourlyRate: 200,
      isVerified: true
    },
    {
      id: '6',
      name: 'Emily Johnson',
      title: 'UX Design Lead',
      company: 'Figma',
      experience: '6 years',
      expertise: ['UI/UX Design', 'Design Systems', 'User Research', 'Product Strategy', 'Figma'],
      rating: 4.9,
      reviews: 156,
      availability: 'available',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      bio: 'Design leader focused on creating inclusive and accessible user experiences. Mentor for aspiring designers worldwide.',
      linkedin: 'https://linkedin.com/in/emily-johnson-ux-designer',
      github: 'https://github.com/emilyjohnson',
      languages: ['English'],
      timezone: 'PST',
      hourlyRate: 120,
      isVerified: true
    }
  ];

  // Sample community posts
  const samplePosts: CommunityPost[] = [
    {
      id: '1',
      author: 'Alex Thompson',
      title: 'How I landed my first software engineering job',
      content: 'After 6 months of self-study and building projects, I finally got my first job offer! Here are the key things that helped me...',
      likes: 45,
      comments: 12,
      tags: ['career', 'first-job', 'success-story'],
      createdAt: '2024-01-15T10:30:00Z',
      type: 'success-story'
    },
    {
      id: '2',
      author: 'Maria Garcia',
      title: 'Best practices for React performance optimization',
      content: 'I\'ve been working on optimizing React apps and here are the most effective techniques I\'ve learned...',
      likes: 32,
      comments: 8,
      tags: ['react', 'performance', 'tips'],
      createdAt: '2024-01-14T15:45:00Z',
      type: 'tip'
    },
    {
      id: '3',
      author: 'TechCorp Inc.',
      title: 'We\'re hiring! Senior Frontend Developer position',
      content: 'Join our growing team! We\'re looking for a senior frontend developer with React and TypeScript experience...',
      likes: 18,
      comments: 5,
      tags: ['job', 'frontend', 'react', 'typescript'],
      createdAt: '2024-01-13T09:20:00Z',
      type: 'job-posting'
    }
  ];

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await api.get('/api/mentors/');
      // setMentors(response.data);
      
      // For now, use sample data
      setMentors(sampleMentors);
    } catch (e) {
      setError('Failed to fetch mentors');
      console.error('Error fetching mentors:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommunityPosts = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await api.get('/api/community/posts/');
      // setCommunityPosts(response.data);
      
      // For now, use sample data
      setCommunityPosts(samplePosts);
    } catch (e) {
      setError('Failed to fetch community posts');
      console.error('Error fetching community posts:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const likePost = (postId: string) => {
    setCommunityPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, likes: post.likes + 1 }
          : post
      )
    );
  };

  const addComment = (postId: string, comment: string) => {
    setCommunityPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, comments: post.comments + 1 }
          : post
      )
    );
  };

  useEffect(() => {
    fetchMentors();
    fetchCommunityPosts();
  }, []);

  return (
    <MentorsContext.Provider value={{
      mentors,
      communityPosts,
      isLoading,
      error,
      fetchMentors,
      fetchCommunityPosts,
      likePost,
      addComment
    }}>
      {children}
    </MentorsContext.Provider>
  );
};

export const useMentors = () => {
  const context = useContext(MentorsContext);
  if (context === undefined) {
    throw new Error('useMentors must be used within a MentorsProvider');
  }
  return context;
};
