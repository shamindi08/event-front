import api from "./api";

export const registerUser = async (userData) => {
    return await api.post('users/reguser', userData)

};

export const loginUser = async (data) => {
    return await api.post('users/loginUser', data);
};

export const getUserProfile = async (userId) => {
    return await api.get(`users/getUserbyId/${userId}`);
};

export const updateUserProfile = async (userId, userData) => {
    return await api.put(`users/updateUser/${userId}`, userData);
};
