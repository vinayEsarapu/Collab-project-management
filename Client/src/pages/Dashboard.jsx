import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

import {
  getIssues,
  getIssuesByProject,
} from "../services/issueservices";

import { getProjects } from "../services/projectservices";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all");

  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [issuesError, setIssuesError] = useState("");

  // -----------------------------------------
  // Load projects
  // -----------------------------------------

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setProjectsLoading(true);
        setProjectsError("");

        const data = await getProjects();

        setProjects(data || []);
      } catch (error) {
        console.error("Failed to load projects:", error);

        setProjectsError(
          error.response?.data?.message ||
            "Unable to load project statistics."
        );
      } finally {
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // -----------------------------------------
  // Load issues
  // -----------------------------------------

  useEffect(() => {
    const loadIssues = async () => {
      try {
        setIssuesLoading(true);
        setIssuesError("");

        const data =
          selectedProject === "all"
            ? await getIssues()
            : await getIssuesByProject(selectedProject);

        setIssues(data?.issues || []);
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

  // -----------------------------------------
  // Project statistics
  // -----------------------------------------

  const projectStats = useMemo(
    () => ({
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
    }),
    [projects]
  );

  // -----------------------------------------
  // Issue statistics
  // -----------------------------------------

  const issueStats = useMemo(
    () => ({
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
    }),
    [issues]
  );

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* =====================================
            Welcome Section
        ===================================== */}

        <section className="mb-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="mb-2 text-sm font-medium text-indigo-400">
                Dashboard
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back, {firstName}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Keep track of your projects and issues from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/projects/new")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition-colors duration-200 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            >
              <span className="text-lg leading-none">+</span>
              New Project
            </button>

          </div>
        </section>

        {/* =====================================
            Project Overview
        ===================================== */}

        <section className="mb-10">

          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Project Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A summary of your current projects.
            </p>
          </div>

          {projectsError && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {projectsError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              label="Total Projects"
              value={
                projectsLoading
                  ? "—"
                  : projectStats.total
              }
              description="All projects"
            />

            <StatCard
              label="Planning"
              value={
                projectsLoading
                  ? "—"
                  : projectStats.planning
              }
              description="Projects being planned"
            />

            <StatCard
              label="In Progress"
              value={
                projectsLoading
                  ? "—"
                  : projectStats.inProgress
              }
              description="Currently active"
            />

            <StatCard
              label="Completed"
              value={
                projectsLoading
                  ? "—"
                  : projectStats.completed
              }
              description="Finished projects"
            />

          </div>
        </section>

        {/* =====================================
            Issue Overview
        ===================================== */}

        <section>

          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h2 className="text-lg font-semibold">
                Issue Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track issue progress across your projects.
              </p>
            </div>

            <div className="w-full sm:w-60">

              <label
                htmlFor="project-filter"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Project
              </label>

              <select
                id="project-filter"
                value={selectedProject}
                onChange={(event) =>
                  setSelectedProject(event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none transition-colors duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
              >
                <option value="all">
                  All Projects
                </option>

                {projects.map((project) => (
                  <option
                    key={project._id}
                    value={project._id}
                  >
                    {project.title}
                  </option>
                ))}
              </select>

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
              value={
                issuesLoading
                  ? "—"
                  : issueStats.total
              }
              description="All issues"
            />

            <StatCard
              label="Open"
              value={
                issuesLoading
                  ? "—"
                  : issueStats.open
              }
              description="Needs attention"
            />

            <StatCard
              label="In Progress"
              value={
                issuesLoading
                  ? "—"
                  : issueStats.inProgress
              }
              description="Currently being worked on"
            />

            <StatCard
              label="Closed"
              value={
                issuesLoading
                  ? "—"
                  : issueStats.closed
              }
              description="Completed issues"
            />

          </div>
        </section>

      </main>
    </div>
  );
}


/* =========================================
   Statistics Card
========================================= */

function StatCard({
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors duration-200 hover:border-white/15 hover:bg-white/[0.05]">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-sm font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;