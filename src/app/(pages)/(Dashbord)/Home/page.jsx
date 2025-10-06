'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdStar, MdEdit } from 'react-icons/md';
import EventCard from '../../../../components/EventCard';
import EventDetailsModal from '../../../../components/EventDetailsModal';
import FeedbackSubmissionModal from '../../../../components/FeedbackSubmissionModal';
import FeedbackDisplayModal from '../../../../components/FeedbackDisplayModal';
import AlertTemplate from '../../../../components/AlertTemplate';
import { useAlert } from '../../../../hooks/useAlert';
import { getAllEvents, attendEvent, cancelAttendance } from '../../../../services/eventService';
import { createFeedback, getFeedbacksByUser, updateFeedback, getFeedbacksByEvent } from '../../../../services/feedbackService';

export default function Home() {
  const router = useRouter();
  const { alert, showSuccess, showError, showWarning, showInfo, hideAlert } = useAlert();
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

  // Event Details Modal State
  const [eventDetailsModal, setEventDetailsModal] = useState({
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
      
      const response = await getAllEvents();
      
      // Handle different response structures
      const eventsData = response.data || response;
      
      if (eventsData && Array.isArray(eventsData)) {
        // Load feedbacks for each event
        const eventsWithFeedbacks = await Promise.all(
          eventsData.map(async (event) => {
            try {
              const feedbackResponse = await getFeedbacksByEvent(event._id);
              const feedbacks = (feedbackResponse.data || feedbackResponse) || [];
              
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
    } catch (error) {
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
        showWarning('Please log in to submit feedback', 'Authentication Required');
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

      let response;
      if (feedbackModal.existingFeedback) {
        response = await updateFeedback(feedbackModal.existingFeedback._id, submissionData);
        showSuccess('Your feedback has been updated successfully!');
      } else {
        response = await createFeedback(submissionData);
        showSuccess('Thank you for your valuable feedback!');
      }
      
      // Refresh data
      await fetchEvents();
      await loadUserFeedbacks();
      
    } catch (error) {
      throw error;
    }
  };

  // Open feedback modal
  const handleOpenFeedback = (event, existingFeedback = null) => {
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
      return null;
    }
    
    try {
      return userFeedbacks.find(feedback => feedback.eventId === eventId) || null;
    } catch (error) {
      return null;
    }
  };

  // Handle event card click to open details modal
  const handleEventClick = (event) => {
    setEventDetailsModal({
      isOpen: true,
      event: event
    });
  };

  // Close event details modal
  const handleCloseEventDetails = () => {
    setEventDetailsModal({
      isOpen: false,
      event: null
    });
  };

  // Separate events into available and past
  const separateEvents = (events) => {
    const now = new Date();
    const availableEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now;
    });
    const pastEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < now;
    });
    return { availableEvents, pastEvents };
  };

  const { availableEvents, pastEvents } = separateEvents(events);

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
    setLoading(true);
    
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
    await fetchEvents();
    await loadUserFeedbacks();
    
  } catch (err) {
    showError(err.response?.data?.message || 'Failed to join event. Please try again.', 'Join Event Failed');
  } finally {
    setLoading(false);
  }
};

  const handleCancelEvent = async (eventId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        showWarning('Please log in to cancel event participation', 'Authentication Required');
        return;
      }

      // Set loading state
      setLoading(true);
      
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
      await fetchEvents();
      await loadUserFeedbacks();
      
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to cancel event participation. Please try again.', 'Cancellation Failed');
    } finally {
      setLoading(false);
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
      <div className="space-y-8">
        {/* Events Grid Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg"></div>
            <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-lg"></div>
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
        
        {/* Recent Feedback Skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-56 bg-slate-200 animate-pulse rounded-lg"></div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-slate-200 animate-pulse rounded w-1/2"></div>
                      <div className="flex items-center space-x-4">
                        <div className="h-4 bg-slate-200 animate-pulse rounded w-24"></div>
                        <div className="h-6 bg-slate-200 animate-pulse rounded-full w-16"></div>
                      </div>
                      <div className="h-4 bg-slate-200 animate-pulse rounded w-full"></div>
                      <div className="h-3 bg-slate-200 animate-pulse rounded w-1/3"></div>
                    </div>
                    <div className="h-10 w-10 bg-slate-200 animate-pulse rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-red-700 mb-6 text-lg">{error}</p>
            <button 
              onClick={refreshEvents}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      

      {/* Events Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-800">Events</h2>
          <button
            onClick={refreshEvents}
            disabled={loading}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>{loading ? 'Loading...' : 'Refresh Events'}</span>
          </button>
        </div>
        
        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📅</span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-700 mb-4">No Events Available</h3>
            <p className="text-slate-500 text-lg max-w-md mx-auto">
              There are no events available at the moment. Check back soon for exciting new events!
            </p>
          </div>
        ) : (
          <>
            {/* Available Events */}
            {availableEvents.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                  Available Events ({availableEvents.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {availableEvents.map((event) => (
                    <EventCard 
                      key={event._id} 
                      event={event} 
                      onJoin={handleJoinEvent}
                      onCancel={handleCancelEvent}
                      onFeedback={handleOpenFeedback}
                      onViewFeedbacks={handleViewFeedbacks}
                      onClick={handleEventClick}
                      currentUserId={currentUserId}
                      userFeedback={getUserFeedbackForEvent(event._id)}
                      isJoined={userJoinedEvents.has(event._id)}
                      showFeedbackButton={true}
                      showJoinButton={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 flex items-center">
                  <span className="w-3 h-3 bg-slate-400 rounded-full mr-3"></span>
                  Past Events ({pastEvents.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {pastEvents.map((event) => (
                    <EventCard 
                      key={event._id} 
                      event={event} 
                      onJoin={handleJoinEvent}
                      onCancel={handleCancelEvent}
                      onFeedback={handleOpenFeedback}
                      onViewFeedbacks={handleViewFeedbacks}
                      onClick={handleEventClick}
                      currentUserId={currentUserId}
                      userFeedback={getUserFeedbackForEvent(event._id)}
                      isJoined={userJoinedEvents.has(event._id)}
                      showFeedbackButton={true}
                      showJoinButton={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* My Recent Feedback Section */}
      {Array.isArray(userFeedbacks) && userFeedbacks.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-800">My Recent Feedback</h2>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="space-y-6">
              {userFeedbacks.slice(0, 3).map((feedback) => {
                // Handle both string ID and object ID formats
                const eventId = feedback.eventId?._id || feedback.eventId;
                const event = events.find(e => e._id === eventId);
                return (
                  <div key={feedback._id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-indigo-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-slate-800 mb-3">
                          {event?.title || 'Event Not Found'}
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
                          Submitted on {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => {
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
                );
              })}
            </div>
            {userFeedbacks.length > 3 && (
              <div className="text-center mt-8 pt-6 border-t border-slate-200">
                <button 
                  onClick={() => router.push('/(pages)/(Dashbord)/Event')}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline transition-colors duration-200"
                >
                  View all {userFeedbacks.length} feedbacks →
                </button>
              </div>
            )}
          </div>
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
        onJoin={handleJoinEvent}
        onCancel={handleCancelEvent}
        onFeedback={handleOpenFeedback}
        onViewFeedbacks={handleViewFeedbacks}
        currentUserId={currentUserId}
        userFeedback={eventDetailsModal.event ? getUserFeedbackForEvent(eventDetailsModal.event._id) : null}
        isJoined={eventDetailsModal.event ? userJoinedEvents.has(eventDetailsModal.event._id) : false}
        showFeedbackButton={true}
        showJoinButton={true}
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