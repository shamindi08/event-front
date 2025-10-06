import api from "./api";

export const sendSingleEmail = async (emailData) => {
    return await api.post('emails/send-invitation', emailData);
}

export const sendBulkEmail = async (emailData) => {
    return await api.post('emails/send-bulk-invitations', emailData);
}
//email attendees
export const sendEmailToAttendees = async (eventId) => {
    return await api.post(`emails/send-attendee-invitation/${eventId}`);
}