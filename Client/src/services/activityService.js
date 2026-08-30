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