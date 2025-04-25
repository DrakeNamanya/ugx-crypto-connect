
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import LoginForm from '@/components/auth/LoginForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Login" 
        description="Sign in to your UGXchange account to access crypto trading, mobile money integration, and more."
        keywords="login, signin, crypto exchange, UGXchange, Uganda"
      />
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6">Welcome Back</h1>
          <p className="text-gray-600 text-center mb-8">
            Sign in to your UGXchange account
          </p>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
