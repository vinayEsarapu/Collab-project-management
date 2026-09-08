import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  ShieldCheck,
  FolderKanban,
  ListTodo,
  CircleAlert,
  Forward,
  CheckCircle2,
  Clock3,
  ChevronRight,
  Filter,
  RefreshCw,
} from "lucide-react";

import { getMyProfile } from "../services/profileService.js";

const getStatusClasses = (status) => {
  switch (status) {
    case "Completed":
    case "Resolved":
    case "Closed":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "In Progress":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

    case "Planning":
    case "Open":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";

    default:
      return "border-white/10 bg-white/5 text-slate-300";
  }
};

const getPriorityClasses = (priority) => {
  switch (priority) {
    case "Critical":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    case "High":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";

    case "Medium":
      return "border-yellow-400/20 bg-yellow-400/10 text-yellow-300";

    case "Low":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    default:
      return "border-white/10 bg-white/5 text-slate-300";
  }
};

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [taskProjectFilter, setTaskProjectFilter] =
    useState("All");

  const loadProfile = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getMyProfile();

      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const taskProjects = useMemo(() => {
    if (!profile?.tasks) return [];

    return [
      ...new Set(
        profile.tasks.map(
          (task) => task.projectTitle
        )
      ),
    ];
  }, [profile]);

  const filteredTasks = useMemo(() => {
    if (!profile?.tasks) return [];

    if (taskProjectFilter === "All") {
      return profile.tasks;
    }

    return profile.tasks.filter(
      (task) =>
        task.projectTitle === taskProjectFilter
    );
  }, [profile, taskProjectFilter]);

  const openProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const openTask = (projectId, taskId) => {
    navigate(
      `/projects/${projectId}/tasks/${taskId}`
    );
  };

  const openProjectIssue = (
    projectId,
    issueId
  ) => {
    navigate(
      `/projects/${projectId}/issues/${issueId}`
    );
  };

  const openTaskIssue = (
    projectId,
    taskId,
    issueId
  ) => {
    navigate(
      `/projects/${projectId}/tasks/${taskId}/issues/${issueId}`
    );
  };

  // -----------------------------
  // LOADING
  // -----------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-32 rounded-3xl bg-white/5" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-white/5"
                />
              ))}
            </div>

            <div className="h-64 rounded-3xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------
  // ERROR
  // -----------------------------
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-red-400/20 bg-red-400/5 p-8 text-center">
            <CircleAlert className="mx-auto mb-4 h-10 w-10 text-red-400" />

            <h1 className="text-xl font-semibold">
              Unable to load profile
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {error}
            </p>

            <button
              onClick={() => loadProfile()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const {
    user,
    projects = [],
    tasks = [],
    assignedProjectIssues = [],
    referredProjectIssues = [],
    assignedTaskIssues = [],
  } = profile;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================
            HEADER / USER DETAILS
        ===================================== */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-400/20">
                  <User className="h-8 w-8 text-indigo-300" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-slate-400">
                    My Profile
                  </p>

                  <h1 className="mt-1 truncate text-2xl font-bold sm:text-3xl">
                    {user?.name || "User"}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-4 w-4" />
                      {user?.email}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      ID: {user?.userCode}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => loadProfile(true)}
                disabled={refreshing}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>
          </div>
        </section>

        {/* =====================================
            SUMMARY
        ===================================== */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            icon={FolderKanban}
            label="My Projects"
            value={projects.length}
          />

          <SummaryCard
            icon={ListTodo}
            label="My Tasks"
            value={tasks.length}
          />

          <SummaryCard
            icon={CircleAlert}
            label="Assigned Issues"
            value={
              assignedProjectIssues.length +
              assignedTaskIssues.length
            }
          />

          <SummaryCard
            icon={Forward}
            label="Referred Issues"
            value={referredProjectIssues.length}
          />

        </section>

        {/* =====================================
            MY PROJECTS
        ===================================== */}
        <ProfileSection
          title="My Projects"
          description="Projects where you are the owner or a member."
          icon={FolderKanban}
        >
          {projects.length === 0 ? (
            <EmptyState message="You are not part of any projects yet." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <button
                  key={project._id}
                  onClick={() =>
                    openProject(project._id)
                  }
                  className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-100">
                        {project.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                        {project.description ||
                          "No project description."}
                      </p>
                    </div>

                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-slate-300" />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-lg border px-2.5 py-1 text-xs ${getStatusClasses(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>

                    <span className="rounded-lg border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-1 text-xs text-indigo-300">
                      {project.role}
                    </span>
                  </div>

                  {project.technologies?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.technologies
                        .slice(0, 4)
                        .map((technology) => (
                          <span
                            key={technology}
                            className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-slate-400"
                          >
                            {technology}
                          </span>
                        ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </ProfileSection>

        {/* =====================================
            MY TASKS
        ===================================== */}
        <ProfileSection
          title="My Tasks"
          description="Tasks currently assigned to you."
          icon={ListTodo}
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 text-sm text-slate-400">
              <Filter className="h-4 w-4" />
              Filter by project
            </div>

            <select
              value={taskProjectFilter}
              onChange={(event) =>
                setTaskProjectFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-indigo-400/40"
            >
              <option value="All">
                All Projects
              </option>

              {taskProjects.map((project) => (
                <option
                  key={project}
                  value={project}
                >
                  {project}
                </option>
              ))}
            </select>
          </div>

          {filteredTasks.length === 0 ? (
            <EmptyState
              message={
                tasks.length === 0
                  ? "No tasks are currently assigned to you."
                  : "No tasks match this project filter."
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTasks.map((task) => (
                <button
                  key={`${task.projectId}-${task._id}`}
                  onClick={() =>
                    openTask(
                      task.projectId,
                      task._id
                    )
                  }
                  className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="mb-1 text-xs text-indigo-300">
                        {task.projectTitle}
                      </p>

                      <h3 className="font-semibold text-slate-100">
                        {task.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                        {task.description ||
                          "No task description."}
                      </p>
                    </div>

                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-slate-300" />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span
                      className={`rounded-lg border px-2.5 py-1 text-xs ${getStatusClasses(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>

                    <span
                      className={`rounded-lg border px-2.5 py-1 text-xs ${getPriorityClasses(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ProfileSection>

        {/* =====================================
            ASSIGNED PROJECT ISSUES
        ===================================== */}
        <ProfileSection
          title="Assigned Project Issues"
          description="Project-level issues assigned directly to you."
          icon={CircleAlert}
        >
          {assignedProjectIssues.length === 0 ? (
            <EmptyState message="No project-level issues are assigned to you." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {assignedProjectIssues.map((issue) => (
                <IssueCard
                  key={issue._id}
                  issue={issue}
                  onClick={() =>
                    openProjectIssue(
                      issue.projectId,
                      issue._id
                    )
                  }
                />
              ))}
            </div>
          )}
        </ProfileSection>

        {/* =====================================
            REFERRED PROJECT ISSUES
        ===================================== */}
        <ProfileSection
          title="Referred Project Issues"
          description="Project-level issues referred to you."
          icon={Forward}
        >
          {referredProjectIssues.length === 0 ? (
            <EmptyState message="No project-level issues have been referred to you." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {referredProjectIssues.map((issue) => (
                <IssueCard
                  key={issue._id}
                  issue={issue}
                  onClick={() =>
                    openProjectIssue(
                      issue.projectId,
                      issue._id
                    )
                  }
                />
              ))}
            </div>
          )}
        </ProfileSection>

        {/* =====================================
            ASSIGNED TASK ISSUES
        ===================================== */}
        <ProfileSection
          title="Assigned Task Issues"
          description="Issues belonging to your assigned tasks."
          icon={CheckCircle2}
        >
          {assignedTaskIssues.length === 0 ? (
            <EmptyState message="No task-level issues are assigned to you." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {assignedTaskIssues.map((issue) => (
                <IssueCard
                  key={issue._id}
                  issue={issue}
                  taskIssue
                  onClick={() =>
                    openTaskIssue(
                      issue.projectId,
                      issue.taskId,
                      issue._id
                    )
                  }
                />
              ))}
            </div>
          )}
        </ProfileSection>

      </div>
    </div>
  );
};

/* =========================================
   SUMMARY CARD
========================================= */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition duration-200 hover:border-white/15 hover:bg-white/[0.05]">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
          <Icon className="h-5 w-5 text-indigo-300" />
        </div>

        <span className="text-2xl font-bold text-white">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm text-slate-400">
        {label}
      </p>
    </div>
  );
};

/* =========================================
   PROFILE SECTION
========================================= */

const ProfileSection = ({
  title,
  description,
  icon: Icon,
  children,
}) => {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
          <Icon className="h-5 w-5 text-indigo-300" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
};

/* =========================================
   ISSUE CARD
========================================= */

const IssueCard = ({
  issue,
  onClick,
  taskIssue = false,
}) => {
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 text-xs text-indigo-300">
            {issue.projectTitle}
          </p>

          {taskIssue && (
            <p className="mb-2 text-xs text-slate-500">
              Task: {issue.taskTitle}
            </p>
          )}

          <h3 className="font-semibold text-slate-100">
            {issue.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
            {issue.description ||
              "No issue description."}
          </p>
        </div>

        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-500 transition group-hover:translate-x-1 group-hover:text-slate-300" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span
          className={`rounded-lg border px-2.5 py-1 text-xs ${getStatusClasses(
            issue.status
          )}`}
        >
          {issue.status}
        </span>

        <span
          className={`rounded-lg border px-2.5 py-1 text-xs ${getPriorityClasses(
            issue.priority
          )}`}
        >
          {issue.priority}
        </span>
      </div>

      {issue.labels?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {issue.labels
            .slice(0, 4)
            .map((label) => (
              <span
                key={label}
                className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-slate-400"
              >
                {label}
              </span>
            ))}
        </div>
      )}

      {issue.updatedAt && (
        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
          <Clock3 className="h-3.5 w-3.5" />
          Updated {formatDate(issue.updatedAt)}
        </div>
      )}
    </button>
  );
};

/* =========================================
   EMPTY STATE
========================================= */

const EmptyState = ({ message }) => {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-10 text-center">
      <p className="text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
};

export default Profile;