import api from './api';

// Create feedback (matches your route: POST /feedbacks/create)
export const createFeedback = async (feedbackData) => {
    return await api.post('feedbacks/create', feedbackData);
};

// Get feedback by eventId (matches your route: GET /feedbacks/event/:eventId)
export const getFeedbacksByEvent = async (eventId) => {
    return await api.get(`feedbacks/event/${eventId}`);
};

// Get feedback by userId (matches your route: GET /feedbacks/user/:userId)
export const getFeedbacksByUser = async (userId) => {
    return await api.get(`feedbacks/user/${userId}`);
};

// Get single feedback by ID (matches your route: GET /feedbacks/:id)
export const getFeedbackById = async (feedbackId) => {
    return await api.get(`feedbacks/${feedbackId}`);
};

// Update feedback (matches your route: PUT /feedbacks/:id)
export const updateFeedback = async (feedbackId, feedbackData) => {
    return await api.put(`feedbacks/${feedbackId}`, feedbackData);
};

// Delete feedback (matches your route: DELETE /feedbacks/:id)
export const deleteFeedback = async (feedbackId) => {
    return await api.delete(`feedbacks/${feedbackId}`);
};

// Get feedback statistics (matches your route: GET /feedbacks/stats/all)
export const getFeedbackStatistics = async () => {
    return await api.get('feedbacks/stats/all');
};