'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdStar, MdEdit } from 'react-icons/md';
import EventCard from '../../../../components/EventCard';
import FeedbackModal from '../../../../components/FeedbackModal';
import FeedbackDisplayModal from '../../../../components/FeedbackDisplayModal';
import { getAllEvents, attendEvent } from '../../../../services/eventService';
import { createFeedback, getFeedbacksByUser, updateFeedback, getFeedbacksByEvent } from '../../../../services/feedbackService';

export default function Home() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userJoinedEvents, setUserJoinedEvents] = useState(new Set());

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
      const userId = localStorage.getItem('userId');
      
      if (!authToken) {
        router.push('/Login');
        return;
      }
      
      setCurrentUserId(userId);
    };

    checkAuth();
    fetchEvents();
    loadUserFeedbacks();
  }, [router]);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching events...');
      
      const response = await getAllEvents();
      console.log('Events fetched:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Load feedbacks for each event
        const eventsWithFeedbacks = await Promise.all(
          response.data.map(async (event) => {
            try {
              const feedbackResponse = await getFeedbacksByEvent(event._id);
              const feedbacks = feedbackResponse.data || [];
              
              // Calculate average rating
              const averageRating = feedbacks.length > 0 
                ? (feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length).toFixed(1)
                : 0;
              
              return {
                ...event,
                feedbacks,
                averageRating: parseFloat(averageRating),
                feedbackCount: feedbacks.length
              };
            } catch (error) {
              console.error(`Error loading feedbacks for event ${event._id}:`, error);
              return {
                ...event,
                feedbacks: [],
                averageRating: 0,
                feedbackCount: 0
              };
            }
          })
        );
        
        setEvents(eventsWithFeedbacks);
      } else {
        setEvents([]);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Load user's feedbacks
  const loadUserFeedbacks = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setUserFeedbacks([]);
        return;
      }

      const response = await getFeedbacksByUser(userId);
      const feedbackData = response.data || [];
      setUserFeedbacks(Array.isArray(feedbackData) ? feedbackData : []);
      console.log('User feedbacks loaded:', feedbackData);
    } catch (error) {
      console.error('Error loading user feedbacks:', error);
      setUserFeedbacks([]);
    }
  };

  // Check if user has joined events on component mount
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
        comment: feedbackData.comment,
        type: feedbackData.type,
        rating: feedbackData.rating,
        isAnonymous: feedbackData.isAnonymous
      };

      console.log('Submitting feedback:', submissionData);
      
      let response;
      if (feedbackModal.existingFeedback) {
        response = await updateFeedback(feedbackModal.existingFeedback._id, submissionData);
        alert('Feedback updated successfully!');
      } else {
        response = await createFeedback(submissionData);
        alert('Thank you for your feedback!');
      }
      
      console.log('Feedback operation successful:', response);
      
      // Refresh data
      await fetchEvents();
      await loadUserFeedbacks();
      
    } catch (error) {
      console.error('Error with feedback operation:', error);
      throw error;
    }
  };

  // Open feedback modal
  const handleOpenFeedback = (event, existingFeedback = null) => {
    console.log('Opening feedback modal for event:', event.title);
    console.log('Existing feedback:', existingFeedback);
    
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

  // Handle viewing feedbacks
  const handleViewFeedbacks = (event) => {
    console.log('Viewing feedbacks for event:', event.title);
    setFeedbackDisplayModal({
      isOpen: true,
      event: event
    });
  };

  // Close feedback display modal
  const handleCloseFeedbackDisplay = () => {
    setFeedbackDisplayModal({
      isOpen: false,
      event: null
    });
  };

  // Get user's feedback for a specific event
  const getUserFeedbackForEvent = (eventId) => {
    if (!Array.isArray(userFeedbacks)) {
      console.warn('userFeedbacks is not an array:', userFeedbacks);
      return null;
    }
    
    try {
      return userFeedbacks.find(feedback => feedback.eventId === eventId) || null;
    } catch (error) {
      console.error('Error finding user feedback:', error);
      return null;
    }
  };

 const handleJoinEvent = async (eventId) => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('Please login to join events');
    return;
  }

  if (userJoinedEvents.has(eventId)) {
    alert('You have already joined this event.');
    return;
  }

  try {
    console.log('Joining event:', eventId, 'User:', userId);
    const response = await attendEvent(eventId, { userId });
    console.log('Join event response:', response.data);

    setEvents(prevEvents =>
      prevEvents.map(event =>
        event._id === eventId
          ? { ...event, attendees: [...(event.attendees || []), userId] }
          : event
      )
    );

    setUserJoinedEvents(prev => new Set([...prev, eventId]));
    alert('Successfully joined the event!');
  } catch (err) {
    console.error('Error joining event:', err);
    alert(err.response?.data?.message || 'Failed to join event. Please try again.');
  }
};

  const handleCancelEvent = async (eventId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert('Please login to cancel event participation');
        return;
      }

      console.log('Cancelling event:', eventId, 'User:', userId);
      
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
      
      alert('Successfully cancelled your participation!');
    } catch (err) {
      console.error('Error cancelling event:', err);
      alert(err.response?.data?.message || 'Failed to cancel event participation. Please try again.');
    }
  };

  // ADD THIS FUNCTION - This was missing!
  const refreshEvents = async () => {
    setLoading(true);
    await fetchEvents();
    await loadUserFeedbacks();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EBD3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#555879] mx-auto"></div>
          <p className="mt-4 text-[#555879]">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4EBD3] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={refreshEvents}
            className="bg-[#555879] text-white px-6 py-2 rounded-full hover:bg-[#98A1BC] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EBD3] text-[#555879] p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Smart Event Management</h1>
        <p className="text-lg mb-8 text-[#98A1BC]">Discover and join amazing tech events</p>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Available Events</h2>
          <button
            onClick={refreshEvents}
            disabled={loading}
            className="bg-[#555879] text-white px-4 py-2 rounded-lg hover:bg-[#4A4C6A] transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard 
                key={event._id} 
                event={event} 
                onJoin={handleJoinEvent}
                onCancel={handleCancelEvent}
                onFeedback={handleOpenFeedback}
                onViewFeedbacks={handleViewFeedbacks}
                currentUserId={currentUserId}
                userFeedback={getUserFeedbackForEvent(event._id)}
                isJoined={userJoinedEvents.has(event._id)}
                showFeedbackButton={true}
                showJoinButton={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* My Recent Feedback Section */}
      {Array.isArray(userFeedbacks) && userFeedbacks.length > 0 && (
        <div className="max-w-7xl mx-auto mt-12">
          <h2 className="text-2xl font-semibold mb-6">My Recent Feedback</h2>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="space-y-4">
              {userFeedbacks.slice(0, 3).map((feedback) => {
                const event = events.find(e => e._id === feedback.eventId);
                return (
                  <div key={feedback._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-2">
                          {event?.title || 'Event Not Found'}
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
                          Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
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
                );
              })}
            </div>
            {userFeedbacks.length > 3 && (
              <div className="text-center mt-4">
                <button 
                  onClick={() => router.push('/(pages)/(Dashbord)/Event')}
                  className="text-[#555879] hover:underline text-sm"
                >
                  View all {userFeedbacks.length} feedbacks
                </button>
              </div>
            )}
          </div>
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
  );
}