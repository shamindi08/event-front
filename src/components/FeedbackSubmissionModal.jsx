'use client';

import { useState, useEffect } from 'react';
import { MdClose, MdStar, MdSentimentVerySatisfied, MdSentimentNeutral, MdSentimentVeryDissatisfied } from 'react-icons/md';
import AlertTemplate from './AlertTemplate';
import { useAlert } from '../hooks/useAlert';

export default function FeedbackSubmissionModal({ isOpen, onClose, event, onSubmit, existingFeedback = null }) {
  const { alert, showSuccess, showError, showWarning, showInfo, hideAlert } = useAlert();
  const [feedback, setFeedback] = useState({
    comment: existingFeedback?.comment || '',
    type: existingFeedback?.type || '',
    rating: existingFeedback?.rating || 0,
    isAnonymous: existingFeedback?.isAnonymous || false
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or when existingFeedback changes
  useEffect(() => {
    console.log('FeedbackSubmissionModal useEffect:', { isOpen, existingFeedback });
    if (isOpen) {
      setFeedback({
        comment: existingFeedback?.comment || '',
        type: existingFeedback?.type || '',
        rating: existingFeedback?.rating || 0,
        isAnonymous: existingFeedback?.isAnonymous || false
      });
      console.log('Set feedback data:', {
        comment: existingFeedback?.comment || '',
        type: existingFeedback?.type || '',
        rating: existingFeedback?.rating || 0,
        isAnonymous: existingFeedback?.isAnonymous || false
      });
    }
  }, [isOpen, existingFeedback]);

  const feedbackTypes = [
    {
      type: 'positive',
      label: 'Positive',
      icon: MdSentimentVerySatisfied,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-500'
    },
    {
      type: 'neutral',
      label: 'Neutral',
      icon: MdSentimentNeutral,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-500'
    },
    {
      type: 'negative',
      label: 'Negative',
      icon: MdSentimentVeryDissatisfied,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-500'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate feedback data before submission
    if (!feedback.comment?.trim()) {
      showWarning('Please enter your feedback comment', 'Missing Comment');
      return;
    }
    
    if (!feedback.type) {
      showWarning('Please select a feedback type', 'Missing Type');
      return;
    }
    
    if (!feedback.rating || feedback.rating < 1) {
      showWarning('Please select a rating', 'Missing Rating');
      return;
    }
    
    if (!event?._id) {
      showError('Event information is missing', 'System Error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const feedbackData = {
        eventId: event._id,
        comment: feedback.comment.trim(),
        type: feedback.type,
        rating: feedback.rating,
        isAnonymous: feedback.isAnonymous
      };
      
      console.log('FeedbackSubmissionModal: Submitting feedback data:', feedbackData);
      
      await onSubmit(feedbackData);
      
      // Reset form and close modal
      setFeedback({
        comment: '',
        type: '',
        rating: 0,
        isAnonymous: false
      });
      onClose();
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      
      // Extract user-friendly error message
      const userErrorMessage = error.userMessage || 
                              error.response?.data?.message || 
                              error.response?.data?.error || 
                              error.message || 
                              'Failed to submit feedback. Please try again.';
      
      showError(userErrorMessage, 'Submission Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeSelect = (type) => {
    setFeedback(prev => ({ ...prev, type }));
  };

  const handleRatingClick = (rating) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleCommentChange = (e) => {
    setFeedback(prev => ({ ...prev, comment: e.target.value }));
  };

  const handleAnonymousChange = (e) => {
    setFeedback(prev => ({ ...prev, isAnonymous: e.target.checked }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#555879]">
              {existingFeedback ? 'Edit Feedback' : 'Share Your Feedback'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={isSubmitting}
            >
              <MdClose />
            </button>
          </div>

          {/* Event Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800">{event?.title}</h4>
            <p className="text-sm text-gray-600">
              {event?.date && new Date(event.date).toLocaleDateString()} at {event?.time}
            </p>
            <p className="text-sm text-gray-600">{event?.location}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you rate this event? *
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-2xl focus:outline-none transition-colors"
                    disabled={isSubmitting}
                  >
                    <MdStar
                      className={`${
                        star <= (hoveredRating || feedback.rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      } hover:text-yellow-400`}
                    />
                  </button>
                ))}
                {feedback.rating > 0 && (
                  <span className="ml-2 text-sm text-gray-600">
                    ({feedback.rating}/5)
                  </span>
                )}
              </div>
            </div>

            {/* Feedback Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How was your overall experience? *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {feedbackTypes.map((type) => {
                  const IconComponent = type.icon;
                  const isSelected = feedback.type === type.type;
                  return (
                    <button
                      key={type.type}
                      type="button"
                      onClick={() => handleTypeSelect(type.type)}
                      disabled={isSubmitting}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? `${type.bgColor} ${type.borderColor} ${type.color}`
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <IconComponent className="text-2xl" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Share your thoughts *
              </label>
              <textarea
                value={feedback.comment}
                onChange={handleCommentChange}
                placeholder="Tell us about your experience at this event..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#555879] focus:border-transparent resize-none"
                rows={4}
                disabled={isSubmitting}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {feedback.comment.length}/500 characters
              </div>
            </div>

            {/* Anonymous Option */}
            <div className="mb-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feedback.isAnonymous}
                  onChange={handleAnonymousChange}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-[#555879] bg-gray-100 border-gray-300 rounded focus:ring-[#555879] focus:ring-2"
                />
                <span className="text-sm text-gray-700">
                  Submit feedback anonymously
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                Your name won't be displayed with this feedback
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !feedback.comment.trim() || !feedback.type || !feedback.rating}
                className="px-6 py-2 bg-[#555879] text-white rounded-lg hover:bg-[#4A4C6A] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting 
                  ? (existingFeedback ? 'Updating...' : 'Submitting...') 
                  : (existingFeedback ? 'Update Feedback' : 'Submit Feedback')
                }
              </button>
            </div>

            {/* Required fields note */}
            <p className="text-xs text-gray-500 mt-3 text-center">
              * Required fields
            </p>
          </form>
        </div>
      </div>

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