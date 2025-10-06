'use client';

import { useState, useEffect } from 'react';
import { MdClose, MdStar, MdPerson, MdVisibilityOff, MdDateRange, MdLocationOn } from 'react-icons/md';
import { getFeedbacksByEvent } from '../services/feedbackService';

export default function FeedbackDisplayModal({ isOpen, onClose, event }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch feedbacks when modal opens
  useEffect(() => {
    console.log('FeedbackDisplayModal useEffect triggered:', { isOpen, event });
    if (isOpen && event?._id) {
      console.log('Conditions met, fetching feedbacks for event:', event._id);
      fetchEventFeedbacks();
    } else {
      console.log('Conditions not met:', { isOpen, eventId: event?._id });
    }
  }, [isOpen, event]);

  const fetchEventFeedbacks = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching feedbacks for event:', event._id);
      const response = await getFeedbacksByEvent(event._id);
      console.log('Raw API response:', response);
      
      // Handle the nested response structure
      const responseData = response.data || response;
      const feedbackData = responseData.feedbacks || responseData || [];
      
      console.log('Extracted feedbacks:', feedbackData);
      setFeedbacks(Array.isArray(feedbackData) ? feedbackData : []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      
      // Extract user-friendly error message
      const userErrorMessage = error.userMessage || 
                              error.response?.data?.message || 
                              error.response?.data?.error || 
                              error.message || 
                              'Failed to load feedbacks';
      
      setError(userErrorMessage);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <MdStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  const getFeedbackTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, feedback) => acc + (feedback.rating || 0), 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  if (!isOpen) {
    console.log('FeedbackDisplayModal not rendering - isOpen is false');
    return null;
  }

  console.log('FeedbackDisplayModal rendering with:', { isOpen, event, feedbacks });

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[#555879]">
                Event Feedbacks
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <MdClose />
            </button>
          </div>

          {/* Event Info */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800">{event?.title}</h4>
            <div className="flex items-center text-sm text-gray-600 mt-1 space-x-4">
              <div className="flex items-center">
                <MdDateRange className="w-4 h-4 mr-1" />
                {event?.date && new Date(event.date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <MdLocationOn className="w-4 h-4 mr-1" />
                {event?.location}
              </div>
            </div>

            {/* Average Rating */}
            {feedbacks.length > 0 && (
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 mr-2">Average Rating:</span>
                  {renderStars(parseFloat(calculateAverageRating()))}
                </div>
                <span className="text-lg font-bold text-[#555879]">
                  {calculateAverageRating()}/5
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#555879]"></div>
              <span className="ml-2 text-gray-600">Loading feedbacks...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4 text-4xl">⚠️</div>
              <p className="text-gray-800 font-medium mb-2">{error}</p>
              {error.includes('attendees') && (
                <p className="text-gray-500 text-sm mb-4">
                  You need to attend this event to view or submit feedback.
                </p>
              )}
              <button
                onClick={fetchEventFeedbacks}
                className="mt-4 px-4 py-2 bg-[#555879] text-white rounded-lg hover:bg-[#4A4C6A] transition"
              >
                Try Again
              </button>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-600 text-lg">No feedbacks yet</p>
              <p className="text-gray-500 text-sm">Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback, index) => (
                <div
                  key={feedback._id || index}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Feedback Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#555879] rounded-full flex items-center justify-center">
                        {feedback.isAnonymous ? (
                          <MdVisibilityOff className="text-white w-5 h-5" />
                        ) : (
                          <MdPerson className="text-white w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {feedback.isAnonymous 
                            ? 'Anonymous' 
                            : `${feedback.userId?.fName || feedback.user?.fName || feedback.user?.firstName || 'User'} ${feedback.userId?.lName || feedback.user?.lName || feedback.user?.lastName || ''}`.trim() || 'User'
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {feedback.createdAt && new Date(feedback.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {feedback.type && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getFeedbackTypeColor(feedback.type)}`}>
                          {feedback.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-3">
                    {renderStars(feedback.rating || 0)}
                  </div>

                  {/* Comment */}
                  <div className="text-gray-700">
                    <p className="leading-relaxed">{feedback.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}