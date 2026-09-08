import api from "./api.js";

export const getMyProfile = async () => {
  const response = await api.get("/profile/me");

  return response.data;
};