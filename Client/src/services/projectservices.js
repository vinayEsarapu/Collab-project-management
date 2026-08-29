import api from "./api";

export const getProjects = async () => {
  const response = await api.get("/projects");

  return response.data.projects;
};

export const createProject = async (projectData) => {
  const response = await api.post("/projects", projectData);

  return response.data.project;
};

export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);

  return response.data.project;
};

export const addMember = async (projectId, userId) => {
  const response = await api.post(`/projects/${projectId}/members`, {
    userId,
  });

  return response.data.project;
};

export const removeMember = async (projectId, userId) => {
  const response = await api.delete(
    `/projects/${projectId}/members/${userId}`
  );

  return response.data.project;
};

export const searchUsers = async (search = "") => {
  const response = await api.get("/projects/users/search", {
    params: {
      search,
    },
  });

  return response.data.users;
};
//export default projectService;