import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
//import projectService from "../services/projectservices";
import {
  getProjectById,
  addMember,
  removeMember,
  searchUsers,
  addTask,
  updateTask,
  deleteTask,
  getProjectActivity,
} from "../services/projectservices";
import { useAuth } from "../context/Authcontext.jsx";


function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberSuccess, setMemberSuccess] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
const [editingTaskId, setEditingTaskId] = useState(null);
const [editingTaskTitle, setEditingTaskTitle] = useState("");
const [taskError, setTaskError] = useState("");
const [taskSuccess, setTaskSuccess] = useState("");
const [isAddingTask, setIsAddingTask] = useState(false);
const [updatingTaskId, setUpdatingTaskId] = useState(null);
const [deletingTaskId, setDeletingTaskId] = useState(null);
const [activities, setActivities] = useState([]);
const [activityPage, setActivityPage] = useState(1);
const [activityPagination, setActivityPagination] = useState({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});
const [isLoadingActivity, setIsLoadingActivity] = useState(false);
const [activityError, setActivityError] = useState("");
  const isOwner =
  user?._id &&
  project?.owner?._id &&
  user._id.toString() === project.owner._id.toString();
  
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
    loadProject();
  }, [id]);

  const handleUserSearch = async (event) => {
  const value = event.target.value;

  setUserSearch(value);
  setMemberError("");

  if (!value.trim()) {
    setUserResults([]);
    return;
  }

  try {
    setIsSearchingUsers(true);

    const users = await searchUsers(value);

    const existingMemberIds = new Set(
      (project.members || []).map((member) =>
        member._id?.toString()
      )
    );

    if (project.owner?._id) {
      existingMemberIds.add(project.owner._id.toString());
    }

    const availableUsers = users.filter(
      (user) => !existingMemberIds.has(user._id.toString())
    );

    setUserResults(availableUsers);
  } catch (error) {
    console.error("Failed to search users:", error);

    setMemberError(
      error.response?.data?.message ||
        "Unable to search users."
    );
  } finally {
    setIsSearchingUsers(false);
  }
};

const loadActivity = async (page = 1) => {
  try {
    setIsLoadingActivity(true);
    setActivityError("");

    const data = await getProjectActivity(
      id,
      page,
      10
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

const handleSelectUser = async (selectedUser) => {
  setMemberError("");
  setMemberSuccess("");

  try {
    setIsAddingMember(true);

    const updatedProject = await addMember(
      id,
      selectedUser._id
    );

    const refreshedProject = await getProjectById(id);

    setProject(refreshedProject || updatedProject);

    setUserSearch("");
    setUserResults([]);

    setMemberSuccess("Member added successfully.");
  } catch (error) {
    console.error("Failed to add member:", error);

    setMemberError(
      error.response?.data?.message ||
        "Unable to add member. Please try again."
    );
  } finally {
    setIsAddingMember(false);
  }
};
  
  

const handleRemoveMember = async (userId) => {
  setMemberError("");
  setMemberSuccess("");

  try {
    setRemovingMemberId(userId);

    await removeMember(id, userId);

    const refreshedProject = await getProjectById(id);

    setProject(refreshedProject);
    setMemberSuccess("Member removed successfully.");
  } catch (error) {
    console.error("Failed to remove member:", error);

    setMemberError(
      error.response?.data?.message ||
        "Unable to remove member. Please try again."
    );
  } finally {
    setRemovingMemberId(null);
  }
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

    const updatedProject = await addTask(id, title);

    setProject(updatedProject);
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

    const updatedProject = await updateTask(
      id,
      taskId,
      title
    );

    setProject(updatedProject);
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

    const updatedProject = await deleteTask(
      id,
      taskId
    );

    setProject(updatedProject);
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

               <button
                onClick={() => navigate(`/projects/${id}/issues`)}
                 className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-400"
                        >
                 View Issues →
               </button>
</div>
            </div>
          </div>
        </section>

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
       {/* Members */}
<section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-lg font-semibold">
        Project Members
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Manage the people collaborating on this project.
      </p>
    </div>

    <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
      {(project.members?.length || 0)+1} members
    </span>
  </div>

  {/* Project Owner */}
{project.owner && (
  <div className="mt-6 rounded-xl border border-indigo-400/10 bg-indigo-400/[0.03] p-4">
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300">
        {project.owner.name
          ? project.owner.name.charAt(0).toUpperCase()
          : "O"}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">
            {project.owner.name || "Project Owner"}
          </p>

          <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
            Owner
          </span>
        </div>

        <p className="truncate text-xs text-slate-500">
          {project.owner.email || "Owner"}
        </p>
      </div>
    </div>
  </div>
)}


{/* Add Member - Owner Only */}
{isOwner && (
  <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
    <label
      htmlFor="userSearch"
      className="mb-2 block text-sm font-medium text-slate-200"
    >
      Add Team Member
    </label>

    <input
      id="userSearch"
      type="text"
      value={userSearch}
      onChange={handleUserSearch}
      placeholder="Search by userId and name..."
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/10"
    />

    {isSearchingUsers && (
      <p className="mt-3 text-xs text-slate-500">
        Searching...
      </p>
    )}

    {userResults.length > 0 && (
      <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-slate-900">
        {userResults.map((user) => (
          <button
            key={user._id}
            type="button"
            onClick={() => handleSelectUser(user)}
            disabled={isAddingMember}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
             <p className="truncate text-sm font-medium text-slate-200">
              {user.userCode}
            </p>

           <p className="truncate text-xs text-slate-400">
           {user.name}
           </p>
         </div>
          </button>
        ))}
      </div>
    )}

    {userSearch.trim() && !isSearchingUsers && userResults.length === 0 && (
      <p className="mt-3 text-xs text-slate-500">
        No available users found.
      </p>
    )}
  </div>
)}
  {/* Member messages */}
  {memberError && (
    <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
      {memberError}
    </div>
  )}

  {memberSuccess && (
    <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
      {memberSuccess}
    </div>
  )}

  {/* Members list */}
  {/* Owner */}


{/* Members */}
<div className="mt-6">
  <h3 className="mb-3 text-sm font-medium text-slate-400">
    Members
  </h3>

  {project.members?.length > 0 ? (
    <div className="grid gap-3 sm:grid-cols-2">
      {project.members.map((member) => (
        <MemberCard
         key={member._id}
         member={member}
         onRemove={isOwner ? handleRemoveMember : undefined}
         isRemoving={removingMemberId === member._id}
       />
     ))}
    </div>
  ) : (
    <div className="rounded-xl border border-dashed border-white/10 px-6 py-8 text-center">
      <div className="text-2xl">👥</div>

      <p className="mt-3 text-sm font-medium">
        No additional members
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Add your first team member above.
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