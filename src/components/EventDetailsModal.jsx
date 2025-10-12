'use client';
import { useState, useEffect } from 'react';
import { MdClose, MdCalendarToday, MdLocationOn, MdPerson, MdFeedback, MdDelete, MdPeople, MdStar, MdEdit, MdCancel } from 'react-icons/md';
import { getFeedbacksByEvent } from '../services/feedbackService';

export default function EventDetailsModal({ 
  isOpen, 
  onClose, 
  event,
  onDelete,
  onJoin,
  onCancel,
  onFeedback,
  onViewFeedbacks,
  showActions = false,
  currentUserId,
  userFeedback = null,
  isJoined = false,
  showFeedbackButton = false,
  showJoinButton = false,
  canCancel = true
}) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  const isUserEvent = event?.userId === currentUserId;
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const formatTime = (time) => time;

  // Load feedbacks for this event
  useEffect(() => {
    if (isOpen && event) {
      console.log('EventDetailsModal - Event data:', event);
      console.log('EventDetailsModal - Event feedbacks:', event.feedbacks);
      console.log('EventDetailsModal - Event averageRating:', event.averageRating);
      
      // Use existing feedback data if available, otherwise load from API
      if (event.feedbacks) {
        console.log('Event has feedbacks property:', event.feedbacks);
        
        // Handle different feedback data structures
        let feedbackArray = [];
        let avgRating = 0;
        
        if (Array.isArray(event.feedbacks)) {
          // Direct array
          feedbackArray = event.feedbacks;
          avgRating = event.averageRating || 0;
        } else if (event.feedbacks.feedbacks && Array.isArray(event.feedbacks.feedbacks)) {
          // Response object with feedbacks property
          feedbackArray = event.feedbacks.feedbacks;
          avgRating = event.feedbacks.statistics?.averageRating || event.averageRating || 0;
        } else if (typeof event.feedbacks === 'object' && event.feedbacks.message) {
          // This is the response object itself
          feedbackArray = event.feedbacks.feedbacks || [];
          avgRating = event.feedbacks.statistics?.averageRating || event.averageRating || 0;
        }
        
        console.log('Using existing feedback data, array:', feedbackArray, 'count:', feedbackArray.length);
        setFeedbacks(feedbackArray);
        setAverageRating(parseFloat(avgRating) || 0);
      } else {
        console.log('Loading feedback data from API');
        const loadEventFeedbacks = async () => {
          try {
            setLoadingFeedbacks(true);
            const response = await getFeedbacksByEvent(event._id);
            console.log('API response:', response);
            
            // Handle new API response structure
            let feedbackData = [];
            let avgRating = 0;
            
            if (response.data) {
              // If response has data property
              if (response.data.feedbacks && Array.isArray(response.data.feedbacks)) {
                feedbackData = response.data.feedbacks;
                avgRating = response.data.statistics?.averageRating || 0;
              } else if (Array.isArray(response.data)) {
                feedbackData = response.data;
              }
            } else if (response.feedbacks && Array.isArray(response.feedbacks)) {
              // Direct response structure
              feedbackData = response.feedbacks;
              avgRating = response.statistics?.averageRating || 0;
            } else if (Array.isArray(response)) {
              // Array response
              feedbackData = response;
            }
            
            console.log('Processed feedback data:', feedbackData);
            console.log('Average rating from API:', avgRating);
            
            setFeedbacks(feedbackData);
            
            // Use average rating from API statistics, or calculate if not available
            if (avgRating > 0) {
              setAverageRating(parseFloat(avgRating));
            } else if (feedbackData.length > 0) {
              const totalRating = feedbackData.reduce((sum, feedback) => sum + feedback.rating, 0);
              const calculatedAvg = (totalRating / feedbackData.length).toFixed(1);
              setAverageRating(parseFloat(calculatedAvg));
            } else {
              setAverageRating(0);
            }
          } catch (error) {
            console.error('Error loading feedbacks:', error);
            setFeedbacks([]);
            setAverageRating(0);
          } finally {
            setLoadingFeedbacks(false);
          }
        };

        loadEventFeedbacks();
      }
    } else {
      // Reset state when modal is closed or no event
      setFeedbacks([]);
      setAverageRating(0);
      setLoadingFeedbacks(false);
    }
  }, [isOpen, event?._id]); // Also depend on event ID to reset when event changes

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<MdStar key={i} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<MdStar key="half" className="text-yellow-400 opacity-50" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<MdStar key={`empty-${i}`} className="text-gray-300" />);
    }

    return stars;
  };

  const handleButtonClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Event Details</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Event Image */}
          {event.image && (
            <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden mb-6">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Event Title and Status */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-bold text-slate-800 flex-1 mr-4">
              {event.title}
            </h3>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
              event.eventstatus === 'upcoming' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700' :
              event.eventstatus === 'ongoing' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' :
              'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700'
            }`}>
              {event.eventstatus?.charAt(0).toUpperCase() + event.eventstatus?.slice(1) || 'Upcoming'}
            </span>
          </div>

          {/* Event Description */}
          <p className="text-slate-600 mb-6 leading-relaxed">
            {event.description}
          </p>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-4">
              <div className="flex items-center text-slate-600">
                <MdCalendarToday className="mr-3 text-indigo-500 text-xl" />
                <div>
                  <p className="font-semibold">{formatDate(event.date)}</p>
                  <p className="text-sm">{formatTime(event.time)}</p>
                </div>
              </div>
              
              <div className="flex items-center text-slate-600">
                <MdLocationOn className="mr-3 text-indigo-500 text-xl" />
                <div>
                  <p className="font-semibold">Location</p>
                  {event.locationUrl ? (
                    <a 
                      href={event.locationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm hover:text-indigo-600 hover:underline transition-colors duration-200"
                    >
                      {event.location}(click here)
                    </a>
                  ) : (
                    <p className="text-sm">{event.location} </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-slate-600">
                <MdPerson className="mr-3 text-indigo-500 text-xl" />
                <div>
                  <p className="font-semibold">Organizer</p>
                  <p className="text-sm">{event.organizer}</p>
                </div>
              </div>

              <div className="flex items-center text-slate-600">
                <MdPeople className="mr-3 text-indigo-500 text-xl" />
                <div>
                  <p className="font-semibold">Attendees</p>
                  <p className="text-sm">{event.attendees?.length || 0} people attending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rating and Feedback Section */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6 border border-amber-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-800">Reviews & Ratings</h4>
              <button
                onClick={(e) => handleButtonClick(e, () => onViewFeedbacks && onViewFeedbacks(event))}
                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors font-medium"
              >
                View All Reviews
              </button>
            </div>
            
            {console.log('Render - feedbacks state:', feedbacks, 'length:', feedbacks.length)}
            {feedbacks.length > 0 ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {renderStars(parseFloat(averageRating))}
                </div>
                <span className="text-lg font-bold text-slate-700">{averageRating}</span>
                <span className="text-sm text-slate-600">
                  ({feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''})
                </span>
              </div>
            ) : (
              <p className="text-slate-600">No reviews yet. Be the first to leave a review!</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t border-slate-200 pt-6">
            {showActions && isUserEvent ? (
              // For user's own events - show delete button
              <button
                onClick={(e) => handleButtonClick(e, () => onDelete(event._id))}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-4 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <MdDelete />
                <span>Delete Event</span>
              </button>
            ) : (
              // For other events - show join/cancel and feedback buttons
              <div className="space-y-3">
                {/* Join/Cancel Button */}
                {(showJoinButton || onJoin || onCancel) && !isUserEvent && (
                  <button
                    onClick={(e) => {
                      // Prevent joining ongoing or completed events
                      if (!isJoined && (event.eventstatus === 'ongoing' || event.eventstatus === 'completed' || event.eventstatus === 'finished')) {
                        return;
                      }
                      // Prevent canceling if within 3 hours and user is joined
                      if (isJoined && !canCancel) {
                        return;
                      }
                      handleButtonClick(e, () => {
                        if (isJoined && onCancel) {
                          onCancel(event._id);
                        } else if (!isJoined && onJoin) {
                          onJoin(event._id);
                        }
                      });
                    }}
                    disabled={(!isJoined && (event.eventstatus === 'ongoing' || event.eventstatus === 'completed' || event.eventstatus === 'finished')) || (isJoined && !canCancel)}
                    className={`w-full px-6 py-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-semibold shadow-lg transform ${
                      (!isJoined && (event.eventstatus === 'ongoing' || event.eventstatus === 'completed' || event.eventstatus === 'finished')) || (isJoined && !canCancel)
                        ? 'bg-gradient-to-r from-slate-200 to-gray-200 text-slate-500 cursor-not-allowed opacity-60'
                        : isJoined
                        ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 hover:from-red-200 hover:to-pink-200 border border-red-200 hover:shadow-xl hover:scale-105'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    {(!isJoined && (event.eventstatus === 'ongoing' || event.eventstatus === 'completed' || event.eventstatus === 'finished')) ? (
                      <>
                        <MdCancel />
                        <span>
                          {event.eventstatus === 'ongoing' ? 'Event Already Started' : 'Event Ended'}
                        </span>
                      </>
                    ) : (isJoined && !canCancel) ? (
                      <>
                        <MdCancel />
                        <span>
                          {event.eventstatus === 'ongoing' ? 'Cannot Cancel (Event Active)' : 'Cannot Cancel (Within 3 Hours)'}
                        </span>
                      </>
                    ) : (
                      <>
                        {isJoined ? <MdCancel /> : <MdPeople />}
                        <span>{isJoined ? 'Cancel Participation' : 'Join Event'}</span>
                      </>
                    )}
                  </button>
                )}

                {/* Feedback Button */}
                {(showFeedbackButton || onFeedback) && !isUserEvent && (
                  <button
                    onClick={(e) => handleButtonClick(e, () => onFeedback && onFeedback(event, userFeedback))}
                    className={`w-full px-6 py-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                      userFeedback 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                        : 'bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900 border border-slate-600'
                    }`}
                  >
                    {userFeedback ? <MdEdit /> : <MdFeedback />}
                    <span>{userFeedback ? 'Edit Feedback' : 'Give Feedback'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}