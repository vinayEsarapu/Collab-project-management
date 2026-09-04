import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProjectById,
  getProjectTasks,
  addTask,
  deleteTask,
} from "../services/projectservices";
import { useAuth } from "../context/Authcontext.jsx";

function Tasks() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Planning");
  const [priority, setPriority] = useState("Medium");
  const [assignedTo, setAssignedTo] = useState("");

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [taskSuccess, setTaskSuccess] = useState("");

  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const isOwner =
    user?._id &&
    project?.owner &&
    user._id.toString() ===
      (project.owner._id || project.owner).toString();

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [projectData, taskData] = await Promise.all([
        getProjectById(id),
        getProjectTasks(id),
      ]);

      setProject(projectData);
      setTasks(taskData);
    } catch (error) {
      console.error("Failed to load tasks:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load project tasks."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading || !user) {
      return;
    }

    loadTasks();
  }, [id, isAuthLoading, user]);

  const resetTaskForm = () => {
    setTitle("");
    setDescription("");
    setStatus("Planning");
    setPriority("Medium");
    setAssignedTo("");
  };

  const handleAddTask = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setTaskError("Task title is required.");
      return;
    }

    if (!trimmedDescription) {
      setTaskError("Task description is required.");
      return;
    }

    try {
      setIsAddingTask(true);
      setTaskError("");
      setTaskSuccess("");

      const newTask = await addTask(id, {
        title: trimmedTitle,
        description: trimmedDescription,
        status,
        priority,
        assignedTo: assignedTo || null,
      });

      setTasks((currentTasks) => [
        ...currentTasks,
        newTask,
      ]);

     resetTaskForm();

setIsAddingTask(false);

setTaskSuccess("Task created successfully.");
    } catch (error) {
      console.error("Failed to create task:", error);

      setTaskError(
        error.response?.data?.message ||
          "Unable to create task."
      );
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleDeleteTask = async (event, taskId) => {
    event.stopPropagation();

    try {
      setDeletingTaskId(taskId);
      setTaskError("");
      setTaskSuccess("");

      await deleteTask(id, taskId);

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task._id !== taskId
        )
      );

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

  const handleOpenTask = (taskId) => {
    navigate(
      `/projects/${id}/tasks/${taskId}`
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-5 w-32 rounded bg-white/10" />

          <div className="mt-8 h-10 w-64 rounded bg-white/10" />

          <div className="mt-4 h-5 w-96 rounded bg-white/5" />

          <div className="mt-8 grid gap-4">
            <div className="h-32 rounded-2xl bg-white/5" />
            <div className="h-32 rounded-2xl bg-white/5" />
            <div className="h-32 rounded-2xl bg-white/5" />
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
              Unable to load tasks
            </p>

            <p className="mt-2 text-sm text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(`/projects/${id}`)
              }
              className="mt-6 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
            >
              Back to Project
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
          type="button"
          onClick={() =>
            navigate(`/projects/${id}`)
          }
          className="mb-8 text-sm text-slate-400 transition-colors hover:text-white"
        >
          ← Back to Project
        </button>

        {/* Header */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                ✓
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Project Tasks
              </h1>

              <p className="mt-3 text-sm text-slate-400 sm:text-base">
                Tasks for{" "}
                <span className="font-medium text-slate-200">
                  {project.title}
                </span>
              </p>
            </div>

            <span className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400">
              {tasks.length} task
              {tasks.length === 1 ? "" : "s"}
            </span>
          </div>
        </section>

        {/* Owner - Create Task */}
        {/* Owner - Create Task */}
{isOwner && (
  <section className="mt-6">
    {!isAddingTask ? (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setTaskError("");
            setTaskSuccess("");
            resetTaskForm();
            setIsAddingTask(true);
          }}
          className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20"
        >
          + Create Task
        </button>
      </div>
    ) : (
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Create Task
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Add a new task and assign it to a project member.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetTaskForm();
              setTaskError("");
              setTaskSuccess("");
              setIsAddingTask(false);
            }}
            disabled={isAddingTask}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {taskError && (
          <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {taskError}
          </div>
        )}

        {/* Success */}
        {taskSuccess && (
          <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
            {taskSuccess}
          </div>
        )}

        <div className="grid gap-5">

          {/* Title */}
          <div>
            <label
              htmlFor="taskTitle"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Title
            </label>

            <input
              id="taskTitle"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setTaskError("");
                setTaskSuccess("");
              }}
              placeholder="e.g. Implement user authentication"
              maxLength={100}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/10"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="taskDescription"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Description
            </label>

            <textarea
              id="taskDescription"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setTaskError("");
                setTaskSuccess("");
              }}
              rows={4}
              placeholder="Describe the task..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/10"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            <div>
              <label
                htmlFor="taskStatus"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Status
              </label>

              <select
                id="taskStatus"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
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
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Priority
              </label>

              <select
                id="taskPriority"
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

          </div>

          {/* Assignee */}
          <div>
            <label
              htmlFor="taskAssignee"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Assign To
            </label>

            <select
              id="taskAssignee"
              value={assignedTo}
              onChange={(event) =>
                setAssignedTo(event.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50"
            >
              <option value="">
                Unassigned
              </option>

              {project.owner && (
                <option value={project.owner._id}>
                  {project.owner.name} (Owner)
                </option>
              )}

              {project.members?.map((member) => (
                <option
                  key={member._id}
                  value={member._id}
                >
                  {member.name}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-slate-500">
              Only the project owner can create and assign tasks.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => {
                resetTaskForm();
                setTaskError("");
                setTaskSuccess("");
                setIsAddingTask(false);
              }}
              disabled={isAddingTask}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAddTask}
              disabled={isAddingTask}
              className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAddingTask
                ? "Creating..."
                : "Create Task"}
            </button>

          </div>
        </div>
      </section>
    )}
    </section>
)}
    {/* Tasks */}
<section className="mt-6">
  {tasks.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {tasks.map((task, index) => (
        <TaskCard
          key={task._id}
          task={task}
          index={index}
          isOwner={isOwner}
          isDeleting={deletingTaskId === task._id}
          onOpen={() => handleOpenTask(task._id)}
          onDelete={(event) =>
            handleDeleteTask(event, task._id)
          }
        />
      ))}
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
      <div className="text-3xl">✓</div>

      <p className="mt-4 text-sm font-medium text-slate-300">
        No tasks yet
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {isOwner
          ? "Create the first task for this project."
          : "The project owner has not created any tasks yet."}
      </p>
    </div>
  )}
</section>

   </main>
    </div>
  );
}

function TaskCard({
  task,
  index,
  isOwner,
  isDeleting,
  onOpen,
  onDelete,
}) {
  const assigneeName =
    task.assignedTo?.name || "Unassigned";

  return (
    <article
      onClick={onOpen}
      className="flex h-full cursor-pointer flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-white/[0.05]"
    >
      <div className="flex h-full flex-col gap-5">

        {/* Top */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-sm font-semibold text-indigo-300">
            {index + 1}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="break-words text-base font-semibold text-slate-100">
              {task.title}
            </h3>
          </div>
        </div>

        {/* Details */}
        <div className="grid gap-4 border-t border-white/10 pt-4 sm:grid-cols-3">
          <TaskInfo
            label="Assignee"
            value={assigneeName}
          />

          <TaskInfo
            label="Status"
            value={task.status || "Planning"}
          />

          <TaskInfo
            label="Priority"
            value={task.priority || "Medium"}
          />
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs text-indigo-300">
            View Task →
          </span>

          {isOwner && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="rounded-lg px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function TaskInfo({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-slate-300">
        {value}
      </p>
    </div>
  );
}

export default Tasks;