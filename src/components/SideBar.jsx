'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MdClose, MdHome, MdEvent, MdPerson, MdLogout } from 'react-icons/md';

export default function Sidebar({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Simple and reliable connectivity check using browser native API
  const updateOnlineStatus = () => {
    const online = navigator.onLine;
    setIsOnline(online);
  };
  const checkAuthStatus = () => {
    if (!isMounted) return;
    
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      
      if (authToken && authToken !== 'null' && authToken !== 'undefined') {
        setIsLoggedIn(true);
        
        if (userData && userData !== 'null' && userData !== 'undefined') {
          try {
            const parsedUserData = JSON.parse(userData);
            setUser(parsedUserData);
          } catch (error) {
            setUser(null);
          }
        } else {
          // If no user data but has token, create a default user object
          setUser({ fName: 'User', email: 'user@example.com' });
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    
    // Initialize online status
    if (typeof window !== 'undefined') {
      updateOnlineStatus();
    }
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isMounted || typeof window === 'undefined') return;
    
    checkAuthStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'token' || e.key === 'userData') {
        checkAuthStatus();
      }
    };

    // Listen for custom auth change events (when login/logout happens in same tab)
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    // Listen for online/offline events
    const handleOnline = () => {
      updateOnlineStatus();
    };

    const handleOffline = () => {
      updateOnlineStatus();
    };

    // Handle visibility change to check connectivity when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateOnlineStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMounted]);

  const handleLogout = () => {
    if (!isMounted) return;
    
    try {
      // Clear all authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userData');
      localStorage.removeItem('tokenExpiration');
      
      // Clear sessionStorage as well
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('tokenExpiration');
      
      // Update state immediately
      setIsLoggedIn(false);
      setUser(null);
      
      // Trigger auth change event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authChange'));
      }
      
      // Close sidebar on mobile
      if (onClose) onClose();
      
      // Small delay to ensure state updates, then redirect
      setTimeout(() => {
        router.push('/');
      }, 100);
      
    } catch (error) {
      router.push('/');
    }
  };

  // Updated route checking function
  const isActiveRoute = (route) => {
    // Normalize pathname by removing trailing slashes
    const normalizedPathname = pathname.replace(/\/+$/, '');
    const normalizedRoute = route.replace(/\/+$/, '');
    
    // Check for exact match first
    if (normalizedPathname === normalizedRoute) return true;
    
    // Check for route-specific matches
    if (route.includes('/Home') && (
      normalizedPathname.includes('/Home') || 
      normalizedPathname === '/' ||
      normalizedPathname.endsWith('/Dashboard') ||
      normalizedPathname.endsWith('/Dashbord')
    )) return true;
    
    if (route.includes('/Event') && normalizedPathname.includes('/Event')) return true;
    if (route.includes('/UserProfile') && normalizedPathname.includes('/UserProfile')) return true;
    
    return false;
  };

  // Updated navigation items with correct paths
  const navItems = [
    { 
      href: '/Home',
      icon: MdHome, 
      label: 'Home' 
    },
    { 
      href: '/Event',
      icon: MdEvent, 
      label: 'Manage Events' 
    },
    { 
      href: '/UserProfile',
      icon: MdPerson, 
      label: 'Profile' 
    }
  ];

  // Handle navigation with proper routing
  const handleNavigation = (href) => {
    // Close sidebar on mobile
    if (onClose) onClose();
    
    router.push(href);
  };

  // Show loading state
  if (isLoading) {
    return null;
  }

  // Don't render sidebar if user is not logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 bg-opacity-50 z-30 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed md:relative h-full bg-white/65 backdrop-blur-xl shadow-2xl transform transition-transform duration-500 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 w-72 border-r border-slate-200 flex flex-col`}>
        
        {/* Mobile Close Button */}
        <div className="md:hidden p-4 flex justify-end">
          <button 
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800 transition-colors p-2 rounded-xl hover:bg-slate-100 group"
          >
            <MdClose size={20} className="group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>

      

        {/* User Profile Section */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">
                {user ? (user.fName || user.firstName || 'U')[0].toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 truncate">
                {user ? 
                  `${user.fName || user.firstName || 'User'} ${user.lName || user.lastName || ''}`.trim() 
                  : 'User Name'
                }
              </h3>
              <p className="text-sm text-slate-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 transition-all duration-300 ${
                  isOnline 
                    ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                    : 'bg-red-500 shadow-lg shadow-red-500/50'
                }`}></div>
                <span className={`text-xs font-semibold transition-colors duration-300 ${
                  isOnline ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 group ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl transform scale-105 border border-indigo-300' 
                        : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 text-slate-700 hover:text-indigo-700 hover:shadow-lg hover:transform hover:scale-105 border border-transparent hover:border-indigo-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20 shadow-inner' 
                        : 'bg-slate-100 group-hover:bg-indigo-100 group-hover:shadow-md'
                    }`}>
                      <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-600 group-hover:text-indigo-600'}`} />
                    </div>
                    <span className="font-semibold text-left flex-1">{item.label}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full shadow-lg animate-pulse"></div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

  
      </div>
    </>
  );
}