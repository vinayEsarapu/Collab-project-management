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

//export default projectService;