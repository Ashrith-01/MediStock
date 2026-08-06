import api from "../api/axiosInstance";

export const getNotifications = () => {
  return api.get("/notifications");
};

export const markAsRead = (id) => {
  return api.put(`/notifications/${id}/read`);
};

export const deleteNotification = (id) => {
  return api.delete(`/notifications/${id}`);
};