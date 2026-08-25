import api from "./api";

export const getIssuesByProject = async (projectId) => {
  const response = await api.get(`/api/issues/project/${projectId}`);

  return response.data;
};

export const createIssue = async (issueData) => {
  const response = await api.post("/api/issues", issueData);

  return response.data;
};

export const updateIssue = async (issueId, issueData) => {
  const response = await api.put(
    `/api/issues/${issueId}`,
    issueData
  );

  return response.data;
};

export const deleteIssue = async (issueId) => {
  const response = await api.delete(
    `/api/issues/${issueId}`
  );

  return response.data;
};