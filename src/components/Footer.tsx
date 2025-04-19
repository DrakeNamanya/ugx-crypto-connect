
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-white text-2xl font-bold">UGX</span>
              <span className="text-ugx-blue font-bold">change</span>
            </div>
            <p className="text-gray-400">
              Uganda's leading cryptocurrency exchange platform, providing easy and secure conversion between UGX and USDT.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Services</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">UGX to USDT</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white">USDT to UGX</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white">Wallet Transfers</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white">Mobile Money Withdrawal</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white">Careers</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white">Blog</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-white">Press</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Contact</h3>
            <ul className="mt-4 space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Kampala, Uganda</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <span>+256 77 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <span>info@ugxchange.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} UGXchange. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6 text-sm text-gray-400">
            <Link to="/" className="hover:text-white">Privacy Policy</Link>
            <Link to="/" className="hover:text-white">Terms of Service</Link>
            <Link to="/" className="hover:text-white">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
