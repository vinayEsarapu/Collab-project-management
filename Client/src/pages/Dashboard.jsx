import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/Authcontext";
import projectService from "../services/projectService";
import { useNavigate } from "react-router-dom";
import {
  getIssues,
  getIssuesByProject,
} from "../services/issueservices";
//import Issues from "../pages/Issues";

function Dashboard() {
  const { user, logout } = useAuth();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [issuesError, setIssuesError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate = useNavigate();
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await projectService.getProjects();

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
    loadProjects();
  }, []);

  useEffect(() => {
  const loadIssues = async () => {
    try {
      setIssuesLoading(true);
      setIssuesError("");

      let data;

      if (selectedProject === "all") {
        data = await getIssues();
      } else {
        data = await getIssuesByProject(selectedProject);
      }

      setIssues(data.issues || []);
    } catch (error) {
      console.error("Failed to load issues:", error);

      setIssuesError(
        error.response?.data?.message ||
          "Unable to load issue statistics."
      );

      setIssues([]);
    } finally {
      setIssuesLoading(false);
    }
  };

  loadIssues();
}, [selectedProject]);

  const handleLogout = async () => {
    await logout();
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        project.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const projectStats = useMemo(() => {
    return {
      total: projects.length,
      planning: projects.filter(
        (project) => project.status === "Planning"
      ).length,
      inProgress: projects.filter(
        (project) => project.status === "In Progress"
      ).length,
      completed: projects.filter(
        (project) => project.status === "Completed"
      ).length,
    };
  }, [projects]);

  const issueStats = useMemo(() => {
  return {
    total: issues.length,

    open: issues.filter(
      (issue) => issue.status === "Open"
    ).length,

    inProgress: issues.filter(
      (issue) => issue.status === "In Progress"
    ).length,

    closed: issues.filter(
      (issue) => issue.status === "Closed"
    ).length,
  };
}, [issues]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome section */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-medium text-indigo-400">
                Dashboard
              </p>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Manage your projects, track progress, and keep your
                team moving forward.
              </p>
            </div>

            <button
              onClick={() => navigate("/projects/new")}
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-indigo-500/30">
              <span className="text-lg transition-transform duration-200 group-hover:rotate-90">
                +
              </span>
              New Project
            </button>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-8">
        <h3 className="mb-4 text-lg font-semibold">
           Project Overview
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Projects"
            value={projectStats.total}
            description="All your projects"
          />

          <StatCard
            label="Planning"
            value={projectStats.planning}
            description="Projects being planned"
          />

          <StatCard
            label="In Progress"
            value={projectStats.inProgress}
            description="Currently active"
          />

          <StatCard
            label="Completed"
            value={projectStats.completed}
            description="Successfully completed"
          />
           </div>
        </section>

   <section className="mb-8">
  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h3 className="text-lg font-semibold">
        Issue Overview
      </h3>

      <p className="mt-1 text-sm text-slate-400">
        Track the current state of your issues.
      </p>
    </div>

    <div className="w-full sm:w-56">
      <label
        htmlFor="project-filter"
        className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500"
      >
        Filter by project
      </label>

      <select
        id="project-filter"
        value={selectedProject}
        onChange={(event) =>
          setSelectedProject(event.target.value)
        }
        className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
      >
        <option value="all">
          All Projects
        </option>

        {projects.map((project) => (
          <option
            key={project._id}
            value={project._id}
          >
            {project.name}
          </option>
        ))}
      </select>
      {/* Selected project information */}
  {selectedProject !== "all" && (
    <p className="mt-2 text-xs text-slate-500">
      Showing issues for{" "}
      <span className="text-slate-300">
        {projects.find(
          (project) => project._id === selectedProject
        )?.name}
      </span>
    </p>
  )}
</div>
</div>


  {issuesError && (
    <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {issuesError}
    </div>
  )}

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard
      label="Total Issues"
      value={issuesLoading ? "—" : issueStats.total}
      description="All issues"
    />

    <StatCard
      label="Open"
      value={issuesLoading ? "—" : issueStats.open}
      description="Issues needing attention"
    />

    <StatCard
      label="In Progress"
      value={
        issuesLoading ? "—" : issueStats.inProgress
      }
      description="Currently being worked on"
    />

    <StatCard
      label="Closed"
      value={issuesLoading ? "—" : issueStats.closed}
      description="Completed issues"
    />
  </div>
</section>

        {/* Project section */}
        <section>
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                Your Projects
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Browse and manage your projects.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-indigo-400/50 focus:bg-white/10 sm:w-64"
                />
              </div>

              {/* Filter */}
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
          </div>

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

          {/* Empty state */}
          {!isLoading &&
            !error &&
            filteredProjects.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                  📁
                </div>

                <h4 className="mt-5 text-lg font-semibold">
                  No projects found
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  {searchTerm
                    ? "Try changing your search or status filter."
                    : "Create your first project to start managing your work."}
                </p>

                {!searchTerm && (
                  <button className="mt-5 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400">
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
                     onView={() => navigate(`/projects/${project._id}`)}
                  />
                ))}
              </div>
            )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, description }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]">
      <p className="text-sm text-slate-400">{label}</p>

      <p className="mt-3 text-3xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ProjectCard({ project , onView }) {
  const statusStyles = {
    Planning:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",

    "In Progress":
      "border-blue-400/20 bg-blue-400/10 text-blue-300",

    Completed:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-indigo-950/30">
      {/* Decorative glow */}
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

        <h4 className="mt-5 line-clamp-1 text-lg font-semibold transition-colors duration-200 group-hover:text-indigo-300">
          {project.title}
        </h4>

        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-400">
          {project.description}
        </p>

        {/* Technologies */}
        <div className="mt-5 flex min-h-7 flex-wrap gap-2">
          {project.technologies?.slice(0, 3).map((technology) => (
            <span
              key={technology}
              className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-400"
            >
              {technology}
            </span>
          ))}

          {project.technologies?.length > 3 && (
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-500">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <p className="text-xs text-slate-500">
            Updated{" "}
            {project.updatedAt
              ? new Date(project.updatedAt).toLocaleDateString()
              : "Recently"}
          </p>

          <button 
          onClick={() => onView()}
          className="text-sm font-medium text-indigo-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-indigo-300">
            View →
          </button>
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

export default Dashboard;