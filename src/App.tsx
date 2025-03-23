import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthForm } from './components/auth/AuthForm';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Dashboard } from './components/dashboard/Dashboard';
import { Journal } from './components/journal/Journal';
import { Toaster } from './components/ui/toaster';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/auth"
            element={
              !session ? <AuthForm /> : <Navigate to="/dashboard" replace />
            }
          />
          <Route
            path="/dashboard"
            element={
              session ? <Dashboard /> : <Navigate to="/auth" replace />
            }
          />
          <Route
            path="/journal/:date"
            element={
              session ? <Journal /> : <Navigate to="/auth" replace />
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;