'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {registerUser} from '../../../services/userService';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fName: '',
    lName: '',
    email: '',
    password: '',
    phone: ''
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
      console.log('Registration attempt:', formData);
      
      // Call the registerUser function
      const response = await registerUser(formData);
      
      console.log('Registration successful:', response);
      
      // On successful registration, redirect to login page
      router.push('/Login');
      
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EBD3] text-[#555879] flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <input 
          type="text" 
          name="fName"
          placeholder="First Name" 
          value={formData.fName}
          onChange={handleInputChange}
          className="w-full mb-4 p-2 border rounded" 
          required
        />
        
        <input 
          type="text" 
          name="lName"
          placeholder="Last Name" 
          value={formData.lName}
          onChange={handleInputChange}
          className="w-full mb-4 p-2 border rounded" 
          required
        />
        
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
          type="tel" 
          name="phone"
          placeholder="Phone Number" 
          value={formData.phone}
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
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/Login" className="text-[#555879] hover:text-[#98A1BC] font-medium underline">
              Login here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}