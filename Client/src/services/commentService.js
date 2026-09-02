import api from "./api";

// Get comments with pagination and optional name filter
export const getComments = async (
  issueId,
  page = 1,
  limit = 10,
  name = "",
  taskId = null
) => {
  const params = new URLSearchParams();

  params.append("page", page);
  params.append("limit", limit);

  if (name.trim()) {
    params.append("name", name.trim());
  }

  const endpoint = taskId
    ? `/comments/task/${taskId}/issue/${issueId}`
    : `/comments/issue/${issueId}`;

  const response = await api.get(
    `${endpoint}?${params.toString()}`
  );

  return response.data;
};


// Create a comment
export const createComment = async (
  issueId,
  content,
  taskId = null
) => {
  const endpoint = taskId
    ? `/comments/task/${taskId}/issue/${issueId}`
    : `/comments/issue/${issueId}`;

  const response = await api.post(
    endpoint,
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