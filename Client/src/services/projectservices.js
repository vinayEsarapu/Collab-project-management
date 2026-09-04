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
export const updateProject = async (projectId, projectData) => {
  const response = await api.put(
    `/projects/${projectId}`,
    projectData
  );

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
// TASKS

// Get all tasks for a project
export const getProjectTasks = async (projectId) => {
  const response = await api.get(
    `/projects/${projectId}/tasks`
  );

  return response.data.tasks || [];
};

// Get one task
export const getTaskById = async (projectId, taskId) => {
  const response = await api.get(
    `/projects/${projectId}/tasks/${taskId}`
  );

  return response.data.task;
};

// Create task
export const addTask = async (projectId, taskData) => {
  const response = await api.post(
    `/projects/${projectId}/tasks`,
    taskData
  );

  return response.data.task;
};

// Update task
export const updateTask = async (
  projectId,
  taskId,
  taskData
) => {
  const response = await api.put(
    `/projects/${projectId}/tasks/${taskId}`,
    taskData
  );

  return response.data.task;
};

// Delete task
export const deleteTask = async (
  projectId,
  taskId
) => {
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
  limit = 10,
  date = ""
) => {
  const response = await api.get(
    `/projects/${projectId}/activity`,
    {
      params: {
        page,
        limit,
        ...(date ? { date } : {}),
      },
    }
  );

  return response.data;
};

// Delete project activity
export const deleteProjectActivity = async (
  projectId,
  activityId
) => {
  const response = await api.delete(
    `/projects/${projectId}/activity/${activityId}`
  );

  return response.data;
};

// PROJECT COMMENTS

export const getProjectComments = async (
  projectId,
  page = 1,
  limit = 10,
  commenterId = ""
) => {
  const response = await api.get(
    `/projects/${projectId}/comments`,
    {
      params: {
        page,
        limit,
        ...(commenterId
          ? { commenterId }
          : {}),
      },
    }
  );

  return response.data;
};

export const createProjectComment = async (
  projectId,
  content
) => {
  const response = await api.post(
    `/projects/${projectId}/comments`,
    {
      content,
    }
  );

  return response.data;
};

export const updateProjectComment = async (
  projectId,
  commentId,
  content
) => {
  const response = await api.put(
    `/projects/${projectId}/comments/${commentId}`,
    {
      content,
    }
  );

  return response.data;
};

export const deleteProjectComment = async (
  projectId,
  commentId
) => {
  const response = await api.delete(
    `/projects/${projectId}/comments/${commentId}`
  );

  return response.data;
};
 
//export default projectService;