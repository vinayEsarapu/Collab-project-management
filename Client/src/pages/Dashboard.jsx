import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

import {
  getIssuesByProject,
  getIssuesByTask,
} from "../services/issueservices";

import {
  getProjects,
  getProjectTasks,
} from "../services/projectservices";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all");

  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");

  const [projectData, setProjectData] = useState([]);
  const [workLoading, setWorkLoading] = useState(true);
  const [workError, setWorkError] = useState("");

  /*
   * Dashboard project scope:
   * getProjects() returns projects where the logged-in
   * user is an owner/member.
   */
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

        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, []);

  /*
   * Load all tasks and all issues belonging to the projects.
   *
   * IMPORTANT:
   * Dashboard is based on project involvement, NOT
   * task/issue assignment.
   *
   * Therefore even if the user is not assigned to a
   * task or issue, it is still included.
   */
  useEffect(() => {
    const loadDashboardWork = async () => {
      if (!projects.length) {
        setProjectData([]);
        setWorkLoading(false);
        return;
      }

      try {
        setWorkLoading(true);
        setWorkError("");

        const data = await Promise.all(
          projects.map(async (project) => {
            const [
              tasksResponse,
              projectIssuesResponse,
            ] = await Promise.all([
              getProjectTasks(project._id),
              getIssuesByProject(project._id),
            ]);

            const tasks = Array.isArray(tasksResponse)
              ? tasksResponse
              : tasksResponse?.tasks || [];

            /*
             * Get issues belonging to every task.
             */
            const taskIssueResults = await Promise.all(
              tasks.map(async (task) => {
                try {
                  const response = await getIssuesByTask(task._id);

                  return response?.issues || [];
                } catch (error) {
                  console.error(
                    `Failed to load issues for task ${task._id}:`,
                    error
                  );

                  return [];
                }
              })
            );

            return {
              project,
              tasks,
              projectIssues:
                projectIssuesResponse?.issues || [],
              taskIssues: taskIssueResults.flat(),
            };
          })
        );

        setProjectData(data);
      } catch (error) {
        console.error(
          "Failed to load dashboard work:",
          error
        );

        setWorkError(
          error.response?.data?.message ||
            "Unable to load task and issue statistics."
        );

        setProjectData([]);
      } finally {
        setWorkLoading(false);
      }
    };

    loadDashboardWork();
  }, [projects]);

  /*
   * Apply project filter to Task Overview and Issue Overview.
   */
  const visibleProjectData = useMemo(() => {
    if (selectedProject === "all") {
      return projectData;
    }

    return projectData.filter(
      ({ project }) =>
        project._id === selectedProject
    );
  }, [projectData, selectedProject]);

  /*
   * PROJECT STATISTICS
   *
   * Project Overview always represents all projects
   * the user owns/is a member of.
   */
  const projectStats = useMemo(
    () => ({
      total: projects.length,

      planning: projects.filter(
        (project) =>
          project.status === "Planning"
      ).length,

      inProgress: projects.filter(
        (project) =>
          project.status === "In Progress"
      ).length,

      completed: projects.filter(
        (project) =>
          project.status === "Completed"
      ).length,
    }),
    [projects]
  );

  /*
   * TASK STATISTICS
   */
  const taskStats = useMemo(() => {
    const tasks = visibleProjectData.flatMap(
      ({ tasks }) => tasks
    );

    return {
      total: tasks.length,

      planning: tasks.filter(
        (task) =>
          task.status === "Planning"
      ).length,

      inProgress: tasks.filter(
        (task) =>
          task.status === "In Progress"
      ).length,

      completed: tasks.filter(
        (task) =>
          task.status === "Completed"
      ).length,
    };
  }, [visibleProjectData]);

  /*
   * ISSUE STATISTICS
   *
   * Includes:
   *
   * 1. Project-level issues
   * 2. Task-level issues
   *
   * This fixes the old Dashboard behaviour where
   * getIssues() only returned task:null issues.
   */
  const issueStats = useMemo(() => {
    const issues = visibleProjectData.flatMap(
      ({
        projectIssues,
        taskIssues,
      }) => [
        ...projectIssues,
        ...taskIssues,
      ]
    );

    return {
      total: issues.length,

      open: issues.filter(
        (issue) =>
          issue.status === "Open"
      ).length,

      inProgress: issues.filter(
        (issue) =>
          issue.status === "In Progress"
      ).length,

      closed: issues.filter(
        (issue) =>
          issue.status === "Closed"
      ).length,
    };
  }, [visibleProjectData]);

  const firstName =
    user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* =========================
            WELCOME
        ========================== */}

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
                Keep track of your projects, tasks,
                and issues from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/projects/new")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition-colors duration-200 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            >
              <span className="text-lg leading-none">
                +
              </span>

              New Project
            </button>
          </div>
        </section>

        {/* =========================
            PROJECT OVERVIEW
        ========================== */}

        <section className="mb-10">

          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Project Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A summary of projects you own or are
              a member of.
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

        {/* =========================
            PROJECT FILTER
        ========================== */}

        <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold">
              Project Work Filter
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Filter task and issue statistics
              by project.
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
                setSelectedProject(
                  event.target.value
                )
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
        </section>

        {workError && (
          <div className="mb-10 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {workError}
          </div>
        )}

        {/* =========================
            TASK OVERVIEW
        ========================== */}

        <section className="mb-10">

          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Task Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tasks across the selected project
              scope.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              label="Total Tasks"
              value={
                workLoading
                  ? "—"
                  : taskStats.total
              }
              description="All tasks"
            />

            <StatCard
              label="Planning"
              value={
                workLoading
                  ? "—"
                  : taskStats.planning
              }
              description="Tasks being planned"
            />

            <StatCard
              label="In Progress"
              value={
                workLoading
                  ? "—"
                  : taskStats.inProgress
              }
              description="Currently active"
            />

            <StatCard
              label="Completed"
              value={
                workLoading
                  ? "—"
                  : taskStats.completed
              }
              description="Finished tasks"
            />

          </div>
        </section>

        {/* =========================
            ISSUE OVERVIEW
        ========================== */}

        <section>

          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Issue Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Includes project-level issues and
              issues belonging to project tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              label="Total Issues"
              value={
                workLoading
                  ? "—"
                  : issueStats.total
              }
              description="Project + task issues"
            />

            <StatCard
              label="Open"
              value={
                workLoading
                  ? "—"
                  : issueStats.open
              }
              description="Needs attention"
            />

            <StatCard
              label="In Progress"
              value={
                workLoading
                  ? "—"
                  : issueStats.inProgress
              }
              description="Currently being worked on"
            />

            <StatCard
              label="Closed"
              value={
                workLoading
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

function StatCard({
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors duration-200 hover:border-white/15 hover:bg-white/[0.05]">

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
  );
}

export default Dashboard;