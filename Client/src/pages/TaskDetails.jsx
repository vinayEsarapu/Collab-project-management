import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getProjectById,
  getTaskById,
  updateTask,
} from "../services/projectservices";

import { useAuth } from "../context/Authcontext.jsx";

function TaskDetails() {
  const { id, taskId } = useParams();
  const navigate = useNavigate();

  const { user, isLoading: isAuthLoading } = useAuth();

  const [project, setProject] = useState(null);
  const [task, setTask] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Planning");
  const [priority, setPriority] = useState("Medium");
  const [assignedTo, setAssignedTo] = useState("");

  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const currentUserId = user?._id?.toString();

  const isOwner =
    project?.owner &&
    currentUserId ===
      (project.owner._id || project.owner).toString();

  const isAssignedMember =
    task?.assignedTo &&
    currentUserId ===
      (task.assignedTo._id || task.assignedTo).toString();

  const canEdit = isOwner || isAssignedMember;

  const loadTask = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [projectData, taskData] = await Promise.all([
        getProjectById(id),
        getTaskById(id, taskId),
      ]);

      setProject(projectData);
      setTask(taskData);

      setTitle(taskData.title || "");
      setDescription(taskData.description || "");
      setStatus(taskData.status || "Planning");
      setPriority(taskData.priority || "Medium");
      setAssignedTo(
        taskData.assignedTo?._id ||
          taskData.assignedTo ||
          ""
      );
    } catch (error) {
      console.error(
        "Failed to load task details:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load task details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !user) {
      return;
    }

    loadTask();
  }, [id, taskId, isAuthLoading, user]);

  const startEditing = () => {
    setTitle(task.title || "");
    setDescription(task.description || "");
    setStatus(task.status || "Planning");
    setPriority(task.priority || "Medium");
    setAssignedTo(
      task.assignedTo?._id ||
        task.assignedTo ||
        ""
    );

    setFormError("");
    setSuccess("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setTitle(task.title || "");
    setDescription(task.description || "");
    setStatus(task.status || "Planning");
    setPriority(task.priority || "Medium");
    setAssignedTo(
      task.assignedTo?._id ||
        task.assignedTo ||
        ""
    );

    setFormError("");
    setIsEditing(false);
  };

  const handleUpdate = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setFormError("Task title is required.");
      return;
    }

    if (!trimmedDescription) {
      setFormError("Task description is required.");
      return;
    }

    try {
      setIsUpdating(true);
      setFormError("");
      setSuccess("");

      const updatedTask = await updateTask(
        id,
        taskId,
        {
          title: trimmedTitle,
          description: trimmedDescription,
          status,
          priority,

          // Only owner is allowed to change this.
          // The backend also enforces this.
          ...(isOwner
            ? {
                assignedTo:
                  assignedTo || null,
              }
            : {}),
        }
      );

      setTask(updatedTask);

      setTitle(updatedTask.title || "");
      setDescription(
        updatedTask.description || ""
      );
      setStatus(
        updatedTask.status || "Planning"
      );
      setPriority(
        updatedTask.priority || "Medium"
      );
      setAssignedTo(
        updatedTask.assignedTo?._id ||
          updatedTask.assignedTo ||
          ""
      );

      setIsEditing(false);
      setSuccess("Task updated successfully.");
    } catch (error) {
      console.error(
        "Failed to update task:",
        error
      );

      setFormError(
        error.response?.data?.message ||
          "Unable to update task."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getAssigneeName = () => {
    if (!task?.assignedTo) {
      return "Unassigned";
    }

    return (
      task.assignedTo.name ||
      "Unknown user"
    );
  };

  const getProjectMemberOptions = () => {
    const users = [];

    if (project?.owner) {
      users.push(project.owner);
    }

    if (project?.members) {
      users.push(...project.members);
    }

    const uniqueUsers = [];
    const seenIds = new Set();

    users.forEach((member) => {
      const memberId = (
        member._id || member
      ).toString();

      if (!seenIds.has(memberId)) {
        seenIds.add(memberId);
        uniqueUsers.push(member);
      }
    });

    return uniqueUsers;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <main className="mx-auto max-w-4xl animate-pulse">
          <div className="h-5 w-36 rounded bg-white/10" />

          <div className="mt-8 h-10 w-72 rounded bg-white/10" />

          <div className="mt-4 h-5 w-full max-w-xl rounded bg-white/5" />

          <div className="mt-8 h-72 rounded-3xl bg-white/5" />
        </main>
      </div>
    );
  }

  if (error || !task || !project) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <main className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center">
            <p className="text-lg font-semibold text-red-300">
              Unable to load task
            </p>

            <p className="mt-2 text-sm text-slate-400">
              {error || "Task not found."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/projects/${id}/tasks`
                )
              }
              className="mt-6 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
            >
              Back to Tasks
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            navigate(
              `/projects/${id}/tasks`
            )
          }
          className="mb-8 text-sm text-slate-400 transition-colors hover:text-white"
        >
          ← Back to Tasks
        </button>

        {/* Header */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl text-indigo-300">
                ✓
              </div>

              <p className="text-sm text-slate-500">
                Task
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                {task.title}
              </h1>

              <p className="mt-3 text-sm text-slate-400">
                Project:{" "}
                <span className="font-medium text-slate-200">
                  {project.title}
                </span>
              </p>
            </div>

            {canEdit && !isEditing && (
              <button
                type="button"
                onClick={startEditing}
                className="w-fit rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
              >
                Edit Task
              </button>
            )}
          </div>
        </section>

        {/* Success */}
        {success && (
          <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* Edit Form */}
        {isEditing ? (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

            <div>
              <h2 className="text-lg font-semibold">
                Edit Task
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Update the task details.
              </p>
            </div>

            {formError && (
              <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                {formError}
              </div>
            )}

            <div className="mt-6 grid gap-5">

              {/* Title */}
              <div>
                <label
                  htmlFor="taskTitle"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Task Title
                </label>

                <input
                  id="taskTitle"
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setFormError("");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/50"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="taskDescription"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Description
                </label>

                <textarea
                  id="taskDescription"
                  value={description}
                  onChange={(event) => {
                    setDescription(
                      event.target.value
                    );
                    setFormError("");
                  }}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/50"
                />
              </div>

              {/* Status + Priority */}
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label
                    htmlFor="taskStatus"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Status
                  </label>

                  <select
                    id="taskStatus"
                    value={status}
                    onChange={(event) =>
                      setStatus(
                        event.target.value
                      )
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

                <div>
                  <label
                    htmlFor="taskPriority"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Priority
                  </label>

                  <select
                    id="taskPriority"
                    value={priority}
                    onChange={(event) =>
                      setPriority(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50"
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Critical">
                      Critical
                    </option>
                  </select>
                </div>
              </div>

              {/* Assignment */}
              <div>
                <label
                  htmlFor="taskAssignee"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Assign To
                </label>

                {isOwner ? (
                  <>
                    <select
                      id="taskAssignee"
                      value={assignedTo}
                      onChange={(event) =>
                        setAssignedTo(
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50"
                    >
                      <option value="">
                        Unassigned
                      </option>

                      {getProjectMemberOptions().map(
                        (member) => {
                          const memberId =
                            (
                              member._id ||
                              member
                            ).toString();

                          return (
                            <option
                              key={memberId}
                              value={memberId}
                            >
                              {member.name}
                              {memberId ===
                              project.owner._id?.toString()
                                ? " (Owner)"
                                : ""}
                            </option>
                          );
                        }
                      )}
                    </select>

                    <p className="mt-2 text-xs text-slate-500">
                      Only the project owner can
                      change task assignment.
                    </p>
                  </>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    {getAssigneeName()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={isUpdating}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdating
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
          /* Task Details */
         {/* Task Details */}

<section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

  <div>
    <h2 className="text-lg font-semibold">
      Task Details
    </h2>

    <p className="mt-1 text-sm text-slate-400">
      Information about this task.
    </p>
  </div>

  {/* Details */}
  <div className="mt-6 grid gap-4 sm:grid-cols-3">

    <DetailItem
      label="Assignee"
      value={getAssigneeName()}
    />

    <DetailItem
      label="Status"
      value={task.status || "Planning"}
    />

    <DetailItem
      label="Priority"
      value={task.priority || "Medium"}
    />

  </div>

  {/* Permission */}
  <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
    <p className="text-xs text-slate-500">
      Editing permission
    </p>

    <p className="mt-1 text-sm text-slate-300">
      {isOwner
        ? "You are the project owner and can edit this task."
        : isAssignedMember
        ? "You are assigned to this task and can edit it."
        : "You can view this task but cannot edit it."}
    </p>
  </div>

</section>
    
    

{/* Description */}
<section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">
      Description
    </p>

    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
      {task.description || "No description"}
    </p>
  </div>

</section>

        {/* Task Actions */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/projects/${id}/tasks/${taskId}/issues`
              )
            }
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-indigo-400/30 hover:bg-white/[0.05]"
          >
            <p className="text-base font-semibold text-slate-100">
              View Issues
            </p>

            <p className="mt-2 text-sm text-slate-400">
              View only the issues belonging to
              this task.
            </p>

            <span className="mt-4 block text-sm text-indigo-300">
              Open Task Issues →
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/projects/${id}/tasks/${taskId}/issues/new`
              )
            }
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-indigo-400/30 hover:bg-white/[0.05]"
          >
            <p className="text-base font-semibold text-slate-100">
              Create Issue
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Create an issue specifically for
              this task.
            </p>

            <span className="mt-4 block text-sm text-indigo-300">
              Create Task Issue →
            </span>
          </button>

        </section>

        {/* Comments + Activity */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/projects/${id}/tasks/${taskId}/comments`
              )
            }
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-indigo-400/30 hover:bg-white/[0.05]"
          >
            <p className="text-base font-semibold text-slate-100">
              Comments
            </p>

            <p className="mt-2 text-sm text-slate-400">
              View and discuss this task.
            </p>

            <span className="mt-4 block text-sm text-indigo-300">
              View Comments →
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/projects/${id}/tasks/${taskId}/activity`
              )
            }
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-indigo-400/30 hover:bg-white/[0.05]"
          >
            <p className="text-base font-semibold text-slate-100">
              Activity
            </p>

            <p className="mt-2 text-sm text-slate-400">
              View activity related to this task.
            </p>

            <span className="mt-4 block text-sm text-indigo-300">
              View Activity →
            </span>
          </button>

        </section>
        </>
        )}
      </main>
      
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-medium text-slate-300">
        {value}
      </p>
    </div>
  );
}

export default TaskDetails;