'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MdClose, MdHome, MdEvent, MdPerson, MdLogout } from 'react-icons/md';

export default function Sidebar({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Check authentication status
  const checkAuthStatus = () => {
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      
      console.log('Sidebar: Checking auth status');
      console.log('Sidebar: Token exists:', !!authToken);
      
      if (authToken && authToken !== 'null' && authToken !== 'undefined') {
        setIsLoggedIn(true);
        
        if (userData && userData !== 'null' && userData !== 'undefined') {
          try {
            const parsedUserData = JSON.parse(userData);
            setUser(parsedUserData);
            console.log('Sidebar: User data loaded:', parsedUserData);
          } catch (error) {
            console.error('Sidebar: Error parsing user data:', error);
            setUser(null);
          }
        } else {
          // If no user data but has token, create a default user object
          setUser({ fName: 'User', email: 'user@example.com' });
        }
      } else {
        console.log('Sidebar: User not logged in');
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Sidebar: Error checking auth status:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      checkAuthStatus();

      // Listen for storage changes (when user logs in/out in another tab)
      const handleStorageChange = (e) => {
        console.log('Sidebar: Storage changed:', e.key);
        if (e.key === 'authToken' || e.key === 'token' || e.key === 'userData') {
          checkAuthStatus();
        }
      };

      // Listen for custom auth change events (when login/logout happens in same tab)
      const handleAuthChange = () => {
        console.log('Sidebar: Auth change event received');
        checkAuthStatus();
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('authChange', handleAuthChange);

      // Cleanup event listeners
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('authChange', handleAuthChange);
      };
    }
  }, []);

  const handleLogout = () => {
    try {
      console.log('Sidebar: Logging out...');
      
      // Clear all authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userData');
      localStorage.removeItem('tokenExpiration'); // Also clear token expiration
      
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
      
      console.log('Sidebar: Logout complete, redirecting to home');
      
      // Close sidebar on mobile
      if (onClose) onClose();
      
      // Small delay to ensure state updates, then redirect
      setTimeout(() => {
        router.push('/');
      }, 100);
      
    } catch (error) {
      console.error('Sidebar: Error during logout:', error);
      router.push('/');
    }
  };

  // Updated route checking function
  const isActiveRoute = (route) => {
    console.log('Checking route:', route, 'Current pathname:', pathname);
    
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
      href: '/Home', // Simplified path
      icon: MdHome, 
      label: 'Home' 
    },
    { 
      href: '/Event', // Simplified path
      icon: MdEvent, 
      label: 'Manage Events' 
    },
    { 
      href: '/UserProfile', // Simplified path
      icon: MdPerson, 
      label: 'Profile' 
    }
  ];

  // Handle navigation with proper routing
  const handleNavigation = (href) => {
    console.log('Navigating to:', href);
    
    // Close sidebar on mobile
    if (onClose) onClose();
    
    // Use router.push with proper path construction
    let fullPath = href;
    
    // If the href doesn't start with /, add the proper route group path
    if (!href.startsWith('/') || href === '/Home' || href === '/Event' || href === '/UserProfile') {
      // Map simplified paths to full paths
      const pathMap = {
        '/Home': '/Home',
        '/Event': '/Event', 
        '/UserProfile': '/UserProfile'
      };
      
      fullPath = pathMap[href] || href;
    }
    
    console.log('Full navigation path:', fullPath);
    router.push(fullPath);
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
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed md:relative h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 w-64 border-r border-gray-200 flex flex-col`}>
        
        {/* Mobile Close Button */}
        <div className="md:hidden p-4 flex justify-end">
          <button 
            onClick={onClose}
            className="text-[#555879] hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3 mt-4 md:mt-16">
            <div className="w-12 h-12 bg-gradient-to-br from-[#555879] to-[#98A1BC] rounded-full flex items-center justify-center shadow-md">
              <MdPerson className="text-white text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#555879] truncate text-sm">
                {user ? 
                  `${user.fName || user.firstName || 'User'} ${user.lName || user.lastName || ''}`.trim() 
                  : 'User Name'
                }
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
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
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#555879] to-[#6B7196] text-white shadow-lg transform scale-105' 
                        : 'hover:bg-gradient-to-r hover:from-[#F4EBD3] hover:to-[#E8DCC6] text-[#555879] hover:shadow-md hover:transform hover:scale-105'
                    }`}
                  >
                    <Icon size={20} className={`${isActive ? 'text-white' : 'text-[#555879] group-hover:text-[#555879]'}`} />
                    <span className="font-medium text-left">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <button 
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <MdLogout size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}