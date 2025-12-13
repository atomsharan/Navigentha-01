import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Navigation from '@/components/Navigation';
import api from '@/lib/api';

interface Message {
  type: 'bot' | 'user';
  content: string;
  timestamp?: Date;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const ChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: "Hi! I'm your AI Career Assistant. How can I help you today? You can ask me about career paths, skills, or anything else.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [activeChatId, setActiveChatId] = useState('current');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const { data } = await api.get('/api/chat/history/');
        if (data && Array.isArray(data)) {
          const historyItems: ChatHistoryItem[] = data.map((convo: any) => ({
            id: convo.conversation_id || convo.id,
            title: convo.last_user_message ? generateChatTitle(convo.last_user_message) : 'New Chat',
            lastMessage: convo.last_user_message || (convo.messages && convo.messages.length > 0 ? convo.messages[convo.messages.length - 1].text : '') || '',
            timestamp: new Date(convo.messages && convo.messages.length > 0 ? convo.messages[convo.messages.length - 1]?.created_at : Date.now())
          }));
          setChatHistory(historyItems);
        }
        
        // Load localStorage as fallback
        const localHistory = localStorage.getItem('chat-history');
        if (localHistory) {
          try {
            const parsed = JSON.parse(localHistory);
            setChatHistory(prev => {
              const combined = [...prev, ...parsed.filter((item: ChatHistoryItem) => 
                !prev.find(p => p.id === item.id)
              )];
              return combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            });
          } catch (e) {
            console.error('Error parsing localStorage chat history:', e);
          }
        }
      } catch (err: any) {
        // If unauthorized, try localStorage
        if (err.response?.status === 401 || err.response?.status === 403) {
          const localHistory = localStorage.getItem('chat-history');
          if (localHistory) {
            try {
              setChatHistory(JSON.parse(localHistory));
            } catch (e) {
              console.error('Error loading localStorage chat history:', e);
            }
          }
        }
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadChatHistory();
  }, []);

  const generateChatTitle = (firstMessage: string) => {
    const words = firstMessage.toLowerCase().split(' ').slice(0, 3);
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + '...';
  };

  const createNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    setActiveChatId(newChatId);
    setMessages([{
      type: 'bot',
      content: "Hi! I'm your AI Career Assistant. How can I help you today? You can ask me about career paths, skills, or anything else.",
      timestamp: new Date()
    }]);
  };

  const switchToChat = async (chatId: string) => {
    setActiveChatId(chatId);
    if (chatId === 'current') {
      setMessages([{
        type: 'bot',
        content: "Hi! I'm your AI Career Assistant. How can I help you today? You can ask me about career paths, skills, or anything else.",
        timestamp: new Date()
      }]);
    } else {
      // Load messages for this chat from API
      try {
        const { data } = await api.get('/api/chat/history/');
        if (data && Array.isArray(data)) {
          const convo = data.find((c: any) => (c.conversation_id || c.id) === chatId);
          if (convo && convo.messages && Array.isArray(convo.messages)) {
            const loadedMessages: Message[] = convo.messages.map((msg: any) => ({
              type: msg.role === 'user' ? 'user' : 'bot',
              content: msg.text || msg.content || '',
              timestamp: new Date(msg.created_at || Date.now())
            }));
            if (loadedMessages.length > 0) {
              setMessages(loadedMessages);
              return;
            }
          }
        }
      } catch (err) {
        // Continue to localStorage fallback
      }
      
      // Fallback to localStorage
      const localChats = localStorage.getItem(`chat-${chatId}`);
      if (localChats) {
        try {
          const parsed = JSON.parse(localChats);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        } catch (e) {
          // Continue to default
        }
      }
      
      // Default empty chat
      setMessages([{
        type: 'bot',
        content: "Hi! I'm your AI Career Assistant. How can I help you today?",
        timestamp: new Date()
      }]);
    }
  };

  const deleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChatId === chatId) {
      createNewChat();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { type: 'user', content: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    // Create new chat if this is the first user message
    if (messages.length === 1) {
      const newChatId = `chat_${Date.now()}`;
      setActiveChatId(newChatId);
      const newChat: ChatHistoryItem = {
        id: newChatId,
        title: generateChatTitle(currentInput),
        lastMessage: currentInput,
        timestamp: new Date()
      };
      setChatHistory(prev => [newChat, ...prev]);
    } else {
      // Update existing chat
      setChatHistory(prev => prev.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, lastMessage: currentInput, timestamp: new Date() }
          : chat
      ));
    }

    try {
      const { data } = await api.post('/api/chat/ask/', {
        session_id: activeChatId,
        message: currentInput,
      });
      const botMessage: Message = { type: 'bot', content: data.text || data.reply || '...', timestamp: new Date() };
      setMessages(prev => {
        const updated = [...prev, botMessage];
        // Save to localStorage as backup
        localStorage.setItem(`chat-${activeChatId}`, JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      const botMessage: Message = { type: 'bot', content: 'Sorry, something went wrong contacting the assistant.', timestamp: new Date() };
      setMessages(prev => {
        const updated = [...prev, botMessage];
        localStorage.setItem(`chat-${activeChatId}`, JSON.stringify(updated));
        return updated;
      });
    }
    
    // Update chat history in localStorage
    const updatedHistory = chatHistory.map(chat => 
      chat.id === activeChatId 
        ? { ...chat, lastMessage: currentInput, timestamp: new Date() }
        : chat
    );
    setChatHistory(updatedHistory);
    localStorage.setItem('chat-history', JSON.stringify(updatedHistory));
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navigation />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r bg-muted/20 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chat History</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={createNewChat}
              title="New Chat"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto -mx-2">
            <div className="space-y-1">
              {chatHistory.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No chat history yet. Start a conversation!
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <div key={chat.id} className="group relative">
                    <Button
                      variant={activeChatId === chat.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start h-auto p-3"
                      onClick={() => switchToChat(chat.id)}
                    >
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate font-medium">{chat.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.lastMessage}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-3xl h-full flex flex-col border rounded-lg shadow-lg bg-card">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3 bg-muted/40">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold">AI Career Assistant</h2>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message, index) => (
                  <div key={index} className={cn("flex gap-3 animate-fade-in", message.type === 'user' ? "justify-end" : "justify-start")}>
                    {message.type === 'bot' && <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Bot className="h-4 w-4 text-primary" /></div>}
                    <div className={cn("max-w-[80%] p-3 rounded-lg text-sm", message.type === 'bot' ? "bg-muted text-foreground" : "bg-primary text-primary-foreground ml-auto")}>
                      {message.content}
                    </div>
                    {message.type === 'user' && <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0"><User className="h-4 w-4 text-accent" /></div>}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <div className="border-t p-4 bg-muted/40">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ask about careers, skills, etc..." className="flex-1" />
                  <Button type="submit" disabled={!inputValue.trim()}><Send className="h-4 w-4" /></Button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatbotPage;