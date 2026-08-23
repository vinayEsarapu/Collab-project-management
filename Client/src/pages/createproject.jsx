import { useState } from "react";
import { useNavigate } from "react-router-dom";
import projectService from "../services/projectService";

function CreateProject() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Planning",
    technologies: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
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
        technologies: formData.technologies
          .split(",")
          .map((technology) => technology.trim())
          .filter(Boolean),
      };

      await projectService.createProject(projectData);

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
          <div className="mb-8">
            <label
              htmlFor="technologies"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Technologies
            </label>

            <input
              id="technologies"
              name="technologies"
              type="text"
              value={formData.technologies}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB, Express"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/10"
            />

            <p className="mt-2 text-xs text-slate-500">
              Separate technologies using commas.
            </p>
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