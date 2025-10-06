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
  onClick, // New prop for card click
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
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
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
          // Error loading feedbacks, use fallback
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
    <div 
      className="group bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 hover-glow cursor-pointer"
      onClick={() => onClick && onClick(event)}
    >
      {/* Event Image */}
      {event.image && (
        <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      )}
      
      {/* Event Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors duration-200">
          {event.title}
        </h3>
        
        <p className="text-slate-600 text-sm mb-3 line-clamp-2 leading-relaxed">
          {event.description}
        </p>
        
        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-slate-600 text-xs">
            <MdCalendarToday className="mr-2 text-indigo-500" />
            <span className="font-medium">{formatDate(event.date)} at {event.time}</span>
          </div>
          
          <div className="flex items-center text-slate-600 text-xs">
            <MdLocationOn className="mr-2 text-indigo-500" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Rating and Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {feedbacks.length > 0 ? (
              <>
                <div className="flex items-center text-xs">
                  {renderStars(parseFloat(averageRating)).slice(0, 5)}
                </div>
                <span className="text-xs text-slate-600">({averageRating})</span>
              </>
            ) : (
              <span className="text-xs text-slate-500">No reviews</span>
            )}
          </div>
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            event.eventstatus === 'upcoming' ? 'bg-blue-100 text-blue-700' :
            event.eventstatus === 'ongoing' ? 'bg-green-100 text-green-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {event.eventstatus?.charAt(0).toUpperCase() + event.eventstatus?.slice(1) || 'Upcoming'}
          </span>
        </div>
      </div>
    </div>
  );
}