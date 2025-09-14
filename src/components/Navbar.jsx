'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // ✅ Dev-only: Clear auth data once on fresh load
    if (process.env.NODE_ENV === 'development' && !localStorage.getItem('hasCleared')) {
      localStorage.clear();
      localStorage.setItem('hasCleared', 'true');
    }

    checkAuthStatus();

    const handleAuthChange = () => {
      console.log('Navbar: Auth change event received');
      checkAuthStatus();
    };

    // Listen for both event names for compatibility
    window.addEventListener('authChanged', handleAuthChange);
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userDataString = localStorage.getItem('userData');
      const expiry = localStorage.getItem('authExpiry');

      console.log('Navbar: Checking auth status');
      console.log('Navbar: Token exists:', !!token);

      if (token && token !== 'null' && token !== 'undefined') {
        // Check expiry if it exists
        if (expiry) {
          const now = Date.now();
          if (now > parseInt(expiry)) {
            console.log('Navbar: Token expired');
            handleLogout();
            return;
          }
        }

        setIsLoggedIn(true);
        
        if (userDataString && userDataString !== 'null' && userDataString !== 'undefined') {
          try {
            const parsedUserData = JSON.parse(userDataString);
            setUserData(parsedUserData);
            console.log('Navbar: User data loaded:', parsedUserData);
          } catch (error) {
            console.error('Navbar: Error parsing user data:', error);
            setUserData({ fName: 'User' });
          }
        } else {
          setUserData({ fName: 'User' });
        }
      } else {
        console.log('Navbar: No valid token found');
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('Navbar: Error checking auth status:', error);
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      console.log('Navbar: Logging out...');
      
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
      
      console.log('Navbar: Logout complete, redirecting to home');
      
      // Redirect to home page
      router.push('/');
      
    } catch (error) {
      console.error('Navbar: Error during logout:', error);
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <nav className="bg-gray-900 shadow fixed top-0 left-0 right-0 z-50">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link href="/" className="text-2xl font-semibold text-white">
            Eventify
          </Link>
          <div className="flex items-center space-x-4">
            <div className="animate-pulse bg-gray-700 h-4 w-20 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900 shadow fixed top-0 left-0 right-0 z-50">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href="/" className="text-2xl font-semibold text-white">
          Eventify
        </Link>
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <span className="text-white">
                Hi, {userData?.fName || userData?.firstName || 'User'}
              </span>
              <Link 
                href="/(pages)/(Dashbord)/Home"
                className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/Login">
                <span className="text-white hover:text-blue-400 font-medium cursor-pointer transition-colors">
                  Login
                </span>
              </Link>
              <Link href="/Register">
                <span className="text-white hover:text-blue-400 font-medium cursor-pointer transition-colors">
                  Register
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}