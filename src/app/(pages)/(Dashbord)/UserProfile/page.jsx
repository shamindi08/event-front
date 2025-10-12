'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdPerson, MdEmail, MdPhone, MdLocationOn, MdEdit, MdSave, MdCancel, MdEvent, MdCalendarToday, MdStar } from 'react-icons/md';
import { getUserProfile, updateUserProfile } from '../../../../services/userService';
import { getEventsByUserId, getAllEvents } from '../../../../services/eventService';
import AlertTemplate from '../../../../components/AlertTemplate';
import { useAlert } from '../../../../hooks/useAlert';

export default function UserProfile() {
  const router = useRouter();
  const { alert, showSuccess, showError, showWarning, showInfo, hideAlert } = useAlert();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fName: '',
    lName: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Add state for events data
  const [userEvents, setUserEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Function to load user's created events
  const loadUserEvents = async (userId) => {
    try {
      console.log('Loading events created by user:', userId);
      const response = await getEventsByUserId(userId);
      const eventsData = response.data || [];
      setUserEvents(Array.isArray(eventsData) ? eventsData : []);
      console.log('User created events loaded:', eventsData);
    } catch (error) {
      console.error('Error loading user events:', error);
      setUserEvents([]);
    }
  };

  // Function to load events the user has joined
  const loadJoinedEvents = async (userId) => {
    try {
      console.log('Loading events joined by user:', userId);
      const response = await getAllEvents();
      const allEvents = response.data || [];
      
      // Filter events where user is in attendees list
      const joinedEventsData = allEvents.filter(event => 
        event.attendees && event.attendees.includes(userId)
      );
      
      setJoinedEvents(joinedEventsData);
      console.log('User joined events loaded:', joinedEventsData);
    } catch (error) {
      console.error('Error loading joined events:', error);
      setJoinedEvents([]);
    }
  };

  // Function to load user profile (extracted to reuse)
  const loadUserProfile = async () => {
    try {
      // Check for authentication
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!authToken || !userId) {
        console.log('No auth token or user ID found, redirecting to login');
        router.push('/Login');
        return;
      }

      console.log('Loading user profile for user ID:', userId);

      try {
        // Try to fetch user profile from API
        const response = await getUserProfile(userId);
        // Our service normalizes 404 into null
        if (!response || (response && response.status === 404) || response === null) {
          setError('User not found.');
          setUser(null);
          setLoading(false);
          setEventsLoading(false);
          return;
        }

        const userData = response.data || response;
        setUser(userData);
        setFormData({
          fName: userData.fName || userData.firstName || '',
          lName: userData.lName || userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || ''
        });

        // Update localStorage with fresh data
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Load events data after user profile is loaded
        setEventsLoading(true);
        await Promise.all([
          loadUserEvents(userId),
          loadJoinedEvents(userId)
        ]);
        
      } catch (apiError) {
        console.log('API call failed, using localStorage data:', apiError);
        
        // Fallback to localStorage if API fails
        const localUserData = localStorage.getItem('userData');
        if (localUserData) {
          const parsedData = JSON.parse(localUserData);
          setUser(parsedData);
          setFormData({
            fName: parsedData.fName || '',
            lName: parsedData.lName || '',
            email: parsedData.email || '',
            phone: parsedData.phone || ''
          });

          // Still try to load events even if profile loading fails
          const userId = localStorage.getItem('userId');
          if (userId) {
            setEventsLoading(true);
            await Promise.all([
              loadUserEvents(userId),
              loadJoinedEvents(userId)
            ]);
          }
        } else {
          setError('Unable to load user profile. Please try logging in again.');
        }
      }
      
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Failed to load user profile.');
    } finally {
      setLoading(false);
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!authToken || !userId) {
        router.push('/Login');
        return;
      }

      console.log('Updating user profile:', formData);

      try {
        // Try to update via API
        const response = await updateUserProfile(userId, formData);
        console.log('Profile update response:', response);
        
        // Show success message
        showSuccess('Profile updated successfully!');
        
        // Refresh the user data from server after successful update
        console.log('Refreshing user data after update...');
        setLoading(true); // Show loading state while refreshing
        await loadUserProfile();
        
        setIsEditing(false);
        
      } catch (apiError) {
        console.log('API update failed, updating localStorage only:', apiError);
        
        // Fallback to localStorage update if API fails
        const updatedUserData = { ...user, ...formData };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        setUser(updatedUserData);
        
        showWarning('Profile updated locally. Changes may not be saved to server.', 'Partial Update');
        setIsEditing(false);
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      fName: user?.fName || '',
      lName: user?.lName || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
    setError('');
  };

  // Function to refresh data manually (optional)
  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    await loadUserProfile();
  };

  // Calculate user's join date (you can modify this based on your user data structure)
  const getMemberSince = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).getFullYear();
    }
    return new Date().getFullYear();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Profile Header Skeleton */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 space-y-6 lg:space-y-0">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse rounded-full mx-auto lg:mx-0"></div>
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="h-8 bg-slate-200 animate-pulse rounded w-1/2 mx-auto lg:mx-0"></div>
              <div className="h-5 bg-slate-200 animate-pulse rounded w-2/3 mx-auto lg:mx-0"></div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="h-6 bg-slate-200 animate-pulse rounded-full w-24"></div>
                <div className="h-6 bg-slate-200 animate-pulse rounded-full w-32"></div>
                <div className="h-6 bg-slate-200 animate-pulse rounded-full w-20"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Form Skeleton */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="space-y-6">
            <div className="h-7 bg-slate-200 animate-pulse rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-slate-200 animate-pulse rounded w-1/3"></div>
                  <div className="h-12 bg-slate-200 animate-pulse rounded-xl"></div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 animate-pulse rounded w-1/4"></div>
              <div className="h-24 bg-slate-200 animate-pulse rounded-xl"></div>
            </div>
            <div className="flex justify-end space-x-4">
              <div className="h-12 bg-slate-200 animate-pulse rounded-xl w-24"></div>
              <div className="h-12 bg-slate-200 animate-pulse rounded-xl w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-red-700 mb-6 text-lg">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => router.push('/Login')}
                className="btn-primary"
              >
                Go to Login
              </button>
              <button 
                onClick={handleRefresh}
                className="btn-secondary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center justify-between shadow-lg">
          <span className="font-medium">{error}</span>
          <button 
            onClick={() => setError('')}
            className="text-red-700 hover:text-red-900 font-bold text-xl p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <MdPerson className="text-4xl text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              {user ? `${user.fName || user.firstName || ''} ${user.lName || user.lastName || ''}` : 'User Profile'}
            </h1>
            <p className="text-slate-500 text-lg">Member since {getMemberSince()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            title="Refresh profile data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          {/* Edit button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-primary flex items-center space-x-2"
          >
            <MdEdit size={20} />
            <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center">
          <MdPerson className="mr-3 text-indigo-600" />
          Personal Information
        </h2>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fName"
                  value={formData.fName}
                  onChange={handleInputChange}
                  className="input-field"
                />
              ) : (
                <p className="text-slate-800 py-3 bg-slate-50 px-4 rounded-xl font-medium border border-slate-200">
                  {user?.fName || user?.firstName || 'Not provided'}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="lName"
                  value={formData.lName}
                  onChange={handleInputChange}
                  className="input-field"
                />
              ) : (
                <p className="text-slate-800 py-3 bg-slate-50 px-4 rounded-xl font-medium border border-slate-200">
                  {user?.lName || user?.lastName || 'Not provided'}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                <MdEmail className="inline mr-2 text-indigo-600" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                />
              ) : (
                <p className="text-slate-800 py-3 bg-slate-50 px-4 rounded-xl font-medium border border-slate-200">
                  {user?.email || 'Not provided'}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                <MdPhone className="inline mr-2 text-indigo-600" />
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-field"
                />
              ) : (
                <p className="text-slate-800 py-3 bg-slate-50 px-4 rounded-xl font-medium border border-slate-200">
                  {user?.phone || 'Not provided'}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons for editing */}
          {isEditing && (
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={handleCancel}
                className="btn-secondary flex items-center space-x-2"
              >
                <MdCancel />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <MdSave />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 mb-8">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-2 border-2 border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 hover:border-gray-500 flex items-center space-x-2 transition-colors font-medium disabled:opacity-50"
          >
            <MdCancel size={20} />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#555879] text-white rounded-md hover:bg-[#4A4C6A] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors font-medium shadow-md"
          >
            <MdSave size={20} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      )}

      {/* Stats Cards - Now with real data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Events Created */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Events Created</p>
              <p className="text-3xl font-bold text-[#555879] mt-1">
                {eventsLoading ? '...' : userEvents.length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Total events organized</p>
            </div>
            <div className="bg-[#555879] bg-opacity-10 p-3 rounded-full">
              <MdCalendarToday className="text-2xl text-[#555879]" />
            </div>
          </div>
        </div>

        {/* Events Joined */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Events Joined</p>
              <p className="text-3xl font-bold text-[#555879] mt-1">
                {eventsLoading ? '...' : joinedEvents.length}
              </p>
              <p className="text-sm text-gray-500 mt-1">Events attended</p>
            </div>
            <div className="bg-[#555879] bg-opacity-10 p-3 rounded-full">
              <MdEvent className="text-2xl text-[#555879]" />
            </div>
          </div>
        </div>

        {/* Membership Status */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Membership</p>
              <p className="text-3xl font-bold text-[#555879] mt-1">Active</p>
              <p className="text-sm text-gray-500 mt-1">Since {getMemberSince()}</p>
            </div>
            <div className="bg-[#555879] bg-opacity-10 p-3 rounded-full">
              <MdStar className="text-2xl text-[#555879]" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events Section */}
      {!eventsLoading && (userEvents.length > 0 || joinedEvents.length > 0) && (
        <div className="space-y-6">
          {/* Recent Created Events */}
          {userEvents.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-[#555879] mb-4 flex items-center">
                <MdCalendarToday className="mr-2" />
                Recent Events Created
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userEvents.slice(0, 4).map((event) => (
                  <div key={event._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-800">{event.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })} at {event.time}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{event.location}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {event.attendees?.length || 0} attendees
                      </span>
                      <button
                        onClick={() => router.push('/(pages)/(Dashbord)/Event')}
                        className="text-[#555879] hover:underline text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {userEvents.length > 4 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => router.push('/(pages)/(Dashbord)/Event')}
                    className="text-[#555879] hover:underline"
                  >
                    View all {userEvents.length} events
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recent Joined Events */}
          {joinedEvents.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-[#555879] mb-4 flex items-center">
                <MdEvent className="mr-2" />
                Recent Events Joined
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {joinedEvents.slice(0, 4).map((event) => (
                  <div key={event._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-800">{event.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })} at {event.time}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{event.location}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Organized by: {event.organizer}
                    </p>
                  </div>
                ))}
              </div>
              {joinedEvents.length > 4 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => router.push('/(pages)/(Dashbord)/Home')}
                    className="text-[#555879] hover:underline"
                  >
                    View all {joinedEvents.length} joined events
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Alert Template */}
      <AlertTemplate
        isOpen={alert.isOpen}
        onClose={hideAlert}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        autoClose={alert.autoClose}
        duration={alert.duration}
      />
    </div>
  );
}