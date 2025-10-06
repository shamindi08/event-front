'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdMenu, MdClose, MdDashboard, MdLogout, MdLogin, MdPersonAdd, MdEvent } from 'react-icons/md';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // ✅ Dev-only: Clear auth data once on fresh load
    if (process.env.NODE_ENV === 'development' && !localStorage.getItem('hasCleared')) {
      localStorage.clear();
      localStorage.setItem('hasCleared', 'true');
    }

    checkAuthStatus();

    const handleAuthChange = () => {
      checkAuthStatus();
    };

    // Listen for both event names for compatibility
    window.addEventListener('authChanged', handleAuthChange);
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [isMounted]);

  const checkAuthStatus = () => {
    if (!isMounted) return;
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userDataString = localStorage.getItem('userData');
      const expiry = localStorage.getItem('authExpiry');

      if (token && token !== 'null' && token !== 'undefined') {
        // Check expiry if it exists
        if (expiry) {
          const now = Date.now();
          if (now > parseInt(expiry)) {
            handleLogout();
            return;
          }
        }

        setIsLoggedIn(true);
        
        if (userDataString && userDataString !== 'null' && userDataString !== 'undefined') {
          try {
            const parsedUserData = JSON.parse(userDataString);
            setUserData(parsedUserData);
          } catch (error) {
            setUserData({ fName: 'User' });
          }
        } else {
          setUserData({ fName: 'User' });
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (!isMounted) return;
    
    try {
      // Clear all authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('authExpiry');
      localStorage.removeItem('userId');
      
      // Clear sessionStorage as well
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('authExpiry');
      sessionStorage.removeItem('userId');
      
      // Update state immediately
      setIsLoggedIn(false);
      setUserData(null);
      
      // Dispatch both event types for compatibility
      window.dispatchEvent(new Event('authChanged'));
      window.dispatchEvent(new Event('authChange'));
      
      // Redirect to home page
      router.push('/');
      
    } catch (error) {
      router.push('/');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (isLoading) {
    return (
      <nav className="bg-white/95 backdrop-blur-md shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg animate-pulse"></div>
              <div className="w-24 h-6 bg-slate-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-8 bg-slate-200 rounded animate-pulse"></div>
              <div className="w-16 h-8 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <MdEvent className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold gradient-text">EventPro</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                {/* Welcome Message */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {(userData?.fName || userData?.firstName || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-slate-700 font-medium">
                    Hi, {userData?.fName || userData?.firstName || 'User'}
                  </span>
                </div>

                {/* Dashboard Button */}
                <Link 
                  href="/Home"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200"
                >
                  <MdDashboard className="text-lg" />
                  <span>Dashboard</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center space-x-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-medium shadow-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200"
                >
                  <MdLogout className="text-lg" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Login Link */}
                <Link 
                  href="/Login"
                  className="inline-flex items-center space-x-2 text-slate-700 hover:text-indigo-600 font-medium transition-colors group"
                >
                  <MdLogin className="text-lg group-hover:scale-110 transition-transform duration-200" />
                  <span>Sign In</span>
                </Link>

                {/* Register Button */}
                <Link 
                  href="/Register"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200"
                >
                  <MdPersonAdd className="text-lg" />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            {isMobileMenuOpen ? (
              <MdClose className="text-xl" />
            ) : (
              <MdMenu className="text-xl" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md animate-slide-up">
            <div className="px-4 py-6 space-y-4">
              {isLoggedIn ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {(userData?.fName || userData?.firstName || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-900 font-medium">
                        {userData?.fName || userData?.firstName || 'User'} {userData?.lName || userData?.lastName || ''}
                      </p>
                      <p className="text-slate-500 text-sm">{userData?.email || ''}</p>
                    </div>
                  </div>

                  {/* Dashboard Link */}
                  <Link 
                    href="/Home"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium shadow-md"
                  >
                    <MdDashboard className="text-xl" />
                    <span>Dashboard</span>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-medium"
                  >
                    <MdLogout className="text-xl" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Login Link */}
                  <Link 
                    href="/Login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 w-full text-slate-700 px-4 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                  >
                    <MdLogin className="text-xl" />
                    <span>Sign In</span>
                  </Link>

                  {/* Register Link */}
                  <Link 
                    href="/Register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium shadow-md"
                  >
                    <MdPersonAdd className="text-xl" />
                    <span>Get Started</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}