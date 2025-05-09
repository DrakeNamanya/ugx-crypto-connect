
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RegistrationForm from '@/components/RegistrationForm';
import SEO from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Register = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate to login page after successful registration
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEO 
        title="Create Account | UGXchange" 
        description="Join UGXchange, the leading crypto exchange platform in Uganda."
        keywords="register, signup, crypto exchange, UGXchange, Uganda"
      />
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">Create an Account</h1>
          <p className="text-gray-600 text-center mb-8">
            Join UGXchange, the leading crypto exchange platform in Uganda.
          </p>
          
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-center">Sign Up</CardTitle>
              <CardDescription className="text-center">
                Enter your details to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegistrationForm onSuccess={handleSuccess} />
            </CardContent>
          </Card>
          
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
