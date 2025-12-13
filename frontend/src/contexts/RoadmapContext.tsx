import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

export interface Resource {
  name: string;
  url?: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  skills: string[];
  resources: Resource[] | string[]; // Support both old format (string[]) and new format (Resource[])
  createdAt: string;
  source: 'ai-generated' | 'user-added' | 'roadmap-sh';
  stepNumber?: number; // For step-by-step ordering
}

interface RoadmapContextType {
  roadmapItems: RoadmapItem[];
  isLoading: boolean;
  error: string | null;
  addRoadmapItem: (item: Omit<RoadmapItem, 'id' | 'createdAt'>) => void;
  updateRoadmapItem: (id: string, updates: Partial<RoadmapItem>) => void;
  deleteRoadmapItem: (id: string) => void;
  generateRoadmapFromChat: (message: string) => void;
  importFromRoadmapSh: (url: string) => Promise<void>;
}

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

export const RoadmapProvider = ({ children }: { children: ReactNode }) => {
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load roadmap items from backend on mount
  useEffect(() => {
    const loadRoadmapItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/api/roadmap/items/');
        const items = response.data.map((item: any) => ({
          ...item,
          id: item.id.toString(),
        }));
        setRoadmapItems(items);
      } catch (e: any) {
        // If 401 (unauthorized), silently fallback to localStorage - user is not logged in
        if (e.response?.status === 401 || e.response?.status === 403) {
          const savedRoadmap = localStorage.getItem('career-roadmap');
          if (savedRoadmap) {
            try {
              setRoadmapItems(JSON.parse(savedRoadmap));
            } catch (parseError) {
              console.error('Error loading roadmap from localStorage:', parseError);
            }
          }
        } else {
          // For other errors, still try localStorage as fallback
          const savedRoadmap = localStorage.getItem('career-roadmap');
          if (savedRoadmap) {
            try {
              setRoadmapItems(JSON.parse(savedRoadmap));
            } catch (parseError) {
              console.error('Error loading roadmap from localStorage:', parseError);
            }
          }
          console.error('Error loading roadmap from API:', e);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadRoadmapItems();
  }, []);

  const addRoadmapItem = async (item: Omit<RoadmapItem, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      // Convert resources to backend format (array of objects or strings)
      const resourcesForBackend = item.resources.map((r: any) => 
        typeof r === 'string' ? r : (r.url ? { name: r.name, url: r.url } : r.name)
      );
      
      const response = await api.post('/api/roadmap/items/', {
        title: item.title,
        description: item.description,
        status: item.status,
        priority: item.priority,
        estimatedTime: item.estimatedTime,
        skills: item.skills,
        resources: resourcesForBackend,
        source: item.source,
      });
      const newItem: RoadmapItem = {
        ...response.data,
        id: response.data.id.toString(),
      };
      setRoadmapItems(prev => [...prev, newItem]);
    } catch (e: any) {
      // If 401/403, user is not authenticated - save to localStorage
      if (e.response?.status === 401 || e.response?.status === 403) {
        const newItem: RoadmapItem = {
          ...item,
          id: `${Date.now()}-${Math.random()}`, // Use unique ID to avoid collisions
          createdAt: new Date().toISOString(),
        };
        // Use functional update to ensure we get the latest state
        setRoadmapItems(prev => {
          const updatedItems = [...prev, newItem];
          localStorage.setItem('career-roadmap', JSON.stringify(updatedItems));
          return updatedItems;
        });
      } else {
        // Fallback: add to local state if API fails for other reasons
        const newItem: RoadmapItem = {
          ...item,
          id: `${Date.now()}-${Math.random()}`,
          createdAt: new Date().toISOString(),
        };
        setRoadmapItems(prev => {
          const updatedItems = [...prev, newItem];
          localStorage.setItem('career-roadmap', JSON.stringify(updatedItems));
          return updatedItems;
        });
        setError('Failed to save to server, saved locally');
        console.error('Error adding roadmap item:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateRoadmapItem = async (id: string, updates: Partial<RoadmapItem>) => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('authToken');
    try {
      const response = await api.patch(`/api/roadmap/items/${id}/`, {
        ...updates,
        estimatedTime: updates.estimatedTime,
      });
      const updatedItem: RoadmapItem = {
        ...response.data,
        id: response.data.id.toString(),
      };
      setRoadmapItems(prev =>
        prev.map(item => item.id === id ? updatedItem : item)
      );
    } catch (e: any) {
      // If 401/403, user is not authenticated - update localStorage
      if (e.response?.status === 401 || e.response?.status === 403) {
        const updatedItems = roadmapItems.map(item => 
          item.id === id ? { ...item, ...updates } : item
        );
        setRoadmapItems(updatedItems);
        localStorage.setItem('career-roadmap', JSON.stringify(updatedItems));
      } else {
        // Fallback: update local state if API fails for other reasons
        setRoadmapItems(prev =>
          prev.map(item => item.id === id ? { ...item, ...updates } : item)
        );
        localStorage.setItem('career-roadmap', JSON.stringify(roadmapItems.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )));
        setError('Failed to update on server, updated locally');
        console.error('Error updating roadmap item:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRoadmapItem = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/api/roadmap/items/${id}/`);
      setRoadmapItems(prev => prev.filter(item => item.id !== id));
    } catch (e: any) {
      // If 401/403, user is not authenticated - delete from localStorage
      if (e.response?.status === 401 || e.response?.status === 403) {
        const updatedItems = roadmapItems.filter(item => item.id !== id);
        setRoadmapItems(updatedItems);
        localStorage.setItem('career-roadmap', JSON.stringify(updatedItems));
      } else {
        // Fallback: delete from local state if API fails for other reasons
        setRoadmapItems(prev => prev.filter(item => item.id !== id));
        localStorage.setItem('career-roadmap', JSON.stringify(roadmapItems.filter(item => item.id !== id)));
        setError('Failed to delete on server, deleted locally');
        console.error('Error deleting roadmap item:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateRoadmapFromChat = async (message: string) => {
    setIsLoading(true);
    setError(null);
    console.log('[DEBUG] generateRoadmapFromChat called with message:', message);
    try {
      // Call the chatbot API to generate roadmap suggestions
      const response = await api.post('/api/chat/ask/', {
        session_id: 'roadmap-generation',
        message: `You are a career advisor. Generate a detailed step-by-step career roadmap for: ${message}.

IMPORTANT: You MUST respond ONLY with the roadmap in this exact format. Do NOT ask questions or provide commentary. Start directly with the roadmap.

Required format:
TITLE: [Career Path Title]

STEP 1: [Step Title] | [2-3 sentence description] | [Time estimate like "2-3 months"] | [Skills: skill1, skill2, skill3] | [Resources: Resource1, Resource2]
STEP 2: [Step Title] | [2-3 sentence description] | [Time estimate] | [Skills: skill1, skill2] | [Resources: Resource1, Resource2]
STEP 3: [Step Title] | [2-3 sentence description] | [Time estimate] | [Skills: skill1, skill2] | [Resources: Resource1, Resource2]
STEP 4: [Step Title] | [2-3 sentence description] | [Time estimate] | [Skills: skill1, skill2] | [Resources: Resource1, Resource2]
STEP 5: [Step Title] | [2-3 sentence description] | [Time estimate] | [Skills: skill1, skill2] | [Resources: Resource1, Resource2]

Create 4-6 sequential steps. Each step must build on the previous one. Start immediately with "TITLE:" - do not include any introduction or questions.`
      });
      
      // The chat endpoint returns {type: "bot", text: reply}
      const aiResponse = response.data.text || response.data.reply || '';
      console.log('[DEBUG] AI response received:', { 
        responseData: response.data,
        hasText: !!response.data.text, 
        hasReply: !!response.data.reply,
        responseLength: aiResponse.length,
        preview: aiResponse.substring(0, 500),
        fullResponse: aiResponse
      });
      
      
      // Parse the AI response for step-by-step roadmap
      const titleMatch = aiResponse.match(/TITLE:\s*(.+?)(?:\n|$)/i);
      // Look for STEP 1:, STEP 2: format OR STEPS: format - be more flexible
      let stepsMatch = aiResponse.match(/STEP\s*\d+:.+?(?=\nSTEP\s*\d+:|$)/gis);
      if (!stepsMatch) {
        stepsMatch = aiResponse.match(/STEPS?:\s*(.+?)(?:\n\n|\nSUMMARY|$)/is);
      }
      
      let title = `Career Path: ${message}`;
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
      
      const roadmapItems: Omit<RoadmapItem, 'id' | 'createdAt'>[] = [];
      console.log('[DEBUG] Parsing attempt:', { 
        hasTitleMatch: !!titleMatch,
        hasStepsMatch: !!stepsMatch,
        stepsMatchLength: stepsMatch?.length || 0
      });
      
      if (stepsMatch && stepsMatch.length > 0) {
        // Handle both array of matches and single match
        const stepsArray = Array.isArray(stepsMatch) ? stepsMatch : [stepsMatch[1] || stepsMatch[0]];
        console.log('[DEBUG] Steps array:', stepsArray.length, stepsArray.map(s => s.substring(0, 50)));
        
        stepsArray.forEach((step: string, index: number) => {
          // Try to parse structured format: title|description|time|skills|resources
          if (step.includes('|')) {
            const parts = step.split('|').map(p => p.trim());
            if (parts.length >= 3) {
              // Remove STEP N: prefix if present
              const titlePart = parts[0].replace(/^STEP\s*\d+:\s*/i, '').trim();
              const skillsText = parts[3] || '';
              const skills = skillsText.replace(/^skills?:\s*/i, '').split(',').map(s => s.trim()).filter(Boolean);
              const resourcesText = parts[4] || '';
              // Parse resources - can be "name1:url1, name2:url2" or just "name1, name2"
              const resources = resourcesText.replace(/^resources?:\s*/i, '').split(',').map(r => {
                const trimmed = r.trim();
                if (trimmed.includes(':')) {
                  const [name, url] = trimmed.split(':').map(s => s.trim());
                  return { name, url: url || '' };
                }
                return { name: trimmed, url: '' };
              }).filter(r => r.name);
              
              roadmapItems.push({
                title: titlePart || `Step ${index + 1}`,
                description: parts[1] || step.substring(0, 200),
                status: 'pending',
                priority: index === 0 ? 'high' : index < 3 ? 'medium' : 'low',
                estimatedTime: parts[2] || '2-4 weeks',
                skills: skills,
                resources: resources.length > 0 ? resources : [],
                source: 'ai-generated',
                stepNumber: index + 1
              });
            }
          } else {
            // Simple format - extract info from text
            // Handle STEP N: format or numbered list format
            const stepTitleMatch = step.match(/STEP\s*\d+:\s*(.+?)(?:\n|$)/i) || step.match(/^\d+\.\s*(.+?)(?:\n|$)/);
            const stepTitle = stepTitleMatch?.[1]?.trim() || step.split('\n')[0].substring(0, 60) || `Step ${index + 1}`;
            const description = step.replace(/^(STEP\s*\d+:|^\d+\.)\s*/i, '').trim();
            const skills = description.match(/skills?[:\s]+([^.]+)/i)?.[1]?.split(',').map(s => s.trim()).filter(Boolean) || [];
            const timeMatch = description.match(/(\d+\s*(?:weeks?|months?|years?))/i);
            
            roadmapItems.push({
              title: stepTitle,
              description: description.substring(0, 500),
              status: 'pending',
              priority: index === 0 ? 'high' : index < 3 ? 'medium' : 'low',
              estimatedTime: timeMatch ? timeMatch[1] : '2-4 weeks',
              skills: skills.length > 0 ? skills : [],
              resources: [],
              source: 'ai-generated',
              stepNumber: index + 1
            });
          }
        });
      }
      
      // If parsing failed, create step-by-step items from the response
      if (roadmapItems.length === 0) {
        // Try to split by paragraphs or numbered lists
        const paragraphs = aiResponse.split(/\n\n+/).filter(p => p.trim().length > 20);
        if (paragraphs.length > 1) {
          paragraphs.forEach((para: string, index: number) => {
            const skills = para.match(/skills?[:\s]+([^.]+)/i)?.[1]?.split(',').map(s => s.trim()).filter(Boolean) || [];
            const timeMatch = para.match(/(\d+\s*(?:weeks?|months?|years?))/i);
            const titleMatch = para.match(/^(.{0,60})/)?.[1] || `Step ${index + 1}`;
            
            roadmapItems.push({
              title: titleMatch,
              description: para.substring(0, 500),
              status: 'pending',
              priority: index === 0 ? 'high' : index < 3 ? 'medium' : 'low',
              estimatedTime: timeMatch ? timeMatch[1] : '2-4 weeks',
              skills: skills.length > 0 ? skills : [],
              resources: [],
              source: 'ai-generated',
              stepNumber: index + 1
            });
          });
        } else {
          // Single item fallback
          const skills = aiResponse.match(/skills?[:\s]+([^.]+)/i)?.[1]?.split(',').map(s => s.trim()).filter(Boolean) || [];
          const timeMatch = aiResponse.match(/(\d+\s*(?:weeks?|months?|years?))/i);
          
          roadmapItems.push({
            title: title,
            description: aiResponse.substring(0, 500),
            status: 'pending',
            priority: 'high',
            estimatedTime: timeMatch ? timeMatch[1] : '3-6 months',
            skills: skills.length > 0 ? skills : ['Communication', 'Problem Solving', 'Technical Skills'],
            resources: [{ name: 'Online Courses', url: '' }, { name: 'Mentorship', url: '' }, { name: 'Practice Projects', url: '' }],
            source: 'ai-generated',
            stepNumber: 1
          });
        }
      }
      
      // Add all parsed items
      console.log('[DEBUG] Parsed roadmap items:', roadmapItems.length, roadmapItems.map(i => i.title));
      if (roadmapItems.length === 0) {
        console.warn('[DEBUG] No items parsed from AI response');
        setError('Could not parse roadmap steps from AI response. Please try again or add items manually.');
        return;
      }
      
      for (const item of roadmapItems) {
        console.log('[DEBUG] Adding roadmap item:', item.title);
        await addRoadmapItem(item);
      }
      console.log('[DEBUG] All items added successfully');
      
      // Check if user is authenticated - if not, show info message
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError(null); // Clear any previous errors
        // Items are saved to localStorage, which is fine
      }
    } catch (e: any) {
      setError('Failed to generate roadmap from chat. ' + (e.response?.data?.error || e.message || 'Please try again.'));
      console.error('Error generating roadmap:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const importFromRoadmapSh = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/roadmap/scrape/', { url });
      const { items, title } = response.data;
      
      if (!items || items.length === 0) {
        setError('No roadmap items found in the URL');
        return;
      }
      
      // Add all items from the scraped roadmap
      for (const item of items) {
        await addRoadmapItem({
          title: item.title,
          description: item.description,
          status: item.status || 'pending',
          priority: item.priority || 'medium',
          estimatedTime: item.estimatedTime || '',
          skills: item.skills || [],
          resources: item.resources || [],
          source: 'roadmap-sh',
          stepNumber: item.stepNumber
        });
      }
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to import roadmap from roadmap.sh');
      console.error('Error importing roadmap:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoadmapContext.Provider value={{
      roadmapItems,
      isLoading,
      error,
      addRoadmapItem,
      updateRoadmapItem,
      deleteRoadmapItem,
      generateRoadmapFromChat,
      importFromRoadmapSh
    }}>
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (context === undefined) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  return context;
};
