import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Fragment } from "react";
import { useTrendingCareers } from "@/contexts/TrendingCareersContext";
import { 
  TrendingUp, 
  User, 
  Search, 
  Users,
  Star,
  Award,
  Target,
  Brain,
  BookOpen,
  Lightbulb,
  ArrowRight,
  MessageCircle
} from "lucide-react";
import Navigation from "@/components/Navigation";
import heroImage from "@/assets/hero-students-modern.jpg";
import softwareEngineerImage from "@/assets/career-software-engineer-modern.jpg";
import dataScientistImage from "@/assets/career-data-scientist-modern.jpg";
import productManagerImage from "@/assets/career-product-manager-modern.jpg";

interface CareerPath {
  title: string;
  growth: string;
  demand: string;
  imageKey: string;
}

const imageMap: { [key: string]: string } = {
  "software-engineer": softwareEngineerImage,
  "data-scientist": dataScientistImage,
  "product-manager": productManagerImage,
};

const Index = () => {
  const { trendingCareers: careerPaths, isLoading, error } = useTrendingCareers();
  const steps = [
    {
      number: "01",
      icon: BookOpen,
      title: "Take the AI Assessment",
      description: "Our smart chatbot asks about your interests, skills, and goals to understand your unique profile."
    },
    {
      number: "02", 
      icon: Lightbulb,
      title: "Get Personalized Insights",
      description: "Receive tailored career recommendations with detailed skill requirements and growth paths."
    },
    {
      number: "03",
      icon: Users,
      title: "Connect & Grow",
      description: "Access mentorship opportunities and join our community to accelerate your career journey."
    }
  ];

  const testimonials = [
    {
      text: "This app helped me discover my passion for UI/UX design and land my first internship! The AI roadmap was incredibly detailed.",
      author: "Sarah Chen",
      role: "UI/UX Design Intern"
    },
    {
      text: "The AI roadmap guided me through exactly what skills I needed to become a data scientist. I'm now working at my dream company!",
      author: "Marcus Johnson", 
      role: "Data Scientist"
    },
    {
      text: "Amazing mentorship connections! I found a mentor who helped me transition from marketing to product management successfully.",
      author: "Emily Rodriguez",
      role: "Product Manager"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Award className="h-5 w-5 text-accent" />
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              Trusted by 50,000+ Students
            </Badge>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground">
                Find Your Path.{" "}
                <span className="text-primary">Build</span>{" "}
                Your{" "}
                <span className="text-accent">Future.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Discover your perfect career path with personalized AI guidance, detailed roadmaps, 
                and connect with mentors who'll help you achieve your professional dreams.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/chatbot">
                  <Button 
                    size="lg" 
                    className="text-white font-semibold px-8 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    style={{ background: 'var(--gradient-assessment)' }}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Take Career Assessment
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg" className="font-semibold px-8 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Diverse students studying together in modern university setting"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="bg-primary/20 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ color: 'hsl(var(--homepage-headings))' }}>50,000+ Students</h4>
                        <p className="text-sm text-muted-foreground">Building their futures</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Career Paths */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-3">
            <Badge className="bg-secondary/10 text-secondary border-secondary/20 mb-4">
              <TrendingUp className="h-4 w-4 mr-2" />
              High Demand
            </Badge>
          </div>
          
          <h2 className="text-4xl font-bold text-center mb-3" style={{ color: 'hsl(var(--homepage-headings))' }}>
            Trending Career Paths
          </h2>
          
          <p className="text-lg text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            Discover high-growth careers with excellent opportunities and competitive salaries in today's market
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 min-h-[200px]">
            {isLoading && <p className="md:col-span-3 text-center text-muted-foreground">Loading career paths...</p>}
            {error && <p className="md:col-span-3 text-center text-destructive">{error}</p>}
            {!isLoading && !error && careerPaths.map((career, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-primary/10 overflow-hidden">
                <div className="aspect-video relative">
                  <img 
                    src={imageMap[career.imageKey] || softwareEngineerImage} 
                    alt={`${career.title} working environment`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{career.title}</h3>
                  <div className="flex justify-center gap-3 mb-4">
                    <Badge className="bg-accent/10 text-accent border-accent/20">
                      {career.growth} growth
                    </Badge>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                      {career.demand}
                    </Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    Explore Path
                  </Button>
                </CardContent>
              </Card>
            ))}
            {!isLoading && !error && careerPaths.length === 0 && (
              <p className="md:col-span-3 text-center text-muted-foreground">
                No career paths found. Please ensure your backend is running and the API is returning data.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-16 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-accent/10 text-accent border-accent/20 mb-6">
              🔄 Simple Process
            </Badge>
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'hsl(var(--homepage-headings))' }}>How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your journey to the perfect career in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="relative border-primary/10 hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="bg-primary/5 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-10 w-10 text-primary" />
                    </div>
                    <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-secondary/10 text-secondary border-secondary/20 mb-6">
              ✅ Proven Results
            </Badge>
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'hsl(var(--homepage-headings))' }}>Success Stories</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              See how NEXORA has transformed careers and helped thousands achieve their professional dreams
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-primary/10 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Description CTA Section */}
      <section className="px-6 py-16" style={{ backgroundColor: 'hsl(var(--homepage-chatbot) / 0.1)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl text-muted-foreground mb-4">Ready to get started?</h2>
          
          <div className="rounded-2xl p-6 mb-8 max-w-2xl mx-auto" style={{ backgroundColor: 'hsl(var(--homepage-chatbot) / 0.2)' }}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'hsl(var(--homepage-chatbot) / 0.3)' }}>
                <Brain className="h-5 w-5" style={{ color: 'hsl(var(--homepage-chatbot))' }} />
              </div>
              <h3 className="font-semibold" style={{ color: 'hsl(var(--homepage-headings))' }}>AI Career Assistant</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Our intelligent AI chatbot analyzes your skills, interests, and goals to provide personalized career recommendations. 
              Take the career assessment to unlock detailed guidance and personalized roadmaps.
            </p>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Login required for full access
            </Badge>
          </div>
          
          <Link to="/chatbot">
            <Button 
              size="lg" 
              className="text-white font-semibold px-12 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              style={{ background: 'var(--gradient-assessment)' }}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Take the Career Assessment
            </Button>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students and professionals who've found their perfect career path with NEXORA
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white hover:bg-white/90 font-semibold px-8" style={{ color: 'hsl(var(--homepage-headings))' }}>
                Start Your Journey
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-semibold px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
