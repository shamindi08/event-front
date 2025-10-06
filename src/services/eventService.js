import api from "./api";

export const createEvent = async (eventData) => {
    return await api.post('events/createEvent', eventData);  
};


export const getAllEvents = async () => {
    return await api.get('events/getAllEvents');
};


export const getEventById = async (eventId) => {
    return await api.get(`events/getEventById/${eventId}`);      
};

export const updateEvent = async (eventId, eventData) => {
    return await api.put(`events/updateEvent/${eventId}`, eventData);
};

export const deleteEvent = async (eventId) => {
    return await api.delete(`events/deleteEvent/${eventId}`);
};

//get events by userId
export const getEventsByUserId = async (userId) => {    
    return await api.get(`events/getEventsByUserId/${userId}`);
};

//input cordinates
export const getCoordinates = async (id,locationData) => {
    return await api.get(`events/inputCordinates/${id}`, locationData );
};

//update event status
export const updateEventStatus = async (id, eventstatus) => {
    return await api.put(`events/updateEventStatus/${id}`,eventstatus );
};

//attend event
export const attendEvent = async (id, userId) => {
    return await api.post(`events/attendEvent/${id}`, userId);
}

//cancel attendance
export const cancelAttendance = async (id, userId) => {
    return await api.post(`events/cancelEventAttendance/${id}`, userId);
}

//add feedback
export const addFeedback = async (id, feedbackData) => {
    return await api.post(`events/addFeedbackToEvent/${id}`, feedbackData);
};

//get feedback by eventId
export const getFeedbackByEventId = async (id) => {
    return await api.get(`events/getEventFeedbacks/${id}`);
};
//update feedback
export const updateFeedback = async (feedbackId, feedbackData) => {
    return await api.put(`events/updateFeedback/${feedbackId}`, feedbackData);
};
//delete feedback
export const deleteFeedback = async (feedbackId) => {
    return await api.delete(`events/deleteFeedback/${feedbackId}`);
};




