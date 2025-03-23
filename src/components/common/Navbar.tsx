import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isJournalPage = location.pathname.includes('/journal');

  return (
    <nav className="gradient-primary shadow-lg">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {isJournalPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="mr-2 text-white hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <span className="text-2xl">🔥</span>
            <span className="text-2xl font-bold text-white tracking-wide">EnergX</span>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => supabase.auth.signOut()}
            className="text-white hover:bg-white/10 transition-colors font-medium"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}