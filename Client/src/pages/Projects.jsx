import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../services/projectservices";

function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your projects. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        project.title?.toLowerCase().includes(search) ||
        project.description?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-indigo-400">
                Projects
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Your Projects
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Browse, search, and manage all your projects.
              </p>
            </div>

            <button
              onClick={() =>
  navigate("/projects/new", {
    state: { from: "/projects" },
  })
}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-400"
            >
              <span className="text-lg transition-transform duration-200 group-hover:rotate-90">
                +
              </span>

              New Project
            </button>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-indigo-400/50 focus:bg-white/10 sm:w-72"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300 outline-none transition-all duration-200 focus:border-indigo-400/50"
            >
              <option value="All">All Status</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">
                In Progress
              </option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </section>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <ProjectSkeleton key={item} />
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-center">
            <p className="font-medium text-red-300">
              Something went wrong
            </p>

            <p className="mt-2 text-sm text-slate-400">
              {error}
            </p>

            <button
              onClick={loadProjects}
              className="mt-4 rounded-lg border border-red-400/20 px-4 py-2 text-sm text-red-300 transition hover:bg-red-400/10"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading &&
          !error &&
          filteredProjects.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                📁
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                No projects found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                {searchTerm
                  ? "Try changing your search or status filter."
                  : "Create your first project to start managing your work."}
              </p>

              {!searchTerm && (
                <button
                  onClick={() =>
  navigate("/projects/new", {
    state: { from: "/projects" },
  })
}
                  className="mt-5 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
                >
                  Create your first project
                </button>
              )}
            </div>
          )}

        {/* Projects */}
        {!isLoading &&
          !error &&
          filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onView={() =>
                    navigate(`/projects/${project._id}`)
                  }
                />
              ))}
            </div>
          )}
      </main>
    </div>
  );
}

function ProjectCard({ project, onView }) {
  const statusStyles = {
    Planning:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",

    "In Progress":
      "border-blue-400/20 bg-blue-400/10 text-blue-300",

    Completed:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  };

  return (
    <article
  onClick={onView}
  role="button"
  tabIndex={0}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onView();
    }
  }}
  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-indigo-950/30"
>

      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl transition-all duration-500 group-hover:bg-indigo-500/20" />

      <div className="relative">

        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-lg">
            🚀
          </div>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              statusStyles[project.status] ||
              "border-white/10 bg-white/5 text-slate-300"
            }`}
          >
            {project.status || "Planning"}
          </span>
        </div>

        <h2 className="mt-5 line-clamp-1 text-lg font-semibold transition-colors duration-200 group-hover:text-indigo-300">
          {project.title}
        </h2>

        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-400">
          {project.description}
        </p>

        {/* Technologies */}
        <div className="mt-5 flex min-h-7 flex-wrap gap-2">
          {project.technologies?.slice(0, 3).map(
            (technology) => (
              <span
                key={technology}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-400"
              >
                {technology}
              </span>
            )
          )}

          {project.technologies?.length > 3 && (
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-500">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <p className="text-xs text-slate-500">
            Updated{" "}
            {project.updatedAt
              ? new Date(
                  project.updatedAt
                ).toLocaleDateString()
              : "Recently"}
          </p>
           <span className="text-xs font-medium text-slate-500 transition-colors duration-200 group-hover:text-indigo-300">
    Open project →
  </span>

          
        </div>
      </div>
    </article>
  );
}

function ProjectSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex justify-between">
        <div className="h-11 w-11 rounded-xl bg-white/10" />
        <div className="h-6 w-20 rounded-full bg-white/10" />
      </div>

      <div className="mt-5 h-5 w-2/3 rounded bg-white/10" />

      <div className="mt-3 h-4 w-full rounded bg-white/5" />
      <div className="mt-2 h-4 w-4/5 rounded bg-white/5" />

      <div className="mt-5 flex gap-2">
        <div className="h-6 w-16 rounded bg-white/10" />
        <div className="h-6 w-20 rounded bg-white/10" />
      </div>

      <div className="mt-6 h-px bg-white/10" />
    </div>
  );
}

export default Projects;