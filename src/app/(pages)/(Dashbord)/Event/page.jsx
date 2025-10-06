'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdStar, MdEdit } from 'react-icons/md';
import EventCard from '../../../../components/EventCard';
import FeedbackSubmissionModal from '../../../../components/FeedbackSubmissionModal';
import FeedbackDisplayModal from '../../../../components/FeedbackDisplayModal';
import EventDetailsModal from '../../../../components/EventDetailsModal';
import AlertTemplate from '../../../../components/AlertTemplate';
import { useAlert } from '../../../../hooks/useAlert';
import { createEvent, getAllEvents, deleteEvent, getEventsByUserId, attendEvent, cancelAttendance } from '../../../../services/eventService';
import { createFeedback, getFeedbacksByUser, updateFeedback } from '../../../../services/feedbackService';
import { uploadSingleImage, validateFile, getFilePreviewUrl, formatFileSize } from '../../../../services/uploadService';

export default function Events() {
  const router = useRouter();
  const { alert, showSuccess, showError, showWarning, showInfo, hideAlert } = useAlert();
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [userFeedbacks, setUserFeedbacks] = useState([]); // Initialize as empty array
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userJoinedEvents, setUserJoinedEvents] = useState(new Set());
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    organizer: '',
    image: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('create');
  
  // Feedback Modal State
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    event: null,
    existingFeedback: null
  });

  // Feedback Display Modal State
  const [feedbackDisplayModal, setFeedbackDisplayModal] = useState({
    isOpen: false,
    event: null
  });

  // Event Details Modal State
  const [eventDetailsModal, setEventDetailsModal] = useState({
    isOpen: false,
    event: null
  });

  // Check authentication and get current user data
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      const userId = localStorage.getItem('userId');
      
      if (!authToken) {
        router.push('/Login');
        return;
      }
      
      setCurrentUserId(userId);
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setFormData(prev => ({
            ...prev,
            organizer: `${user.fName || user.firstName || ''} ${user.lName || user.lastName || ''}`.trim() || user.name || 'Unknown Organizer'
          }));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    checkAuth();
    loadAllEvents();
    loadUserEvents();
    loadUserFeedbacks();
  }, [router]);

  // Load all events
  const loadAllEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await getAllEvents();
      const eventsData = response.data || response;
      console.log('All events loaded:', eventsData);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error('Error loading events:', error);
      
      // Extract user-friendly error message
      const userErrorMessage = error.userMessage || 
                              error.response?.data?.message || 
                              error.response?.data?.error || 
                              'Failed to load events';
      
      setError(userErrorMessage);
      setEvents([]); // Set empty array on error
    } finally {
      setEventsLoading(false);
    }
  };

  // Load user's events
  const loadUserEvents = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setUserEvents([]);
        return;
      }

      const response = await getEventsByUserId(userId);
      const userEventsData = response.data || response;
      console.log('User events loaded:', userEventsData);
      setUserEvents(Array.isArray(userEventsData) ? userEventsData : []);
    } catch (error) {
      console.error('Error loading user events:', error);
      setUserEvents([]); // Set empty array on error
    }
  };

  // Load user's feedbacks
  const loadUserFeedbacks = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setUserFeedbacks([]); // Set empty array if no userId
        return;
      }

      const response = await getFeedbacksByUser(userId);
      const responseData = response.data || response;
      const feedbackData = responseData.feedbacks || responseData || [];
      
      // Ensure feedbackData is an array
      const feedbackArray = Array.isArray(feedbackData) ? feedbackData : [];
      setUserFeedbacks(feedbackArray);
      console.log('User feedbacks loaded:', feedbackArray);
    } catch (error) {
      console.error('Error loading user feedbacks:', error);
      setUserFeedbacks([]); // Set empty array on error
    }
  };

  // Check if user has joined events when events are loaded
  useEffect(() => {
    const checkUserJoinedEvents = () => {
      const userId = localStorage.getItem('userId');
      if (userId && events.length > 0) {
        const joinedEvents = new Set();
        events.forEach(event => {
          if (event.attendees && event.attendees.includes(userId)) {
            joinedEvents.add(event._id);
          }
        });
        setUserJoinedEvents(joinedEvents);
      }
    };

    checkUserJoinedEvents();
  }, [events]);

  // Handle feedback submission
  // ...existing code...

// Handle feedback submission - Add more detailed logging
const handleFeedbackSubmit = async (feedbackData) => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      showWarning('Please log in to submit feedback', 'Authentication Required');
      return;
    }

    const submissionData = {
      userId: userId,
      eventId: feedbackData.eventId,
      comment: feedbackData.comment || '', // Ensure comment is not undefined
      type: feedbackData.type || 'neutral', // Ensure type is not undefined
      rating: feedbackData.rating || 1, // Ensure rating is not undefined
      isAnonymous: feedbackData.isAnonymous || false
    };

    console.log('Submitting feedback with data:', submissionData);
    console.log('Original feedbackData:', feedbackData);
    
    // Validate required fields before sending
    if (!submissionData.eventId || !submissionData.comment || !submissionData.type || !submissionData.rating) {
      throw new Error('Missing required feedback fields');
    }
    
    let response;
    if (feedbackModal.existingFeedback) {
      // Update existing feedback
      response = await updateFeedback(feedbackModal.existingFeedback._id, submissionData);
      showSuccess('Your feedback has been updated successfully!');
    } else {
      // Create new feedback
      response = await createFeedback(submissionData);
      showSuccess('Thank you for your valuable feedback!');
    }
    
    console.log('Feedback operation successful:', response);
    
    // Refresh data
    await loadAllEvents();
    await loadUserFeedbacks();
    
  } catch (error) {
    console.error('Error with feedback operation:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

// ...existing code...
  // Open feedback modal with check for existing feedback
  const handleOpenFeedback = (event, existingFeedback = null) => {
    console.log('Opening feedback modal for event:', event.title);
    console.log('Existing feedback:', existingFeedback);
    
    // Check if user already has feedback for this event (when not editing)
    if (!existingFeedback) {
      const userFeedbackForEvent = getUserFeedbackForEvent(event._id);
      if (userFeedbackForEvent) {
        showInfo('You have already submitted feedback for this event. You can edit your existing feedback from the "My Feedback" tab.', 'Feedback Already Submitted');
        return;
      }
    }
    
    setFeedbackModal({
      isOpen: true,
      event: event,
      existingFeedback: existingFeedback
    });
  };

  // Close feedback modal
  const handleCloseFeedback = () => {
    setFeedbackModal({
      isOpen: false,
      event: null,
      existingFeedback: null
    });
  };

  // Add handlers for event details modal
  const handleEventClick = (event) => {
    setEventDetailsModal({
      isOpen: true,
      event: event
    });
  };

  const handleCloseEventDetails = () => {
    setEventDetailsModal({
      isOpen: false,
      event: null
    });
  };

  // Utility function to separate events by date
  const separateEventsByDate = (events) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const availableEvents = [];
    const pastEvents = [];
    
    events.forEach(event => {
      const eventDate = new Date(event.date);
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      
      if (eventDateOnly >= today) {
        availableEvents.push(event);
      } else {
        pastEvents.push(event);
      }
    });
    
    return { availableEvents, pastEvents };
  };

  // Get separated events
  const { availableEvents, pastEvents } = separateEventsByDate(events);
  const { availableEvents: availableUserEvents, pastEvents: pastUserEvents } = separateEventsByDate(userEvents);
  const handleViewFeedbacks = (event) => {
    console.log('handleViewFeedbacks called with event:', event);
    console.log('Event ID:', event?._id);
    console.log('Setting feedbackDisplayModal to open');
    setFeedbackDisplayModal({
      isOpen: true,
      event: event
    });
  };

  const handleCloseFeedbackDisplay = () => {
    setFeedbackDisplayModal({
      isOpen: false,
      event: null
    });
  };

  // Get user's feedback for a specific event - with proper error handling
  const getUserFeedbackForEvent = (eventId) => {
    // Ensure userFeedbacks is an array and eventId is valid
    if (!Array.isArray(userFeedbacks) || !eventId) {
      console.warn('getUserFeedbackForEvent: Invalid parameters', { 
        userFeedbacks: typeof userFeedbacks, 
        isArray: Array.isArray(userFeedbacks),
        eventId 
      });
      return null;
    }
    
    try {
      // Handle both string and object eventId comparison
      const feedback = userFeedbacks.find(feedback => {
        const feedbackEventId = feedback.eventId?._id || feedback.eventId;
        return feedbackEventId === eventId;
      });
      return feedback || null;
    } catch (error) {
      console.error('Error finding user feedback:', error);
      return null;
    }
  };

  // Refresh events
  const refreshEvents = async () => {
    setEventsLoading(true);
    await loadAllEvents();
    await loadUserEvents();
    await loadUserFeedbacks();
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setImagePreview(null);
      setFormData(prev => ({
        ...prev,
        image: ''
      }));
      return;
    }

    const validation = validateFile(file, 'image');
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    const previewUrl = getFilePreviewUrl(file);
    setImagePreview(previewUrl);
    setError('');
    
    console.log('File selected:', file.name, 'Size:', formatFileSize(file.size));
  };

  // Upload image
  const uploadImage = async () => {
    if (!selectedFile) return null;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      console.log('Starting image upload...');

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await uploadSingleImage(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('Full upload response:', response);

      let imageUrl = '';
      const responseData = response.data || response;

      if (responseData?.data?.imageUrl) {
        imageUrl = responseData.data.imageUrl;
      } else if (typeof responseData?.data === 'string') {
        imageUrl = responseData.data;
      }

      if (!imageUrl) {
        imageUrl =
          responseData?.fileUrl ||
          responseData?.url ||
          responseData?.path ||
          responseData?.filename ||
          responseData?.imagePath ||
          responseData?.imageUrl ||
          response?.fileUrl ||
          response?.url ||
          response?.path ||
          response?.filename ||
          response?.imagePath ||
          response?.imageUrl ||
          '';
      }

      console.log('Extracted image URL:', imageUrl);

      if (!imageUrl) {
        console.error('No URL found in response. Full response:', response);
        throw new Error(
          'Image uploaded successfully but no URL was returned from the server. Please check your upload service configuration.'
        );
      }

      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;

        if (status === 413) {
          throw new Error('Image file is too large. Please choose a smaller file.');
        } else if (status === 415) {
          throw new Error('Image file type not supported. Please use JPEG, PNG, or GIF.');
        } else if (message) {
          throw new Error(`Upload failed: ${message}`);
        } else {
          throw new Error(`Upload failed with status ${status}`);
        }
      } else if (error.message?.includes('Network Error')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(`Image upload failed: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!userId || !authToken) {
        router.push('/Login');
        return;
      }

      if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.location) {
        throw new Error('Please fill in all required fields');
      }

      let imageUrl = '';
      
      if (selectedFile) {
        try {
          console.log('Uploading image before creating event...');
          imageUrl = await uploadImage();
          console.log('Image uploaded successfully, URL:', imageUrl);
        } catch (uploadError) {
          console.warn('Image upload failed, creating event without image:', uploadError.message);
          
          const continueWithoutImage = window.confirm(
            `Image upload failed: ${uploadError.message}\n\nWould you like to create the event without an image?`
          );
          
          if (!continueWithoutImage) {
            throw uploadError;
          }
          
          setSelectedFile(null);
          setImagePreview(null);
          setUploadProgress(0);
          
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) fileInput.value = '';
        }
      }

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: formData.time,
        location: formData.location.trim(),
        organizer: formData.organizer.trim(),
        image: imageUrl || '',
        userId: userId
      };

      console.log('Creating event with data:', eventData);

      const response = await createEvent(eventData);
      console.log('Event created successfully:', response);

      await loadAllEvents();
      await loadUserEvents();
      
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        organizer: formData.organizer,
        image: ''
      });
      
      setSelectedFile(null);
      setImagePreview(null);
      setUploadProgress(0);
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      showSuccess('Event created successfully! Your event is now live and ready for registrations.');
      setActiveTab('myEvents');

    } catch (error) {
      console.error('Error creating event:', error);
      let errorMessage = 'Failed to create event';
      
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this event?');
      if (!confirmDelete) return;

      console.log('Deleting event:', eventId);
      await deleteEvent(eventId);
      
      await loadAllEvents();
      await loadUserEvents();
      
      showSuccess('Event deleted successfully!');
    } catch (error) {
      showError('Failed to delete event. Please try again.', 'Deletion Failed');
    }
  };

  // Handle joining an event
  const handleJoinEvent = async (eventId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      showWarning('Please log in to join events', 'Authentication Required');
      return;
    }

    if (userJoinedEvents.has(eventId)) {
      showInfo('You have already joined this event', 'Already Registered');
      return;
    }

    try {
      // Set loading state
      setEventsLoading(true);
      
      const response = await attendEvent(eventId, { userId });

      setEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === eventId
            ? { ...event, attendees: [...(event.attendees || []), userId] }
            : event
        )
      );

      setUserJoinedEvents(prev => new Set([...prev, eventId]));
      showSuccess('Successfully joined the event! We look forward to seeing you there.');
      
      // Refresh the component data to ensure everything is up-to-date
      await loadAllEvents();
      await loadUserEvents();
      await loadUserFeedbacks();
      
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to join event. Please try again.', 'Join Event Failed');
    } finally {
      setEventsLoading(false);
    }
  };

  // Handle canceling event attendance
  const handleCancelEvent = async (eventId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        showWarning('Please log in to cancel event participation', 'Authentication Required');
        return;
      }

      // Set loading state
      setEventsLoading(true);
      
      // Call backend API to cancel attendance
      await cancelAttendance(eventId, { userId });
      
      // Update UI state after successful API call
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event._id === eventId 
            ? { ...event, attendees: (event.attendees || []).filter(id => id !== userId) }
            : event
        )
      );
      
      setUserJoinedEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
      
      showSuccess('Successfully cancelled your participation. You can rejoin anytime!');
      
      // Refresh the component data to ensure everything is up-to-date
      await loadAllEvents();
      await loadUserEvents();
      await loadUserFeedbacks();
      
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to cancel event participation. Please try again.', 'Cancellation Failed');
    } finally {
      setEventsLoading(false);
    }
  };

  // Clear image
  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    setUploadProgress(0);
    
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold text-slate-800">Event Management</h2>
        <div className="text-sm text-slate-500">
          Manage your events and track feedback
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-8">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            activeTab === 'create' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-indigo-600 border border-slate-200'
          }`}
        >
          Create Event
        </button>
        <button
          onClick={() => setActiveTab('myEvents')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            activeTab === 'myEvents' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-indigo-600 border border-slate-200'
          }`}
        >
          My Events ({userEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            activeTab === 'all' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-indigo-600 border border-slate-200'
          }`}
        >
          All Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            activeTab === 'feedback' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-indigo-600 border border-slate-200'
          }`}
        >
          My Feedback ({Array.isArray(userFeedbacks) ? userFeedbacks.length : 0})
        </button>
      </div>

      {/* Create Event Tab */}
      {activeTab === 'create' && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-8">Create New Event</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="title"
                placeholder="Event Title *"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              
              <input
                type="text"
                name="organizer"
                placeholder="Organizer Name *"
                value={formData.organizer}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              
              <input
                type="text"
                name="location"
                placeholder="Event Location *"
                value={formData.location}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="input-field"
                required
              />
              
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="input-field"
                required
              />
              
              <div className="relative">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="input-field"
                  disabled={isUploading || loading}
                />
                {selectedFile && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 text-xl font-bold p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
                    disabled={isUploading || loading}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <textarea
                name="description"
                placeholder="Event Description *"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="input-field resize-none"
                required
              />
            </div>
            
            {/* Image Preview */}
            {selectedFile && (
              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50">
                <div className="flex items-start space-x-4">
                  {imagePreview && (
                    <div className="flex-shrink-0">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-24 h-24 object-cover rounded-xl border-2 border-white shadow-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700 mb-1">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 mb-3">Size: {formatFileSize(selectedFile.size)}</p>
                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span>Uploading...</span>
                          <span className="font-semibold">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div>
                <p className="text-sm text-slate-500">* Required fields</p>
                {selectedFile && (
                  <p className="text-xs text-slate-400 mt-1">
                    Image will be uploaded when you create the event
                  </p>
                )}
              </div>
              <button 
                type="submit" 
                disabled={loading || isUploading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
              >
                <span>{loading ? (isUploading ? 'Uploading Image...' : 'Creating Event...') : 'Create Event'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

        {/* My Events Tab */}
        {activeTab === 'myEvents' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800">My Events</h3>
              <button
                onClick={refreshEvents}
                disabled={eventsLoading}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>{eventsLoading ? 'Loading...' : 'Refresh Events'}</span>
              </button>
            </div>
            
            {eventsLoading ? (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="h-5 bg-slate-200 animate-pulse rounded w-48 mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                      <div className="h-32 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-slate-200 animate-pulse rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 animate-pulse rounded w-full"></div>
                        <div className="h-4 bg-slate-200 animate-pulse rounded w-2/3"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-slate-200 animate-pulse rounded w-1/2"></div>
                          <div className="h-3 bg-slate-200 animate-pulse rounded w-2/3"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 bg-slate-200 animate-pulse rounded w-1/3"></div>
                          <div className="h-6 bg-slate-200 animate-pulse rounded-full w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : userEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📅</span>
                </div>
                <h3 className="text-2xl font-semibold text-slate-700 mb-4">No Events Created Yet</h3>
                <p className="text-slate-500 text-lg mb-6">You haven't created any events yet. Start by creating your first event!</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="btn-primary"
                >
                  Create Your First Event
                </button>
              </div>
            ) : (
              <>
                {/* Available User Events */}
                {availableUserEvents.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-slate-700 flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                      Upcoming Events ({availableUserEvents.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {availableUserEvents.map((event) => (
                        <EventCard 
                          key={event._id} 
                          event={event} 
                          onDelete={handleDeleteEvent}
                          onViewFeedbacks={handleViewFeedbacks}
                          onClick={handleEventClick}
                          showActions={true}
                          currentUserId={currentUserId}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Past User Events */}
                {pastUserEvents.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-slate-700 flex items-center">
                      <span className="w-3 h-3 bg-slate-400 rounded-full mr-3"></span>
                      Past Events ({pastUserEvents.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {pastUserEvents.map((event) => (
                        <EventCard 
                          key={event._id} 
                          event={event} 
                          onDelete={handleDeleteEvent}
                          onViewFeedbacks={handleViewFeedbacks}
                          onClick={handleEventClick}
                          showActions={true}
                          currentUserId={currentUserId}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state when no events in either category */}
                {availableUserEvents.length === 0 && pastUserEvents.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">📅</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-700 mb-4">No Events Created Yet</h3>
                    <p className="text-slate-500 text-lg mb-6">You haven't created any events yet. Start by creating your first event!</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="btn-primary"
                    >
                      Create Your First Event
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}        {/* All Events Tab */}
        {activeTab === 'all' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800">All Events</h3>
              <button
                onClick={refreshEvents}
                disabled={eventsLoading}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>{eventsLoading ? 'Loading...' : 'Refresh Events'}</span>
              </button>
            </div>
            
            {eventsLoading ? (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="h-5 bg-slate-200 animate-pulse rounded w-40 mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                      <div className="h-32 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-slate-200 animate-pulse rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 animate-pulse rounded w-full"></div>
                        <div className="h-4 bg-slate-200 animate-pulse rounded w-2/3"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-slate-200 animate-pulse rounded w-1/2"></div>
                          <div className="h-3 bg-slate-200 animate-pulse rounded w-2/3"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 bg-slate-200 animate-pulse rounded w-1/3"></div>
                          <div className="h-6 bg-slate-200 animate-pulse rounded-full w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎉</span>
                </div>
                <h3 className="text-2xl font-semibold text-slate-700 mb-4">No Events Available</h3>
                <p className="text-slate-500 text-lg">There are no events available at the moment. Check back soon!</p>
              </div>
            ) : (
              <>
                {/* Available Events */}
                {availableEvents.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-slate-700 flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                      Available Events ({availableEvents.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {availableEvents.map((event) => (
                        <EventCard 
                          key={event._id} 
                          event={event}
                          showActions={false}
                          onFeedback={handleOpenFeedback}
                          onViewFeedbacks={handleViewFeedbacks}
                          onClick={handleEventClick}
                          currentUserId={currentUserId}
                          userFeedback={getUserFeedbackForEvent(event._id)}
                          showFeedbackButton={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Events */}
                {pastEvents.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-slate-700 flex items-center">
                      <span className="w-3 h-3 bg-slate-400 rounded-full mr-3"></span>
                      Past Events ({pastEvents.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {pastEvents.map((event) => (
                        <EventCard 
                          key={event._id} 
                          event={event}
                          showActions={false}
                          onFeedback={handleOpenFeedback}
                          onViewFeedbacks={handleViewFeedbacks}
                          onClick={handleEventClick}
                          currentUserId={currentUserId}
                          userFeedback={getUserFeedbackForEvent(event._id)}
                          showFeedbackButton={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state when no events in either category */}
                {availableEvents.length === 0 && pastEvents.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">🎉</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-700 mb-4">No Events Available</h3>
                    <p className="text-slate-500 text-lg">There are no events available at the moment. Check back soon!</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* My Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800">My Feedback</h3>
              <button
                onClick={() => loadUserFeedbacks()}
                className="btn-secondary flex items-center space-x-2"
              >
                <span>Refresh Feedback</span>
              </button>
            </div>
            
            {!Array.isArray(userFeedbacks) || userFeedbacks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">💬</span>
                </div>
                <h3 className="text-2xl font-semibold text-slate-700 mb-4">No Feedback Yet</h3>
                <p className="text-slate-500 text-lg mb-6">You haven't submitted any feedback yet. Start by attending events and sharing your experience!</p>
                <button
                  onClick={() => setActiveTab('all')}
                  className="btn-primary"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="space-y-6">
                  {userFeedbacks.map((feedback) => (
                    <div key={feedback._id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-indigo-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-slate-800 mb-3">
                            {feedback.eventId.title || 'Event Not Found'}
                          </h4>
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <MdStar 
                                  key={i} 
                                  className={`text-lg ${i < feedback.rating ? 'text-yellow-400' : 'text-slate-300'}`} 
                                />
                              ))}
                              <span className="text-sm text-slate-600 font-medium ml-2">({feedback.rating}/5)</span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              feedback.type === 'positive' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' :
                              feedback.type === 'neutral' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700' :
                              'bg-gradient-to-r from-red-100 to-pink-100 text-red-700'
                            }`}>
                              {feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}
                            </span>
                          </div>
                          <p className="text-slate-600 mb-3 leading-relaxed">{feedback.comment}</p>
                          <p className="text-sm text-slate-400">
                            {feedback.isAnonymous ? 'Anonymous' : 'Public'} • 
                            Submitted on {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            console.log('Edit button clicked for feedback:', feedback);
                            console.log('Available events:', events);
                            console.log('Looking for eventId:', feedback.eventId);
                          
                          // Handle both string ID and object ID formats
                          const eventId = feedback.eventId?._id || feedback.eventId;
                          const event = events.find(e => e._id === eventId);
                          
                          console.log('Found event:', event);
                          
                          if (event) {
                            handleOpenFeedback(event, feedback);
                          } else {
                            showError('Could not find the event for this feedback. Please try refreshing the page.', 'Event Not Found');
                          }
                        }}
                        className="ml-4 p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                      >
                        <MdEdit className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback Submission Modal */}
      <FeedbackSubmissionModal
        isOpen={feedbackModal.isOpen}
        onClose={handleCloseFeedback}
        event={feedbackModal.event}
        existingFeedback={feedbackModal.existingFeedback}
        onSubmit={handleFeedbackSubmit}
      />

      {/* Feedback Display Modal */}
      <FeedbackDisplayModal
        isOpen={feedbackDisplayModal.isOpen}
        onClose={handleCloseFeedbackDisplay}
        event={feedbackDisplayModal.event}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={eventDetailsModal.isOpen}
        onClose={handleCloseEventDetails}
        event={eventDetailsModal.event}
        onDelete={handleDeleteEvent}
        onJoin={handleJoinEvent}
        onCancel={handleCancelEvent}
        onFeedback={handleOpenFeedback}
        onViewFeedbacks={handleViewFeedbacks}
        showActions={true}
        showJoinButton={true}
        currentUserId={currentUserId}
        isJoined={eventDetailsModal.event ? userJoinedEvents.has(eventDetailsModal.event._id) : false}
      />

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