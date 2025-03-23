import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isJournalPage = location.pathname.includes('/journal');

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 max-w-4xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {isJournalPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <span className="text-2xl">🔥</span>
            <span className="text-xl font-bold">EnergX</span>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => supabase.auth.signOut()}
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}