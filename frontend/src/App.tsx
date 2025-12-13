import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { TrendingCareersProvider } from "@/contexts/TrendingCareersContext";
import { RoadmapProvider } from "@/contexts/RoadmapContext";
import { MentorsProvider } from "@/contexts/MentorsContext";
import { JobsProvider } from "@/contexts/JobsContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navigation from "@/components/Navigation";
import CareerNavigation from "@/components/career/CareerNavigation";
// Career Pages
import CareerDashboard from "@/pages/career/CareerDashboard";
import CareerRoadmap from "@/pages/career/CareerRoadmap";
import SkillBuilder from "@/pages/career/SkillBuilder";
import JobsInternships from "@/pages/career/JobsInternships";
import MentorsCommunity from "@/pages/career/MentorsCommunity";

import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ChatbotPage from "./pages/Chatbot";

const queryClient = new QueryClient();

const CareerLayout = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <CareerNavigation />
    <Routes>
      <Route path="/" element={<CareerDashboard />} />
      <Route path="/roadmap" element={<CareerRoadmap />} />
      <Route path="/skill-builder" element={<SkillBuilder />} />
      <Route path="/jobs" element={<JobsInternships />} />
      <Route path="/mentors" element={<MentorsCommunity />} />
    </Routes>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TrendingCareersProvider>
          <RoadmapProvider>
            <MentorsProvider>
              <JobsProvider>
                <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/career/*" element={<CareerLayout />} />
                <Route path="/chatbot" element={<ChatbotPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
                </BrowserRouter>
                </TooltipProvider>
              </JobsProvider>
            </MentorsProvider>
          </RoadmapProvider>
        </TrendingCareersProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
