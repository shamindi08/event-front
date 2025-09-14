'use client';
import { useState, useEffect } from 'react';
import { MdCalendarToday, MdLocationOn, MdPerson, MdFeedback, MdDelete, MdPeople, MdStar, MdEdit, MdCancel } from 'react-icons/md';
import { getFeedbacksByEvent } from '../services/feedbackService';

export default function EventCard({ 
  event, 
  onDelete, 
  onJoin, 
  onCancel, 
  onFeedback, 
  onAttend, 
  onViewFeedbacks, // New prop for viewing feedbacks
  showActions = false, 
  currentUserId, 
  userFeedback = null, 
  isJoined = false,
  showFeedbackButton = false,
  showJoinButton = false
}) {
  const [feedbacks, setFeedbacks] = useState(event.feedbacks || []);
  const [averageRating, setAverageRating] = useState(event.averageRating || 0);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  const isUserEvent = event.userId === currentUserId;
  const formatDate = (date) => new Date(date).toLocaleDateString();
  
  // Load feedbacks for this event if not already loaded
  useEffect(() => {
    if (!event.feedbacks) {
      const loadEventFeedbacks = async () => {
        try {
          setLoadingFeedbacks(true);
          const response = await getFeedbacksByEvent(event._id);
          const feedbackData = response.data || [];
          setFeedbacks(feedbackData);
          
          // Calculate average rating
          if (feedbackData.length > 0) {
            const totalRating = feedbackData.reduce((sum, feedback) => sum + feedback.rating, 0);
            setAverageRating((totalRating / feedbackData.length).toFixed(1));
          }
        } catch (error) {
          console.error('Error loading feedbacks:', error);
        } finally {
          setLoadingFeedbacks(false);
        }
      };

      loadEventFeedbacks();
    }
  }, [event._id, event.feedbacks]);

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

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Event Image */}
      {event.image && (
        <div className="h-48 bg-gray-200">
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
      
      {/* Event Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[#555879] mb-2 line-clamp-2">
          {event.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {event.description}
        </p>
        
        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <MdCalendarToday className="mr-2 text-[#555879]" />
            <span>{formatDate(event.date)} at {event.time}</span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <MdLocationOn className="mr-2 text-[#555879]" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <MdPerson className="mr-2 text-[#555879]" />
            <span>Organized by {event.organizer}</span>
          </div>

          {/* Rating and Feedback Count - Clickable */}
          {feedbacks.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <div className="flex items-center text-sm">
                  {renderStars(parseFloat(averageRating))}
                </div>
                <span className="text-sm text-gray-600">({averageRating})</span>
              </div>
              <button
                onClick={() => onViewFeedbacks && onViewFeedbacks(event)}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
              >
                {feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}

          {/* Show message if no feedbacks yet */}
          {feedbacks.length === 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">No reviews yet</span>
              <button
                onClick={() => onViewFeedbacks && onViewFeedbacks(event)}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
              >
                View feedbacks
              </button>
            </div>
          )}

          {/* Event Status and Attendees */}
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              event.eventstatus === 'upcoming' ? 'bg-blue-100 text-blue-800' :
              event.eventstatus === 'ongoing' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {event.eventstatus?.charAt(0).toUpperCase() + event.eventstatus?.slice(1) || 'Upcoming'}
            </span>
            
            <div className="flex items-center text-gray-500 text-xs">
              <MdPeople className="mr-1" />
              <span>{event.attendees?.length || 0} attending</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-100 pt-3">
          {showActions && isUserEvent ? (
            // For user's own events - show delete button
            <button
              onClick={() => onDelete(event._id)}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
            >
              <MdDelete />
              <span>Delete Event</span>
            </button>
          ) : (
            // For other events - show join/cancel and feedback buttons
            <div className="space-y-2">
              {/* Join/Cancel Button */}
              {(showJoinButton || onJoin || onCancel) && !isUserEvent && (
                <button
                  onClick={() => {
                    if (isJoined && onCancel) {
                      onCancel(event._id);
                    } else if (!isJoined && onJoin) {
                      onJoin(event._id);
                    } else if (onAttend) {
                      onAttend(event);
                    }
                  }}
                  className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                    isJoined
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-[#555879] text-white hover:bg-[#4A4C6A]'
                  }`}
                >
                  {isJoined ? <MdCancel /> : <MdPeople />}
                  <span>{isJoined ? 'Cancel Participation' : 'Join Event'}</span>
                </button>
              )}

              {/* Feedback Button */}
              {(showFeedbackButton || onFeedback) && !isUserEvent && (
                <button
                  onClick={() => onFeedback && onFeedback(event, userFeedback)}
                  className={`w-full px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                    userFeedback 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                      : 'bg-gradient-to-r from-[#555879] to-[#98A1BC] text-white hover:from-[#4A4C6A] hover:to-[#8A96B1]'
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
  );
}