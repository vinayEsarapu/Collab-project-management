import api from "./api";

export const getComments = async (issueId) => {
  const response = await api.get(`/comments/issue/${issueId}`);

  return response.data;
};

export const createComment = async (issueId, content) => {
  const response = await api.post(
    `/api/comments/issue/${issueId}`,
    {
      content,
    }
  );

  return response.data;
};