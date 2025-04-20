
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-ugx-purple text-2xl font-bold">UGX</span>
              <span className="text-ugx-blue font-bold">change</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="px-3 py-2 text-gray-700 hover:text-ugx-purple">Home</Link>
            <Link to="/dashboard" className="px-3 py-2 text-gray-700 hover:text-ugx-purple">Dashboard</Link>
            <Link to="/" className="px-3 py-2 text-gray-700 hover:text-ugx-purple">About</Link>
            <Link to="/" className="px-3 py-2 text-gray-700 hover:text-ugx-purple">Support</Link>
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            <Link to="/register">
              <Button className="ugx-button-secondary flex items-center gap-2">
                <User size={18} />
                <span>Create Account</span>
              </Button>
            </Link>
            <Button className="ugx-button-primary flex items-center gap-2">
              <User size={18} />
              <span>Sign In</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-ugx-purple focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-ugx-purple">Home</Link>
            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-ugx-purple">Dashboard</Link>
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-ugx-purple">About</Link>
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-ugx-purple">Support</Link>
            <Link to="/register" onClick={() => setIsMenuOpen(false)}>
              <Button className="ugx-button-secondary w-full mt-4 flex items-center justify-center gap-2">
                <User size={18} />
                <span>Create Account</span>
              </Button>
            </Link>
            <Button onClick={() => setIsMenuOpen(false)} className="ugx-button-primary w-full mt-4 flex items-center justify-center gap-2">
              <User size={18} />
              <span>Sign In</span>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
