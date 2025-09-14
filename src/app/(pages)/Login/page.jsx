'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loginUser } from '../../../services/userService';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Login attempt:', formData);
      
      // Call the loginUser function
      const response = await loginUser(formData);
      
      console.log('Login successful:', response);

      // Store token and user ID separately in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('token', response.data.token); // Also store as 'token' for consistency
      }
      
      if (response.data.id) {
        localStorage.setItem('userId', response.data.id.toString());
      }
      
      // Store user data if provided
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      } else {
        // Create basic user data object with login response
        const userData = {
          id: response.data.id,
          email: formData.email,
          fName: response.data.fName || response.data.firstName || '',
          lName: response.data.lName || response.data.lastName || ''
        };
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      
      // Trigger auth change event for navbar update
      window.dispatchEvent(new Event('authChange'));
      
      console.log('User authenticated, redirecting to profile...');
      
      // Navigate to user profile page after successful login
      router.push('/UserProfile');
      
    } catch (error) {
      console.error('Login failed:', error);
      
      // Handle different error structures
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EBD3] text-[#555879] flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <input 
          type="email" 
          name="email"
          placeholder="Email" 
          value={formData.email}
          onChange={handleInputChange}
          className="w-full mb-4 p-2 border rounded" 
          required
        />
        <input 
          type="password" 
          name="password"
          placeholder="Password" 
          value={formData.password}
          onChange={handleInputChange}
          className="w-full mb-4 p-2 border rounded" 
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#555879] text-white py-2 rounded hover:bg-[#98A1BC] disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/Register" className="text-[#555879] hover:text-[#98A1BC] font-medium underline">
              Register here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}