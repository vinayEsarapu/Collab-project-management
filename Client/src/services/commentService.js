import api from "./api";


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

  let endpoint;

  /*
   * Task Issue Comments
   */
  if (taskId && issueId) {
    endpoint = `/comments/task/${taskId}/issue/${issueId}`;
  }

  /*
   * Task-level Comments
   */
  else if (taskId) {
    endpoint = `/comments/task/${taskId}`;
  }

  /*
   * Normal Issue Comments
   */
  else if (issueId) {
    endpoint = `/comments/issue/${issueId}`;
  }

  else {
    throw new Error(
      "Either issueId or taskId is required"
    );
  }

  const response = await api.get(
    `${endpoint}?${params.toString()}`
  );

  return response.data;
};


export const createComment = async (
  issueId,
  content,
  taskId = null
) => {
  let endpoint;

  /*
   * Task Issue Comment
   */
  if (taskId && issueId) {
    endpoint = `/comments/task/${taskId}/issue/${issueId}`;
  }

  /*
   * Task-level Comment
   */
  else if (taskId) {
    endpoint = `/comments/task/${taskId}`;
  }

  /*
   * Normal Issue Comment
   */
  else if (issueId) {
    endpoint = `/comments/issue/${issueId}`;
  }

  else {
    throw new Error(
      "Either issueId or taskId is required"
    );
  }

  const response = await api.post(
    endpoint,
    {
      content,
    }
  );

  return response.data;
};


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


export const deleteComment = async (
  commentId
) => {
  const response = await api.delete(
    `/comments/${commentId}`
  );

  return response.data;
};