import api from "./api";



export const getIssuesByTask = async (taskId) => {
  const response = await api.get(`/issues/task/${taskId}`);

  return response.data;
};

export const getTaskIssueById = async (taskId, issueId) => {
  const response = await api.get(
    `/issues/task/${taskId}/${issueId}`
  );

  return response.data;
};
export const getIssues = async () => {
  const response = await api.get("/issues");

  return response.data;
};

export const getIssuesByProject = async (projectId) => {
  const response = await api.get(`/issues/project/${projectId}`);

  return response.data;
};

export const createIssue = async (issueData) => {
  const response = await api.post("/issues", issueData);

  return response.data;
};

export const updateIssue = async (issueId, issueData) => {
  const response = await api.put(
    `/issues/${issueId}`,
    issueData
  );

  return response.data;
};

export const deleteIssue = async (issueId) => {
  const response = await api.delete(
    `/issues/${issueId}`
  );

  return response.data;
};