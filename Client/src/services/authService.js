import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", {
    email
  });

  return response.data;
};

export const changeEmail = async (currentPassword, newEmail) => {
  const response = await api.post("/auth/change-email", {
    currentPassword,
    newEmail,
  });

  return response.data;
};