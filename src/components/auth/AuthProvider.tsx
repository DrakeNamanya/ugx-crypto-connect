
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
      const hash = window.location.hash;
      
      // Check if we have hash parameters but we're not on the callback page
      if (hash && hash.length > 0 && !location.pathname.includes('/auth/callback')) {
        // Save the original hash for the callback handler
        sessionStorage.setItem('authRedirectHash', hash);
        // Redirect to the auth callback handler page
        navigate('/auth/callback', { replace: true });
        return;
      }
    };

    // Process hash parameters immediately on initial load
    handleHashChange();

    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      // Update the user state when auth state changes
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Redirect to dashboard if logged in and on auth pages
      if (currentUser) {
        if (location.pathname === '/login' || location.pathname === '/register') {
          toast.success('Successfully authenticated!');
          navigate('/dashboard');
        }
      }
      
      setLoading(false);
    });

    // Then check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        toast.error('Authentication system error. Please try again later.');
      }
      
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, navigate, location.pathname]);

  return <>{children}</>;
}

export default AuthProvider;
