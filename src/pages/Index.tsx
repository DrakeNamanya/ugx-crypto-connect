
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ExchangeCard from '@/components/ExchangeCard';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <ExchangeCard />
        </div>
      </div>
      
      <Features />
      
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Create an account today and start your crypto journey with UGXchange.
            </p>
            <div className="mt-8 flex justify-center">
              <button className="ugx-button-primary">
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
