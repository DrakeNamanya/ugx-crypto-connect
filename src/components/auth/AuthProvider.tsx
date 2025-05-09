
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/lib/auth';
import { toast } from '@/components/ui/sonner';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Set loading to true while checking session
    setLoading(true);

    // Handle hash params for auth callback
    const handleHashChange = async () => {
      if (window.location.hash && !location.pathname.includes('/auth/callback')) {
        // Redirect to the auth callback handler page if we detect a hash but aren't on the callback page
        navigate('/auth/callback', { replace: true });
        return;
      }
    };

    // Process hash parameters immediately on initial load
    handleHashChange();

    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        toast.error('Authentication system error. Please try again later.');
      }
      
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Redirect to dashboard if logged in and on the login or register page
      if (currentUser && (location.pathname === '/login' || location.pathname === '/register')) {
        navigate('/dashboard');
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, navigate, location.pathname]);

  return <>{children}</>;
}

export default AuthProvider;
