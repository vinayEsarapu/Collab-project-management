import api from "./api";

// Get comments with pagination and optional name filter
export const getComments = async (
  issueId,
  page = 1,
  limit = 10,
  name = ""
) => {
  const params = new URLSearchParams();

  params.append("page", page);
  params.append("limit", limit);

  if (name.trim()) {
    params.append("name", name.trim());
  }

  const response = await api.get(
    `/comments/issue/${issueId}?${params.toString()}`
  );

  return response.data;
};


// Create a comment
export const createComment = async (
  issueId,
  content
) => {
  const response = await api.post(
    `/comments/issue/${issueId}`,
    {
      content,
    }
  );

  return response.data;
};


// Update own comment
export const updateComment = async (
  commentId,
  content
) => {
  const response = await api.put(
    `/comments/${commentId}`,
    {
      content,
    }
  );

  return response.data;
};


// Delete own comment
export const deleteComment = async (
  commentId
) => {
  const response = await api.delete(
    `/comments/${commentId}`
  );

  return response.data;
};