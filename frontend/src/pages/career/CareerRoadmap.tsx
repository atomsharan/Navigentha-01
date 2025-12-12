import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, Circle, Lock, Plus, Trash2, Edit, Clock, Target, BookOpen, ExternalLink, X, Loader2 } from 'lucide-react';
import { useRoadmap, RoadmapItem } from '@/contexts/RoadmapContext';
import { useNavigate } from 'react-router-dom';

const CareerRoadmap = () => {
  const navigate = useNavigate();
  const { roadmapItems, addRoadmapItem, updateRoadmapItem, deleteRoadmapItem, generateRoadmapFromChat, importFromRoadmapSh, isLoading } = useRoadmap();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [roadmapUrl, setRoadmapUrl] = useState('');
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    estimatedTime: '',
    skills: [] as string[],
    resources: [] as Array<{ name: string; url: string }>
  });
  const [skillInput, setSkillInput] = useState('');
  const [resourceInput, setResourceInput] = useState('');
  const [resourceUrlInput, setResourceUrlInput] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Circle className="w-5 h-5 text-blue-500" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const handleAddItem = () => {
    if (newItem.title && newItem.description) {
      // Assign step number based on current items count
      const nextStepNumber = roadmapItems.length + 1;
      addRoadmapItem({
        ...newItem,
        status: 'pending',
        source: 'user-added',
        stepNumber: nextStepNumber
      });
      setNewItem({
        title: '',
        description: '',
        priority: 'medium',
        estimatedTime: '',
        skills: [],
        resources: []
      });
      setSkillInput('');
      setResourceInput('');
      setResourceUrlInput('');
      setIsAddingItem(false);
    }
  };

  const handleEditItem = (item: RoadmapItem) => {
    setEditingItem(item.id);
    // Convert resources to new format if needed
    const resources = item.resources.map((r: any) => 
      typeof r === 'string' ? { name: r, url: '' } : r
    );
    setNewItem({
      title: item.title,
      description: item.description,
      priority: item.priority,
      estimatedTime: item.estimatedTime,
      skills: [...item.skills],
      resources: resources
    });
    setSkillInput('');
    setResourceInput('');
    setResourceUrlInput('');
  };

  const handleUpdateItem = () => {
    if (editingItem && newItem.title && newItem.description) {
      updateRoadmapItem(editingItem, {
        ...newItem,
      });
      setNewItem({
        title: '',
        description: '',
        priority: 'medium',
        estimatedTime: '',
        skills: [],
        resources: []
      });
      setSkillInput('');
      setResourceInput('');
      setResourceUrlInput('');
      setEditingItem(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
      setNewItem({
        title: '',
        description: '',
        priority: 'medium',
        estimatedTime: '',
        skills: [],
        resources: []
      });
      setSkillInput('');
      setResourceInput('');
      setResourceUrlInput('');
    };

  const addSkill = () => {
    if (skillInput.trim()) {
      setNewItem({ ...newItem, skills: [...newItem.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setNewItem({ ...newItem, skills: newItem.skills.filter((_, i) => i !== index) });
  };

  const addResource = () => {
    if (resourceInput.trim()) {
      const resource = {
        name: resourceInput.trim(),
        url: resourceUrlInput.trim() || ''
      };
      setNewItem({ ...newItem, resources: [...newItem.resources, resource] });
      setResourceInput('');
      setResourceUrlInput('');
    }
  };

  const removeResource = (index: number) => {
    setNewItem({ ...newItem, resources: newItem.resources.filter((_, i) => i !== index) });
  };

  const handleGenerateFromChat = () => {
    const message = prompt('What career path or skill would you like a roadmap for?');
    if (message) {
      generateRoadmapFromChat(message);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Your Career Roadmap</h1>
            <p className="text-muted-foreground text-lg">Personalized learning path tailored to your goals</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateFromChat}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
            >
              <Target className="h-4 w-4 mr-2" />
              Generate from AI
            </Button>
            <Dialog open={isImporting} onOpenChange={setIsImporting}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Import from roadmap.sh
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Roadmap from roadmap.sh</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Roadmap.sh URL</label>
                    <Input
                      value={roadmapUrl}
                      onChange={(e) => setRoadmapUrl(e.target.value)}
                      placeholder="https://roadmap.sh/frontend"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter a roadmap.sh URL (e.g., https://roadmap.sh/frontend, https://roadmap.sh/backend)
                    </p>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!roadmapUrl.trim()) {
                        alert('Please enter a roadmap.sh URL');
                        return;
                      }
                      try {
                        await importFromRoadmapSh(roadmapUrl.trim());
                        setIsImporting(false);
                        setRoadmapUrl('');
                      } catch (error) {
                        console.error('Import failed:', error);
                      }
                    }}
                    disabled={isLoading || !roadmapUrl.trim()}
                    className="w-full"
                  >
                    {isLoading ? 'Importing...' : 'Import Roadmap'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddingItem || editingItem !== null} onOpenChange={(open) => {
              if (!open) {
                setIsAddingItem(false);
                handleCancelEdit();
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setIsAddingItem(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Roadmap Item' : 'Add Roadmap Item'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={newItem.title}
                      onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                      placeholder="e.g., Learn React Advanced Patterns"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      placeholder="Describe what you want to learn or achieve..."
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <select
                        value={newItem.priority}
                        onChange={(e) => setNewItem({...newItem, priority: e.target.value as 'high' | 'medium' | 'low'})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Estimated Time</label>
                      <Input
                        value={newItem.estimatedTime}
                        onChange={(e) => setNewItem({...newItem, estimatedTime: e.target.value})}
                        placeholder="e.g., 2-3 months"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Skills</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="Add a skill"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newItem.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(index)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Resources (with links)</label>
                    <div className="space-y-2 mb-2">
                      <Input
                        value={resourceInput}
                        onChange={(e) => setResourceInput(e.target.value)}
                        placeholder="Resource name (e.g., Python Course)"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                      />
                      <Input
                        value={resourceUrlInput}
                        onChange={(e) => setResourceUrlInput(e.target.value)}
                        placeholder="Resource URL (optional, e.g., https://example.com)"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                      />
                      <Button type="button" onClick={addResource} size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Resource
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newItem.resources.map((resource, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {resource.url ? (
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {resource.name}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            resource.name
                          )}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeResource(index)} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={editingItem ? handleUpdateItem : handleAddItem} 
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {editingItem ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        editingItem ? 'Update Item' : 'Add Item'
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsAddingItem(false);
                      handleCancelEdit();
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {roadmapItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No roadmap items yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your career path by adding items or asking our AI mentor for suggestions.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setIsAddingItem(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
                <Button variant="outline" onClick={handleGenerateFromChat}>
                  <Target className="h-4 w-4 mr-2" />
                  Ask AI Mentor
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Step-by-step roadmap display */}
            {roadmapItems
              .sort((a, b) => {
                // Sort by step number if available, otherwise by creation date
                const aStep = (a as any).stepNumber || 0;
                const bStep = (b as any).stepNumber || 0;
                if (aStep !== bStep) return aStep - bStep;
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              })
              .map((item, index) => {
                const stepNumber = (item as any).stepNumber || index + 1;
                const resources = item.resources.map((r: any) => 
                  typeof r === 'string' ? { name: r, url: '' } : r
                );
                
                return (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow relative">
                    <CardContent className="p-6">
                      {/* Step Number Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold border-2 border-primary/20">
                          {stepNumber}
                        </div>
                      </div>
                      
                      <div className="flex items-start justify-between mb-4 pr-12">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {getStatusIcon(item.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="text-xl font-semibold">{item.title}</h3>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status.replace('-', ' ')}
                              </Badge>
                              <Badge variant="outline" className={getPriorityColor(item.priority)}>
                                {item.priority} priority
                              </Badge>
                              {item.source === 'ai-generated' && (
                                <Badge variant="outline" className="text-purple-600 border-purple-200">
                                  AI Generated
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3">{item.description}</p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {item.estimatedTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {item.estimatedTime}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                {item.skills.length} skills
                              </div>
                              <div className="flex items-center gap-1">
                                <ExternalLink className="h-4 w-4" />
                                {resources.length} resources
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons - Accessible and clickable */}
                      <div className="flex gap-2 mb-4 flex-wrap relative z-20">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const nextStatus = item.status === 'pending' ? 'in-progress' : 
                                             item.status === 'in-progress' ? 'completed' : 'pending';
                            updateRoadmapItem(item.id, { status: nextStatus });
                          }}
                          className="cursor-pointer pointer-events-auto"
                          type="button"
                        >
                          {item.status === 'pending' ? 'Start' : item.status === 'in-progress' ? 'Complete' : 'Reset'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditItem(item);
                          }}
                          className="cursor-pointer pointer-events-auto"
                          type="button"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this item?')) {
                              deleteRoadmapItem(item.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer pointer-events-auto"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                      
                      {item.skills.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-2">Skills to Learn:</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.skills.map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {resources.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Resources:</h4>
                          <div className="flex flex-wrap gap-2">
                            {resources.map((resource: any, resourceIndex: number) => (
                              resource.url ? (
                                <a
                                  key={resourceIndex}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80 transition-colors cursor-pointer border border-secondary"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {resource.name}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <Badge 
                                  key={resourceIndex} 
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {resource.name}
                                </Badge>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}

        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Need personalized guidance?</h3>
            <p className="text-muted-foreground mb-4">
              Our AI mentor can help you create a customized roadmap based on your goals and current skills.
            </p>
            <Button 
              onClick={() => navigate('/chatbot')}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
            >
              <Target className="h-4 w-4 mr-2" />
              Ask AI Mentor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CareerRoadmap;