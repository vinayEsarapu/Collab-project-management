import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject ,  searchUsers } from "../services/projectservices";
function CreateProject() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Planning",
  });
  const [technologyInput, setTechnologyInput] = useState("");
const [technologies, setTechnologies] = useState([]);

const [taskInput, setTaskInput] = useState("");
const [tasks, setTasks] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddTechnology = () => {
  const technology = technologyInput.trim();

  if (!technology) {
    return;
  }

  if (technologies.includes(technology)) {
    setError("This technology has already been added.");
    return;
  }

  setTechnologies((previous) => [...previous, technology]);
  setTechnologyInput("");
  setError("");
};

const handleRemoveTechnology = (technologyToRemove) => {
  setTechnologies((previous) =>
    previous.filter(
      (technology) => technology !== technologyToRemove
    )
  );
};

const handleAddTask = () => {
  const task = taskInput.trim();

  if (!task) {
    return;
  }

  setTasks((previous) => [...previous, task]);
  setTaskInput("");
  setError("");
};

const handleRemoveTask = (taskIndex) => {
  setTasks((previous) =>
    previous.filter((_, index) => index !== taskIndex)
  );
};

  const handleMemberSearch = async (event) => {
  const value = event.target.value;

  setMemberSearch(value);

  if (!value.trim()) {
    setAvailableUsers([]);
    return;
  }

  try {
    setIsSearchingUsers(true);

    const users = await searchUsers(value);

    setAvailableUsers(users);
  } catch (error) {
    console.error("Failed to search users:", error);
    setAvailableUsers([]);
  } finally {
    setIsSearchingUsers(false);
  }
};

const addMember = (user) => {
  const alreadySelected = selectedMembers.some(
    (member) => member._id === user._id
  );

  if (alreadySelected) {
    return;
  }

  setSelectedMembers((previous) => [
    ...previous,
    user,
  ]);
};

const removeMember = (userId) => {
  setSelectedMembers((previous) =>
    previous.filter((member) => member._id !== userId)
  );
};

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.title.trim()) {
      setError("Project title is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Project description is required.");
      return;
    }

    try {
      setIsSubmitting(true);

     const projectData = {
  title: formData.title.trim(),
  description: formData.description.trim(),
  status: formData.status,
  technologies,
  tasks,
};

      await createProject(projectData);

      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to create project:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-6 text-sm text-slate-400 transition-colors hover:text-white"
          >
            ← Back to Dashboard
          </button>

          <p className="text-sm font-medium text-indigo-400">
            Projects
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Create a new project
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
            Add the basic information about your project and start
            collaborating with your team.
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8"
        >
          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Project title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Collab Project Management"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this project is about..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          {/* Status */}
          <div className="mb-6">
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Project status
            </label>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none transition-all duration-200 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/10"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Technologies */}
          {/* Technologies */}
<div className="mb-8">
  <label
    htmlFor="technologyInput"
    className="mb-2 block text-sm font-medium text-slate-200"
  >
    Technologies
  </label>

  <div className="flex flex-col gap-3 sm:flex-row">
    <input
      id="technologyInput"
      type="text"
      value={technologyInput}
      onChange={(event) => setTechnologyInput(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          handleAddTechnology();
        }
      }}
      placeholder="e.g. React.js"
      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/10"
    />

    <button
      type="button"
      onClick={handleAddTechnology}
      className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-5 py-3 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20 hover:text-indigo-200"
    >
      + Add
    </button>
  </div>

  {technologies.length > 0 && (
    <div className="mt-4 flex flex-wrap gap-2">
      {technologies.map((technology) => (
        <div
          key={technology}
          className="flex items-center gap-2 rounded-lg border border-indigo-400/10 bg-indigo-400/5 px-3 py-2 text-xs font-medium text-indigo-300"
        >
          <span>{technology}</span>

          <button
            type="button"
            onClick={() => handleRemoveTechnology(technology)}
            className="text-indigo-300/60 transition hover:text-red-300"
            aria-label={`Remove ${technology}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}
</div>

          {/* Members */}
<div className="mb-8">
  <label
    htmlFor="memberSearch"
    className="mb-2 block text-sm font-medium text-slate-200"
  >
    Project members
  </label>

  <input
    id="memberSearch"
    type="text"
    value={memberSearch}
    onChange={handleMemberSearch}
    placeholder="Search by User ID or name..."
    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/10"
  />

  <p className="mt-2 text-xs text-slate-500">
    Search registered users using their User ID or name.
  </p>

  {/* Search results */}
  {memberSearch.trim() && (
    <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-slate-900">
      {isSearchingUsers ? (
        <div className="px-4 py-3 text-sm text-slate-400">
          Searching...
        </div>
      ) : availableUsers.length > 0 ? (
        availableUsers.map((user) => {
          const alreadySelected = selectedMembers.some(
            (member) => member._id === user._id
          );

          return (
            <div
              key={user._id}
              className="flex items-center justify-between border-b border-white/5 px-4 py-3 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-white">
                  {user.userCode}
                </p>

                <p className="text-xs text-slate-400">
                  {user.name}
                </p>
              </div>

              <button
                type="button"
                disabled={alreadySelected}
                onClick={() => addMember(user)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {alreadySelected ? "Added" : "Add"}
              </button>
            </div>
          );
        })
      ) : (
        <div className="px-4 py-3 text-sm text-slate-400">
          No users found.
        </div>
      )}
    </div>
  )}

  {/* Selected members */}
  {selectedMembers.length > 0 && (
    <div className="mt-5">
      <p className="mb-3 text-sm font-medium text-slate-200">
        Selected members
      </p>

      <div className="space-y-2">
        {selectedMembers.map((member) => (
          <div
            key={member._id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-white">
                {member.userCode}
              </p>

              <p className="text-xs text-slate-400">
                {member.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeMember(member._id)}
              className="text-xs font-medium text-red-300 transition hover:text-red-200"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

{/* Tasks */}
<div className="mb-8">
  <label
    htmlFor="taskInput"
    className="mb-2 block text-sm font-medium text-slate-200"
  >
    Project Tasks
  </label>

  <div className="flex flex-col gap-3 sm:flex-row">
    <input
      id="taskInput"
      type="text"
      value={taskInput}
      onChange={(event) => setTaskInput(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          handleAddTask();
        }
      }}
      placeholder="e.g. Design database schema"
      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/10"
    />

    <button
      type="button"
      onClick={handleAddTask}
      className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-5 py-3 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20 hover:text-indigo-200"
    >
      + Add
    </button>
  </div>

  {tasks.length > 0 && (
    <div className="mt-4 space-y-2">
      {tasks.map((task, index) => (
        <div
          key={`${task}-${index}`}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-semibold text-indigo-300">
            {index + 1}
          </span>

          <span className="min-w-0 flex-1 break-words text-sm text-slate-300">
            {task}
          </span>

          <button
            type="button"
            onClick={() => handleRemoveTask(index)}
            className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-red-300"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )}
</div>

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProject;