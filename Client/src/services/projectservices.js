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

// ADD TASK
export const addTask = async (projectId, title) => {
  const response = await api.post(
    `/projects/${projectId}/tasks`,
    { title }
  );

  return response.data.project;
};

export const updateTask = async (projectId, taskId, title) => {
  const response = await api.put(
    `/projects/${projectId}/tasks/${taskId}`,
    { title }
  );

  return response.data.project;
};

export const deleteTask = async (projectId, taskId) => {
  const response = await api.delete(
    `/projects/${projectId}/tasks/${taskId}`
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

  export const getUsersForMemberSelection = async () => {
  const response = await api.get("/projects/users");

  return response.data.users || [];
};

export const getProjectActivity = async (
  projectId,
  page = 1,
  limit = 10
) => {
  const response = await api.get(
    `/projects/${projectId}/activity`,
    {
      params: {
        page,
        limit,
      },
    }
  );

  return response.data;
};

 
//export default projectService;