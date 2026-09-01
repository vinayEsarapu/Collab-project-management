import { useState } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import {
  createProject,
  getUsersForMemberSelection,
} from "../services/projectservices";
function CreateProject() {
  const location = useLocation();
  const navigate = useNavigate();
  const backPath = location.state?.from || "/dashboard";
const backLabel =
  backPath === "/projects"
    ? "← Back to Projects"
    : "← Back to Dashboard";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Planning",
  });
  const [technologyInput, setTechnologyInput] = useState("");
const [technologies, setTechnologies] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
const [showMemberList, setShowMemberList] = useState(false);
const [isLoadingUsers, setIsLoadingUsers] = useState(false);

const handleOpenMemberList = async () => {
  if (showMemberList) {
    setShowMemberList(false);
    return;
  }

  try {
    setIsLoadingUsers(true);
    setError("");

    const users = await getUsersForMemberSelection();

    setAvailableUsers(users);
    setShowMemberList(true);
  } catch (error) {
    console.error("Failed to load users:", error);

    setError(
      error.response?.data?.message ||
        "Unable to load registered users."
    );
  } finally {
    setIsLoadingUsers(false);
  }
};

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
  members: selectedMembers.map(
    (member) => member._id
  ),
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
  onClick={() => navigate(backPath)}
  className="mb-6 text-sm text-slate-400 transition-colors hover:text-white"
>
  {backLabel}
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
{/* Members */}
<div className="mb-8">
  <div className="flex items-center justify-between gap-3">
    <div>
      <label className="block text-sm font-medium text-slate-200">
        Project members
      </label>

      <p className="mt-1 text-xs text-slate-500">
        Select registered users who should collaborate on this project.
      </p>
    </div>

    <button
      type="button"
      onClick={handleOpenMemberList}
      disabled={isLoadingUsers}
      className="shrink-0 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20 hover:text-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoadingUsers
        ? "Loading..."
        : showMemberList
        ? "Close"
        : "+ Add Members"}
    </button>
  </div>

  {/* Registered Users List */}
  {showMemberList && (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold text-white">
          Select project members
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Click Add beside a user to add them to this project.
        </p>
      </div>

      {availableUsers.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-slate-400">
            No registered users available.
          </p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {availableUsers.map((user) => {
            const alreadySelected = selectedMembers.some(
              (member) => member._id === user._id
            );

            return (
              <div
                key={user._id}
                className="flex items-center justify-between gap-4 border-b border-white/5 px-4 py-3 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {/* Avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-semibold text-indigo-300">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  {/* User information */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">
                      {user.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      ID: {user.userCode}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={alreadySelected}
                  onClick={() => addMember(user)}
                  className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {alreadySelected ? "Added" : "Add"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )}

  {/* Selected Members */}
  {selectedMembers.length > 0 && (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-200">
          Selected members
        </p>

        <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300">
          {selectedMembers.length}
        </span>
      </div>

      <div className="space-y-2">
        {selectedMembers.map((member) => (
          <div
            key={member._id}
            className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-semibold text-indigo-300">
                {member.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  {member.name}
                </p>

                <p className="text-xs text-slate-500">
                  ID: {member.userCode}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeMember(member._id)}
              className="shrink-0 text-xs font-medium text-red-300 transition hover:text-red-200"
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


          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
           <button
  type="button"
  onClick={() => navigate(backPath)}
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