import { MdEmail, MdPhone, MdLocationOn, MdFavorite, MdEvent } from 'react-icons/md';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2025); // Default fallback
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <MdEvent className="text-white text-2xl" />
              </div>
              <span className="text-2xl font-bold">EventPro</span>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-md">
              Transforming the way professionals discover, organize, and participate in events. 
              Join thousands of users who trust our platform for their event management needs.
            </p>
            <div className="flex items-center space-x-2 text-slate-400">
              <span>Made with</span>
              <MdFavorite className="text-red-500 text-lg" />
              <span>by the EventPro Team</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/About" className="text-slate-300 hover:text-indigo-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-indigo-400 rounded-full mr-2 group-hover:w-2 transition-all duration-200"></span>
                  About Us
                </a>
              </li>
              <li>
                <a href="/Login" className="text-slate-300 hover:text-indigo-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-indigo-400 rounded-full mr-2 group-hover:w-2 transition-all duration-200"></span>
                  Sign In
                </a>
              </li>
              <li>
                <a href="/Register" className="text-slate-300 hover:text-indigo-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-indigo-400 rounded-full mr-2 group-hover:w-2 transition-all duration-200"></span>
                  Get Started
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-indigo-400 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-indigo-400 rounded-full mr-2 group-hover:w-2 transition-all duration-200"></span>
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-slate-300">
                <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <MdEmail className="text-indigo-400" />
                </div>
                <span>support@eventpro.com</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <MdPhone className="text-indigo-400" />
                </div>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <MdLocationOn className="text-indigo-400" />
                </div>
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-slate-400 text-sm">
              &copy; {currentYear} EventPro. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <a href="#" className="hover:text-indigo-400 transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-400 transition-colors duration-200">Terms of Service</a>
              <a href="#" className="hover:text-indigo-400 transition-colors duration-200">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
