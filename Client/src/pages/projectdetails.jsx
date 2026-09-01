import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProjectById,
  updateProject,
  addTask,
  updateTask,
  deleteTask,
  getProjectActivity,
   getUsersForMemberSelection,
    
} from "../services/projectservices";
import { useAuth } from "../context/Authcontext.jsx";


function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
const [editingTaskId, setEditingTaskId] = useState(null);
const [editingTaskTitle, setEditingTaskTitle] = useState("");
const [taskError, setTaskError] = useState("");
const [taskSuccess, setTaskSuccess] = useState("");
const [isAddingTask, setIsAddingTask] = useState(false);
const [updatingTaskId, setUpdatingTaskId] = useState(null);
const [deletingTaskId, setDeletingTaskId] = useState(null);
const [activityDate, setActivityDate] = useState("");
const [activities, setActivities] = useState([]);
const [activityPage, setActivityPage] = useState(1);
const [availableUsers, setAvailableUsers] = useState([]);
const [showMemberSelector, setShowMemberSelector] = useState(false);
const [isLoadingUsers, setIsLoadingUsers] = useState(false);
const [activityPagination, setActivityPagination] = useState({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});
const [isLoadingActivity, setIsLoadingActivity] = useState(false);
const [activityError, setActivityError] = useState("");
const [isEditingProject, setIsEditingProject] = useState(false);

const [editTitle, setEditTitle] = useState("");
const [editDescription, setEditDescription] = useState("");
const [editStatus, setEditStatus] = useState("");
const [editTechnologies, setEditTechnologies] = useState("");

const [editMembers, setEditMembers] = useState([]);
const [isSavingProject, setIsSavingProject] = useState(false);

const [projectEditError, setProjectEditError] = useState("");
const [projectEditSuccess, setProjectEditSuccess] = useState("");
const isOwner =
  user?._id &&
  project?.owner &&
  user._id.toString() ===
    (project.owner._id || project.owner).toString();


    const loadProject = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getProjectById(id);

        setProject(data);
      } catch (error) {
        console.error("Failed to load project:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load project."
        );
      } finally {
        setIsLoading(false);
      }
    };
  //const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
  if (isAuthLoading) {
    return;
  }

  if (!user) {
    return;
  }

  loadProject();
}, [id, isAuthLoading, user]);

  const handleStartEditProject = () => {
  setEditTitle(project.title || "");
  setEditDescription(project.description || "");
  setEditStatus(project.status || "Planning");

  setEditTechnologies(
    project.technologies?.join(", ") || ""
  );

  setEditMembers(
    project.members?.map((member) =>
      typeof member === "object"
        ? member._id
        : member
    ) || []
  );

  setProjectEditError("");
  setProjectEditSuccess("");
  setShowMemberSelector(false);
  setIsEditingProject(true);
};

const handleCancelEditProject = () => {
  setIsEditingProject(false);

  setEditTitle("");
  setEditDescription("");
  setEditStatus("");
  setEditTechnologies("");
  setEditMembers([]);

  setProjectEditError("");
  setProjectEditSuccess("");
};

const handleSaveProject = async () => {
  const title = editTitle.trim();
  const description = editDescription.trim();

  if (!title) {
    setProjectEditError("Project title is required.");
    return;
  }

  if (!description) {
    setProjectEditError("Project description is required.");
    return;
  }

  const technologies = editTechnologies
    .split(",")
    .map((technology) => technology.trim())
    .filter(Boolean);

  try {
    setIsSavingProject(true);
    setProjectEditError("");
    setProjectEditSuccess("");

    const updatedProject = await updateProject(id, {
      title,
      description,
      status: editStatus,
      technologies,
      members: editMembers,
    });

    setProject(updatedProject);

    setIsEditingProject(false);

    setProjectEditSuccess(
      "Project updated successfully."
    );

    await loadActivity(1);
  } catch (error) {
    console.error(
      "Failed to update project:",
      error
    );

    setProjectEditError(
      error.response?.data?.message ||
        "Unable to update project."
    );
  } finally {
    setIsSavingProject(false);
  }
};
const loadActivity = async (
  page = 1,
  date = activityDate
) => {
  try {
    setIsLoadingActivity(true);
    setActivityError("");

   const data = await getProjectActivity(
  id,
  page,
  10,
  date
);

    setActivities(data.activities || []);

    setActivityPagination(
      data.pagination || {
        page,
        limit: 10,
        total: 0,
        totalPages: 0,
      }
    );

    setActivityPage(page);
  } catch (error) {
    console.error(
      "Failed to load project activity:",
      error
    );

    setActivityError(
      error.response?.data?.message ||
        "Unable to load project activity."
    );
  } finally {
    setIsLoadingActivity(false);
  }
};

useEffect(() => {
  if (id) {
    loadActivity(1);
  }
}, [id]);



const handleOpenMemberSelector = async () => {
  try {
    setIsLoadingUsers(true);
    setProjectEditError("");

    const users = await getUsersForMemberSelection();

    setAvailableUsers(users);
    setShowMemberSelector(true);
  } catch (error) {
    console.error("Failed to load users:", error);

    setProjectEditError(
      error.response?.data?.message ||
        "Unable to load registered users."
    );
  } finally {
    setIsLoadingUsers(false);
  }
};




const handleSelectMember = (userId) => {
  setEditMembers((currentMembers) => {
    const exists = currentMembers.some(
      (id) => id.toString() === userId.toString()
    );

    if (exists) {
      return currentMembers;
    }

    return [...currentMembers, userId];
  });
};

const handleAddTask = async () => {
  const title = taskTitle.trim();

  if (!title) {
    setTaskError("Task title is required.");
    return;
  }

  setTaskError("");
  setTaskSuccess("");

  try {
    setIsAddingTask(true);
    await addTask(id, title);
const refreshedProject = await getProjectById(id);

setProject(refreshedProject);

await loadActivity(1);
setTaskTitle("");
    setTaskSuccess("Task added successfully.");
  } catch (error) {
    console.error("Failed to add task:", error);

    setTaskError(
      error.response?.data?.message ||
        "Unable to add task."
    );
  } finally {
    setIsAddingTask(false);
  }
};

const handleStartEditTask = (task) => {
  setEditingTaskId(task._id);
  setEditingTaskTitle(task.title);
  setTaskError("");
  setTaskSuccess("");
};

const handleCancelEditTask = () => {
  setEditingTaskId(null);
  setEditingTaskTitle("");
};

const handleUpdateTask = async (taskId) => {
  const title = editingTaskTitle.trim();

  if (!title) {
    setTaskError("Task title is required.");
    return;
  }

  setTaskError("");
  setTaskSuccess("");

  try {
    setUpdatingTaskId(taskId);

    await updateTask(
      id,
      taskId,
      title
    );

   const refreshedProject = await getProjectById(id);

setProject(refreshedProject);

setEditingTaskId(null);
setEditingTaskTitle("");

await loadActivity(activityPage);
    setEditingTaskId(null);
    setEditingTaskTitle("");
    setTaskSuccess("Task updated successfully.");
  } catch (error) {
    console.error("Failed to update task:", error);

    setTaskError(
      error.response?.data?.message ||
        "Unable to update task."
    );
  } finally {
    setUpdatingTaskId(null);
  }
};

const handleDeleteTask = async (taskId) => {
  setTaskError("");
  setTaskSuccess("");

  try {
    setDeletingTaskId(taskId);

   await deleteTask(
  id,
  taskId
);

const refreshedProject = await getProjectById(id);

setProject(refreshedProject);
await loadActivity(activityPage);
await loadActivity(1);
    setTaskSuccess("Task deleted successfully.");
  } catch (error) {
    console.error("Failed to delete task:", error);

    setTaskError(
      error.response?.data?.message ||
        "Unable to delete task."
    );
  } finally {
    setDeletingTaskId(null);
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-5 w-32 rounded bg-white/10" />

          <div className="mt-8 h-10 w-2/3 rounded bg-white/10" />

          <div className="mt-4 h-5 w-full max-w-2xl rounded bg-white/5" />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="h-64 rounded-2xl bg-white/5 lg:col-span-2" />
            <div className="h-64 rounded-2xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-8">
            <p className="text-lg font-semibold text-red-300">
              Unable to load project
            </p>

            <p className="mt-2 text-sm text-slate-400">
              {error}
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate("/projects")}
          className="mb-8 text-sm text-slate-400 transition-colors hover:text-white"
        >
          ← Back to Projects
        </button>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                  🚀
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {project.title}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  {project.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
  <StatusBadge status={project.status} />

  <div className="flex flex-wrap gap-2">
    {isOwner && (
      <button
        type="button"
        onClick={handleStartEditProject}
        className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
      >
        Edit Project
      </button>
    )}

    <button
      type="button"
      onClick={() =>
        navigate(`/projects/${id}/issues`)
      }
      className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-400"
    >
      View Issues →
    </button>
  </div>
</div>
            </div>
          </div>
        </section>

        {isEditingProject && isOwner && (
  <section className="mt-6 rounded-2xl border border-indigo-400/20 bg-white/[0.03] p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold">
          Edit Project
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Update your project details and members.
        </p>
      </div>

      <button
        type="button"
        onClick={handleCancelEditProject}
        disabled={isSavingProject}
        className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
      >
        Cancel
      </button>
    </div>

    {projectEditError && (
      <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
        {projectEditError}
      </div>
    )}

    {projectEditSuccess && (
      <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
        {projectEditSuccess}
      </div>
    )}

    <div className="mt-6 grid gap-5">
      {/* Title */}
      <div>
        <label
          htmlFor="editProjectTitle"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Project Title
        </label>

        <input
          id="editProjectTitle"
          type="text"
          value={editTitle}
          onChange={(event) => {
            setEditTitle(event.target.value);
            setProjectEditError("");
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/50"
          placeholder="Enter project title"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="editProjectDescription"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Description
        </label>

        <textarea
          id="editProjectDescription"
          value={editDescription}
          onChange={(event) => {
            setEditDescription(event.target.value);
            setProjectEditError("");
          }}
          rows={4}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/50"
          placeholder="Enter project description"
        />
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="editProjectStatus"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Status
        </label>

        <select
          id="editProjectStatus"
          value={editStatus}
          onChange={(event) =>
            setEditStatus(event.target.value)
          }
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50"
        >
          <option value="Planning">
            Planning
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Completed">
            Completed
          </option>
        </select>
      </div>

      {/* Technologies */}
      <div>
        <label
          htmlFor="editProjectTechnologies"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Technologies
        </label>

        <input
          id="editProjectTechnologies"
          type="text"
          value={editTechnologies}
          onChange={(event) =>
            setEditTechnologies(event.target.value)
          }
          placeholder="React, Node.js, MongoDB"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/50"
        />

        <p className="mt-2 text-xs text-slate-500">
          Separate technologies with commas.
        </p>
      </div>

      {/* Members */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-200">
              Project Members
            </label>

            <p className="mt-1 text-xs text-slate-500">
              Add or remove members from this project.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenMemberSelector}
            disabled={isLoadingUsers}
            className="rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/20 disabled:opacity-50"
          >
            {isLoadingUsers
              ? "Loading..."
              : "Add Members"}
          </button>
        </div>

        {/* Current selected members */}
        <div className="mt-4 space-y-2">
          {project.members
            ?.filter((member) =>
              editMembers.some(
                (memberId) =>
                  memberId.toString() ===
                  member._id.toString()
              )
            )
            .map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300">
                  {member.name
                    ?.charAt(0)
                    .toUpperCase() || "M"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {member.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {member.userCode}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditMembers((current) =>
                      current.filter(
                        (memberId) =>
                          memberId.toString() !==
                          member._id.toString()
                      )
                    )
                  }
                  className="rounded-lg px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/10"
                >
                  Remove
                </button>
              </div>
            ))}

          {editMembers.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-slate-500">
              No members selected.
            </p>
          )}
        </div>

        {/* Member selector */}
        {showMemberSelector && (
          <div className="mt-4 rounded-xl border border-white/10 bg-slate-900 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-200">
                  Select Members
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Choose users to add to the project.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowMemberSelector(false)
                }
                className="rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto">
              {availableUsers
                .filter(
                  (availableUser) =>
                    availableUser._id.toString() !==
                    project.owner?._id?.toString()
                )
                .map((availableUser) => {
                  const isSelected =
                    editMembers.some(
                      (memberId) =>
                        memberId.toString() ===
                        availableUser._id.toString()
                    );

                  return (
                    <button
                      key={availableUser._id}
                      type="button"
                      onClick={() =>
                        handleSelectMember(
                          availableUser._id
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-indigo-400/30 bg-indigo-400/10"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300">
                        {availableUser.name
                          ?.charAt(0)
                          .toUpperCase() || "U"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {availableUser.name}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {availableUser.userCode}
                        </p>
                      </div>

                      {isSelected ? (
                        <span className="rounded-lg bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white">
                          Selected
                        </span>
                      ) : (
                        <span className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-slate-400">
                          Select
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleCancelEditProject}
          disabled={isSavingProject}
          className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSaveProject}
          disabled={isSavingProject}
          className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSavingProject
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </div>
  </section>
)}

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Information */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold">
              Project Information
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InfoItem
                label="Status"
                value={project.status || "Planning"}
              />

              <InfoItem
                label="Created"
                value={
                  project.createdAt
                    ? new Date(
                        project.createdAt
                      ).toLocaleDateString()
                    : "Not available"
                }
              />

              <InfoItem
                label="Last Updated"
                value={
                  project.updatedAt
                    ? new Date(
                        project.updatedAt
                      ).toLocaleDateString()
                    : "Not available"
                }
              />

              <InfoItem
                label="Members"
                value={`${project.members?.length || 0} member${
                  project.members?.length === 1 ? "" : "s"
                }`}
              />
            </div>
          </section>

          {/* Technologies */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">
              Technologies
            </h2>

            {project.technologies?.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {project.technologies.map((technology) => (
                  <span
                    key={technology}
                    className="rounded-lg border border-indigo-400/10 bg-indigo-400/5 px-3 py-2 text-xs font-medium text-indigo-300"
                  >
                    {technology}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-500">
                No technologies added yet.
              </p>
            )}
          </section>
        </div>

        {/* Tasks */}
<section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-lg font-semibold">
        Project Tasks
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Tasks related to this project.
      </p>
    </div>

    <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
      {project.tasks?.length || 0} task
      {project.tasks?.length === 1 ? "" : "s"}
    </span>
  </div>

  {/* Owner controls */}
  {isOwner && (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <label
        htmlFor="taskTitle"
        className="mb-2 block text-sm font-medium text-slate-200"
      >
        Add Task
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="taskTitle"
          type="text"
          value={taskTitle}
          onChange={(event) => {
            setTaskTitle(event.target.value);
            setTaskError("");
          }}
          placeholder="Enter task title..."
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/50 focus:bg-white/[0.07]"
        />

        <button
          type="button"
          onClick={handleAddTask}
          disabled={isAddingTask}
          className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAddingTask ? "Adding..." : "Add Task"}
        </button>
      </div>
    </div>
  )}

  {/* Messages */}
  {taskError && (
    <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
      {taskError}
    </div>
  )}

  {taskSuccess && (
    <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
      {taskSuccess}
    </div>
  )}

  {/* Tasks list */}
  <div className="mt-6">
    {project.tasks?.length > 0 ? (
      <div className="space-y-3">
        {project.tasks.map((task, index) => (
          <div
            key={task._id}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >
            {editingTaskId === task._id ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={editingTaskTitle}
                  onChange={(event) =>
                    setEditingTaskTitle(event.target.value)
                  }
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400/50"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateTask(task._id)
                    }
                    disabled={updatingTaskId === task._id}
                    className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium hover:bg-indigo-400 disabled:opacity-50"
                  >
                   {updatingTaskId === task._id ? "Saving..." : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelEditTask}
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-semibold text-indigo-300">
                  {index + 1}
                </div>

                <p className="min-w-0 flex-1 text-sm text-slate-200">
                  {task.title}
                </p>

                {/* Owner controls */}
                {isOwner && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleStartEditTask(task)
                      }
                      className="rounded-lg px-3 py-2 text-xs font-medium text-indigo-300 transition hover:bg-indigo-400/10"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteTask(task._id)
                      }
                      disabled={deletingTaskId === task._id}
                      className="rounded-lg px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
                    >
                      {deletingTaskId === task._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-white/10 px-6 py-8 text-center">
        <div className="text-2xl">✓</div>

        <p className="mt-3 text-sm font-medium">
          No tasks yet
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {isOwner
            ? "Add a task to start organizing this project."
            : "The project owner has not added any tasks yet."}
        </p>
      </div>
    )}
  </div>
</section>

{/* Activity Logs */}
<section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-lg font-semibold">
        Activity Logs
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Recent activity and changes made in this project.
      </p>
    </div>
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
  <div className="flex-1">
    <label
      htmlFor="activityDate"
      className="text-xs font-medium uppercase tracking-wide text-slate-500"
    >
      Filter by date
    </label>

    <input
      id="activityDate"
      type="date"
      value={activityDate}
      onChange={(event) => {
        const value = event.target.value;

        setActivityDate(value);
        setActivityPage(1);

        loadActivity(1, value);
      }}
      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50"
    />
  </div>

  {activityDate && (
    <button
      type="button"
      onClick={() => {
        setActivityDate("");
        setActivityPage(1);
        loadActivity(1, "");
      }}
      className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
    >
      Clear Filter
    </button>
  )}
</div>

    <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
      {activityPagination.total}{" "}
      {activityPagination.total === 1
        ? "activity"
        : "activities"}
    </span>
  </div>

  {/* Error */}
  {activityError && (
    <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
      {activityError}
    </div>
  )}

  {/* Loading */}
  {isLoadingActivity ? (
    <div className="mt-6 space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-20 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]"
        />
      ))}
    </div>
  ) : activities.length > 0 ? (
    <>
      {/* Activity list */}
      <div className="mt-6 space-y-3">
        {activities.map((activity) => (
          <ActivityCard
            key={activity._id}
            activity={activity}
          />
        ))}
      </div>

      {/* Pagination */}
      {activityPagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Page {activityPagination.page} of{" "}
            {activityPagination.totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                loadActivity(activityPage - 1)
              }
              disabled={
                isLoadingActivity ||
                activityPage <= 1
              }
              className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={() =>
                loadActivity(activityPage + 1)
              }
              disabled={
                isLoadingActivity ||
                activityPage >=
                  activityPagination.totalPages
              }
              className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </>
  ) : (
    <div className="mt-6 rounded-xl border border-dashed border-white/10 px-6 py-8 text-center">
      <div className="text-2xl">📝</div>

      <p className="mt-3 text-sm font-medium">
        No activity yet
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Project activity will appear here.
      </p>
    </div>
  )}
</section>

        {/* Members */}
     {/* Project Members */}
<section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-lg font-semibold">
        Project Members
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Members currently participating in this project.
      </p>
    </div>

    <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
      {project.members?.length || 0} member
      {project.members?.length === 1 ? "" : "s"}
    </span>
  </div>

  {/* Members List */}
  <div className="mt-6 space-y-3">
    {/* Project Owner */}
    {project.owner && (
      <MemberCard
        member={project.owner}
        isOwner={true}
      />
    )}

    {/* Project Members */}
    {project.members?.length > 0 ? (
      project.members.map((member) => (
        <MemberCard
          key={member._id}
          member={member}
        />
      ))
    ) : (
      <div className="rounded-xl border border-dashed border-white/10 px-6 py-8 text-center">
        <div className="text-2xl">👥</div>

        <p className="mt-3 text-sm font-medium text-slate-300">
          No members added yet
        </p>

        <p className="mt-1 text-xs text-slate-500">
          The project owner can add members while editing the project.
        </p>
      </div>
    )}
  </div>
</section>
</main>
    </div>
  );
}


function StatusBadge({ status }) {
  const styles = {
    Planning:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",

    "In Progress":
      "border-blue-400/20 bg-blue-400/10 text-blue-300",

    Completed:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  };

  return (
    <span
      className={`w-fit rounded-full border px-4 py-2 text-xs font-medium ${
        styles[status] ||
        "border-white/10 bg-white/5 text-slate-300"
      }`}
    >
      {status || "Planning"}
    </span>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-slate-200">
        {value}
      </p>
    </div>
  );
}

function MemberCard({
  member,
  onRemove,
  isRemoving,
  isOwner = false,
}) {
  const name = member?.name || "Project Member";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.05]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300">
        {name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
       <p className="truncate text-sm font-medium text-slate-200">
          {name}
       </p>

       {member?.userCode && (
         <p className="mt-1 text-xs text-slate-500">
            {member.userCode}
         </p>
        )}

       {isOwner && (
         <p className="mt-1 text-xs text-indigo-300">
           Owner
         </p>
     )}
      </div>

      {!isOwner && member?._id && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(member._id)}
          disabled={isRemoving}
          className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-400/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRemoving ? "Removing..." : "Remove"}
        </button>
      )}
    </div>
  );
}

function ActivityCard({ activity }) {
  const userName =
    activity.user?.name ||
    activity.user?.userCode ||
    "Unknown user";

  const userInitial =
    userName.charAt(0).toUpperCase();

  const activityDate = activity.createdAt
    ? new Date(activity.createdAt).toLocaleString()
    : "";

  return (
    <div className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300">
        {userInitial}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-200">
            {userName}
          </p>

          <span className="text-xs text-slate-500">
            {activityDate}
          </span>
        </div>

        <p className="mt-2 text-sm leading-5 text-slate-400">
          {activity.description}
        </p>
      </div>
    </div>
  );
}
export default ProjectDetails;