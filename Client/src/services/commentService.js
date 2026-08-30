import api from "./api";

export const getComments = async (issueId) => {
  const response = await api.get(`/comments/issue/${issueId}`);

  return response.data;
};

export const createComment = async (issueId, content) => {
  const response = await api.post(
    `/comments/issue/${issueId}`,
    {
      content,
    }
  );

  return response.data;
};
export const updateComment = async (commentId, content) => {
  const response = await api.put(
    `/comments/${commentId}`,
    {
      content,
    }
  );

  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(
    `/comments/${commentId}`
  );

  return response.data;
};