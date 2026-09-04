import api from "./api";

export const getIssueActivities = async (
  issueId,
  page = 1,
  limit = 10,
  date = ""
) => {
  const params = {
    page,
    limit,
  };

  if (date) {
    params.date = date;
  }

  const response = await api.get(
    `/activities/issue/${issueId}`,
    {
      params,
    }
  );

  return response.data;
};

export const getTaskActivities = async (
  taskId,
  page = 1,
  limit = 10,
  date = ""
) => {
  const params = {
    page,
    limit,
  };

  if (date) {
    params.date = date;
  }

  const response = await api.get(
    `/activities/task/${taskId}`,
    {
      params,
    }
  );

  return response.data;
};

export const deleteActivity = async (activityId) => {
  const response = await api.delete(
    `/activities/${activityId}`
  );

  return response.data;
};