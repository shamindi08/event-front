'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdPerson, MdPhone, MdPersonAdd } from 'react-icons/md';
import { registerUser } from '../../../services/userService';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fName: '',
    lName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]); // array of error messages
  const [fieldErrors, setFieldErrors] = useState({}); // { email: '...', phone: '...' }
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  if (errors.length) setErrors([]);
  if (Object.keys(fieldErrors).length) setFieldErrors({});
  if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
      if (!formData.fName.trim() || !formData.lName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password || !formData.confirmPassword) {
        setErrors(['Please fill in all fields']);
        return;
      }

      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setErrors(['Please enter a valid email address']);
        return;
      }

      if (formData.phone.replace(/\D/g, '').length < 10) {
        setErrors(['Please enter a valid phone number']);
        return;
      }

      if (formData.password.length < 6) {
        setErrors(['Password must be at least 6 characters long']);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrors(['Passwords do not match']);
        return;
      }

    setLoading(true);
  setErrors([]);
  setFieldErrors({});
    setSuccess('');

    try {
      const registrationData = {
        fName: formData.fName.trim(),
        lName: formData.lName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\D/g, ''),
        password: formData.password
      };
      
      await registerUser(registrationData);
      
      setSuccess('Registration successful! Redirecting to login...');
      
      setTimeout(() => {
        router.push('/Login');
      }, 2000);
      
    } catch (err) {
      // Normalize different error shapes from backend / axios interceptor
      const msgs = [];
      const fieldErrs = {};

      // axios interceptor may attach a userMessage
      if (err.userMessage) {
        msgs.push(err.userMessage);
      }

      // If axios response exists, try to extract structured errors
      if (err.response && err.response.data) {
        const data = err.response.data;

        // common: { message: '...' }
        if (typeof data.message === 'string' && data.message.trim()) {
          msgs.push(data.message);
        }

        // sometimes backend returns { error: '...' }
        if (typeof data.error === 'string' && data.error.trim()) {
          msgs.push(data.error);
        }

        // validation errors as array: { errors: ['a','b'] }
        if (Array.isArray(data.errors) && data.errors.length) {
          data.errors.forEach(e => {
            if (typeof e === 'string') msgs.push(e);
            else if (e && e.msg) msgs.push(e.msg);
          });
        }

        // validation errors as object: { errors: { email: 'exists', phone: '...' } }
        if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
          Object.entries(data.errors).forEach(([k, v]) => {
            if (typeof v === 'string') {
              fieldErrs[k] = v;
              msgs.push(`${k}: ${v}`);
            } else if (Array.isArray(v) && v.length) {
              fieldErrs[k] = v.join(', ');
              msgs.push(`${k}: ${v.join(', ')}`);
            }
          });
        }

        // some APIs return { validation: { email: '...' } }
        if (data.validation && typeof data.validation === 'object') {
          Object.entries(data.validation).forEach(([k, v]) => {
            if (typeof v === 'string') {
              fieldErrs[k] = v;
              msgs.push(`${k}: ${v}`);
            }
          });
        }

        // fallback on status codes
        if (!msgs.length) {
          if (err.response.status === 409) msgs.push('An account with this email or phone already exists.');
          else msgs.push('Registration failed. Please try again.');
        }
      } else {
        // network or unknown error
        msgs.push(err.userMessage || 'Network error. Please check your connection and try again.');
      }

      // Deduplicate messages and set state
      const uniqueMsgs = Array.from(new Set(msgs.filter(Boolean)));
      setErrors(uniqueMsgs);
      setFieldErrors(fieldErrs);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdPersonAdd className="text-2xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join us today and get started!</p>
        </div>

        {/* Error Messages (global and field-specific) */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            <ul className="text-sm list-disc list-inside">
              {errors.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">{success}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdPerson className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="fName"
                  type="text"
                  name="fName"
                  value={formData.fName}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400 bg-white"
                  placeholder="John"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="lName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdPerson className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="lName"
                  type="text"
                  name="lName"
                  value={formData.lName}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400 bg-white"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdEmail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400 bg-white"
                placeholder="your@email.com"
                required
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdPhone className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400 bg-white"
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
            {fieldErrors.phone && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdLock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400 bg-white"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <MdVisibilityOff className="h-4 w-4" />
                ) : (
                  <MdVisibility className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdLock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-900 placeholder-gray-400 bg-white"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <MdVisibilityOff className="h-4 w-4" />
                ) : (
                  <MdVisibility className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/Login" className="text-purple-600 hover:text-purple-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
