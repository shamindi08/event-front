'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Define public routes that don't require authentication
  const publicRoutes = ['/Login', '/Register', '/'];

  // Function to parse JWT token and get expiration
  const parseTokenExpiration = (token) => {
    try {
      if (!token) return null;
      
      // JWT tokens have 3 parts separated by dots
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return null;
      
      // Decode the payload (second part)
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Return expiration time (exp is in seconds, convert to milliseconds)
      return payload.exp ? payload.exp * 1000 : null;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  };

  // Function to check if token is expired
  const isTokenExpired = (expirationTime) => {
    if (!expirationTime) return true;
    return Date.now() > expirationTime;
  };

  // Function to logout user
  const logoutUser = () => {
    if (!isMounted) return;
    
    console.log('Logging out user due to token expiration');
    
    // Clear all auth-related data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
    localStorage.removeItem('tokenExpiration');
    
    // Update state
    setIsAuthenticated(false);
    
    // Redirect to login
    router.push('/Login');
    
    // Show notification to user via localStorage for pickup by other components
    if (typeof window !== 'undefined') {
      localStorage.setItem('authExpiredMessage', 'Your session has expired. Please log in again.');
      // Clean up the message after a short delay
      setTimeout(() => {
        localStorage.removeItem('authExpiredMessage');
      }, 100);
    }
  };

  // Function to set up automatic logout timer
  const setupAutoLogout = (expirationTime) => {
    if (!expirationTime) return;

    const timeUntilExpiration = expirationTime - Date.now();
    
    // If token is already expired, logout immediately
    if (timeUntilExpiration <= 0) {
      logoutUser();
      return;
    }

    // Set timeout to logout user when token expires
    const timeoutId = setTimeout(() => {
      logoutUser();
    }, timeUntilExpiration);

    // Store timeout ID so we can clear it later if needed
    window.authTimeoutId = timeoutId;

    console.log(`Auto logout scheduled in ${Math.round(timeUntilExpiration / 1000 / 60)} minutes`);
  };

  // Function to clear existing timeout
  const clearAutoLogout = () => {
    if (window.authTimeoutId) {
      clearTimeout(window.authTimeoutId);
      window.authTimeoutId = null;
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (authToken) {
        // Parse token expiration
        const expirationTime = parseTokenExpiration(authToken);
        
        if (expirationTime) {
          // Store expiration time in localStorage for reference
          localStorage.setItem('tokenExpiration', expirationTime.toString());
          
          // Check if token is expired
          if (isTokenExpired(expirationTime)) {
            console.log('Token is expired, logging out user');
            logoutUser();
            setIsLoading(false);
            return;
          } else {
            // Token is valid, set up auto logout
            setIsAuthenticated(true);
            setupAutoLogout(expirationTime);
            
            // Log remaining time for debugging
            const remainingMinutes = Math.round((expirationTime - Date.now()) / 1000 / 60);
            console.log(`Token expires in ${remainingMinutes} minutes`);
          }
        } else {
          // Could not parse expiration, treat as invalid token
          console.log('Could not parse token expiration, logging out user');
          logoutUser();
          setIsLoading(false);
          return;
        }
      } else {
        // No token found
        setIsAuthenticated(false);
        clearAutoLogout();
        
        // If user is not authenticated and trying to access protected route
        if (!publicRoutes.includes(pathname)) {
          router.push('/Login');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();

    // Clean up timeout when component unmounts or path changes
    return () => {
      clearAutoLogout();
    };
  }, [pathname, router, isMounted]);

  // Set up periodic token validation (check every minute)
  useEffect(() => {
    if (!isMounted) return;
    
    const intervalId = setInterval(() => {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const storedExpiration = localStorage.getItem('tokenExpiration');
      
      if (authToken && storedExpiration) {
        const expirationTime = parseInt(storedExpiration);
        
        if (isTokenExpired(expirationTime)) {
          console.log('Token expired during periodic check, logging out user');
          logoutUser();
        }
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(intervalId);
    };
  }, [isMounted]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4EBD3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#555879] mx-auto"></div>
          <p className="mt-4 text-[#555879]">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and trying to access protected route, redirect is handled above
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null;
  }

  return children;
}