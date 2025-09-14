'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdStar, MdEdit } from 'react-icons/md';
import EventCard from '../../../../components/EventCard';
import FeedbackModal from '../../../../components/FeedbackModal';
import FeedbackDisplayModal from '../../../../components/FeedbackDisplayModal'; // Add this import
import { createEvent, getAllEvents, deleteEvent, getEventsByUserId } from '../../../../services/eventService';
import { createFeedback, getFeedbacksByUser, updateFeedback } from '../../../../services/feedbackService';
import { uploadSingleImage, validateFile, getFilePreviewUrl, formatFileSize } from '../../../../services/uploadService';

export default function Events() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [userFeedbacks, setUserFeedbacks] = useState([]); // Initialize as empty array
  const [currentUserId, setCurrentUserId] = useState(null);
  
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
      setError('Failed to load events');
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
      const feedbackData = response.data.feedbacks || [];
      
      // Ensure feedbackData is an array
      const feedbackArray = Array.isArray(feedbackData) ? feedbackData : [];
      setUserFeedbacks(feedbackArray);
      console.log('User feedbacks loaded:', feedbackArray);
    } catch (error) {
      console.error('Error loading user feedbacks:', error);
      setUserFeedbacks([]); // Set empty array on error
    }
  };

  // Handle feedback submission
  // ...existing code...

// Handle feedback submission - Add more detailed logging
const handleFeedbackSubmit = async (feedbackData) => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please log in to submit feedback');
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
      alert('Feedback updated successfully!');
    } else {
      // Create new feedback
      response = await createFeedback(submissionData);
      alert('Thank you for your feedback!');
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
        alert('You have already submitted feedback for this event. You can edit your existing feedback from the "My Feedback" tab.');
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

  // Add handlers for feedback display modal
  const handleViewFeedbacks = (event) => {
    console.log('Viewing feedbacks for event:', event.title);
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

      if (response?.data?.data?.imageUrl) {
        imageUrl = response.data.data.imageUrl;
      } else if (typeof response?.data?.data === 'string') {
        imageUrl = response.data.data;
      }

      if (!imageUrl) {
        imageUrl =
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

      alert('Event created successfully!');
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
      
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
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
    <div className="min-h-screen bg-[#F4EBD3] text-[#555879] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold mb-6">Event Management</h2>
        
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'create' 
                ? 'border-b-2 border-[#555879] text-[#555879]' 
                : 'text-gray-500 hover:text-[#555879]'
            }`}
          >
            Create Event
          </button>
          <button
            onClick={() => setActiveTab('myEvents')}
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'myEvents' 
                ? 'border-b-2 border-[#555879] text-[#555879]' 
                : 'text-gray-500 hover:text-[#555879]'
            }`}
          >
            My Events ({userEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'all' 
                ? 'border-b-2 border-[#555879] text-[#555879]' 
                : 'text-gray-500 hover:text-[#555879]'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'feedback' 
                ? 'border-b-2 border-[#555879] text-[#555879]' 
                : 'text-gray-500 hover:text-[#555879]'
            }`}
          >
            My Feedback ({Array.isArray(userFeedbacks) ? userFeedbacks.length : 0})
          </button>
        </div>

        {/* Create Event Tab */}
        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4">Create New Event</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                name="title"
                placeholder="Event Title *"
                value={formData.title}
                onChange={handleInputChange}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#555879] focus:border-transparent"
                required
              />
              
              <input
                type="text"
                name="organizer"
                placeholder="Organizer Name *"
                value={formData.organizer}
                onChange={handleInputChange}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#555879] focus:border-transparent"
                required
              />
              
              <input
                type="text"
                name="location"
                placeholder="Event Location *"
                value={formData.location}
                onChange={handleInputChange}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#555879] focus:border-transparent"
                required
              />
              
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#555879] focus:border-transparent"
                required
              />
              
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#555879] focus:border-transparent"
                required
              />
              
              <div className="relative">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#555879] focus:border-transparent"
                  disabled={isUploading || loading}
                />
                {selectedFile && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 text-xl font-bold"
                    disabled={isUploading || loading}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            
            {/* Image Preview */}
            {selectedFile && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start space-x-4">
                  {imagePreview && (
                    <div className="flex-shrink-0">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">Size: {formatFileSize(selectedFile.size)}</p>
                    {isUploading && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#555879] h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <textarea
              name="description"
              placeholder="Event Description *"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#555879] focus:border-transparent"
              rows={4}
              required
            />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">* Required fields</p>
                {selectedFile && (
                  <p className="text-xs text-gray-400 mt-1">
                    Image will be uploaded when you create the event
                  </p>
                )}
              </div>
              <button 
                type="submit" 
                disabled={loading || isUploading}
                className="bg-[#555879] text-white px-6 py-2 rounded-lg hover:bg-[#4A4C6A] transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (isUploading ? 'Uploading Image...' : 'Creating Event...') : 'Create Event'}
              </button>
            </div>
          </form>
        )}

        {/* My Events Tab */}
        {activeTab === 'myEvents' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">My Events</h3>
              <button
                onClick={refreshEvents}
                disabled={eventsLoading}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
              >
                {eventsLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {eventsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#555879] mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading your events...</p>
              </div>
            ) : userEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You haven't created any events yet.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-2 text-[#555879] hover:underline"
                >
                  Create your first event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userEvents.map((event) => (
                  <EventCard 
                    key={event._id} 
                    event={event} 
                    onDelete={handleDeleteEvent}
                    onViewFeedbacks={handleViewFeedbacks}
                    showActions={true}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Events Tab */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">All Events</h3>
              <button
                onClick={refreshEvents}
                disabled={eventsLoading}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
              >
                {eventsLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {eventsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#555879] mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No events available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard 
                    key={event._id} 
                    event={event}
                    showActions={false}
                    onFeedback={handleOpenFeedback}
                    onViewFeedbacks={handleViewFeedbacks}
                    currentUserId={currentUserId}
                    userFeedback={getUserFeedbackForEvent(event._id)}
                    showFeedbackButton={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">My Feedback</h3>
              <button
                onClick={() => loadUserFeedbacks()}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Refresh
              </button>
            </div>
            
            {!Array.isArray(userFeedbacks) || userFeedbacks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You haven't submitted any feedback yet.</p>
                <button
                  onClick={() => setActiveTab('all')}
                  className="mt-2 text-[#555879] hover:underline"
                >
                  Browse events to leave feedback
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userFeedbacks.map((feedback) => (
                  <div key={feedback._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-2">
                          {feedback.eventId.title || 'Event Not Found'}
                        </h4>
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <MdStar 
                                key={i} 
                                className={`text-sm ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="text-sm text-gray-600">({feedback.rating}/5)</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            feedback.type === 'positive' ? 'bg-green-100 text-green-800' :
                            feedback.type === 'neutral' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{feedback.comment}</p>
                        <p className="text-xs text-gray-500">
                          {feedback.isAnonymous ? 'Anonymous' : 'Public'} • 
                          Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const event = events.find(e => e._id === feedback.eventId);
                          if (event) {
                            handleOpenFeedback(event, feedback);
                          }
                        }}
                        className="ml-4 text-[#555879] hover:text-[#4A4C6A] text-sm"
                      >
                        <MdEdit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feedback Modal */}
        <FeedbackModal
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
      </div>
    </div>
  );
}