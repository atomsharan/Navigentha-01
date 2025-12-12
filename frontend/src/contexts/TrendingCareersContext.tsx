
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface TrendingCareer {
  id: string;
  title: string;
  growth: number;
  salary: string;
  skills: string[];
}

interface TrendingCareersContextType {
  trendingCareers: TrendingCareer[];
  isLoading: boolean;
  error: string | null;
}

const TrendingCareersContext = createContext<TrendingCareersContextType | undefined>(undefined);

export const TrendingCareersProvider = ({ children }: { children: ReactNode }) => {
  const [trendingCareers, setTrendingCareers] = useState<TrendingCareer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingCareers = async () => {
      try {
        const response = await api.get('/api/trending-careers');
        setTrendingCareers(response.data || []);
      } catch (e) {
        if (e instanceof Error) {
          setError(`Failed to fetch trending careers: ${e.message}`);
        } else {
          setError('An unknown error occurred.');
        }
        console.error('Error fetching trending careers:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingCareers();
  }, []);

  return (
    <TrendingCareersContext.Provider value={{ trendingCareers, isLoading, error }}>
      {children}
    </TrendingCareersContext.Provider>
  );
};

export const useTrendingCareers = () => {
  const context = useContext(TrendingCareersContext);
  if (context === undefined) {
    throw new Error('useTrendingCareers must be used within a TrendingCareersProvider');
  }
  return context;
};
