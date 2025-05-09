
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/auth';

const AuthRedirect: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthStore();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        setIsLoading(true);
        
        // Get the hash from storage if it was saved during redirect
        let hashParams = window.location.hash;
        const storedHash = sessionStorage.getItem('authRedirectHash');
        
        if (storedHash && (!hashParams || hashParams.length < 1)) {
          hashParams = storedHash;
          // Clear the stored hash
          sessionStorage.removeItem('authRedirectHash');
        }
        
        if (hashParams && hashParams.length > 0) {
          // Process the URL fragment (access_token, etc.)
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (data.session) {
            setUser(data.session.user);
            toast.success('Authentication successful!', {
              description: 'Your email has been verified.'
            });
          } else {
            // Try to extract the token from the URL if the session isn't set
            // This helps with the initial sign-up flow
            const params = new URLSearchParams(hashParams.substring(1));
            if (params.get('access_token')) {
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              const expiresIn = params.get('expires_in');
              
              if (accessToken && refreshToken && expiresIn) {
                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });
                
                if (error) throw error;
                if (data.session) {
                  setUser(data.session.user);
                }
              }
            }
          }
        } else {
          console.log('No hash parameters found for auth redirect');
        }
      } catch (error) {
        console.error('Auth redirect error:', error);
        setError(error instanceof Error ? error.message : 'Failed to process authentication');
        toast.error('Authentication failed', {
          description: error instanceof Error ? error.message : 'Please try signing in again'
        });
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthRedirect();
  }, [setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold">Processing authentication...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we verify your credentials</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="max-w-md w-full px-4 py-8 bg-white shadow rounded-lg">
          <h2 className="text-xl font-semibold text-center mb-4">Authentication Error</h2>
          <p className="text-center text-destructive mb-6">{error}</p>
          <div className="flex justify-center">
            <a href="/login" className="text-primary hover:underline">
              Back to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If everything is successful, redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default AuthRedirect;
