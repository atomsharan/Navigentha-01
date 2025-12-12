import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingChatbot() {
  const location = useLocation();
  
  // Don't show on homepage or the chatbot page itself
  if (location.pathname === '/' || location.pathname === '/chatbot') {
    return null;
  }

  // Determine if should pulse (only not on career pages)
  const shouldPulse = !location.pathname.startsWith('/career');

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link to="/chatbot">
        <Button
          className={cn(
            "w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
            "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90",
            shouldPulse ? "animate-pulse hover:animate-none" : ""
          )}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </Link>
    </div>
  );
}