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
  ChevronRight,
  Filter,
  RefreshCw,
} from "lucide-react";

import { getMyProfile } from "../services/profileService.js";
import { changeEmail } from "../services/authService";

/* =========================================
   HELPERS
========================================= */

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

/* =========================================
   PROFILE
========================================= */

const Profile = () => {
  const navigate = useNavigate();

  /* =======================================
     MAIN PROFILE STATE
  ======================================= */

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =======================================
     CHANGE EMAIL
  ======================================= */

  const [showChangeEmail, setShowChangeEmail] = useState(false);
 const [currentPassword, setCurrentPassword] = useState("");
const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [newEmail, setNewEmail] = useState("");
  const [changeEmailLoading, setChangeEmailLoading] = useState(false);
  const [changeEmailMessage, setChangeEmailMessage] = useState("");
  const [changeEmailError, setChangeEmailError] = useState("");

  /* =======================================
     MY TASKS
  ======================================= */

  const [tasksPage, setTasksPage] = useState(1);

  const TASKS_PER_PAGE = 6;

  /* =======================================
     MY PROJECTS
  ======================================= */

  const [projectsPage, setProjectsPage] = useState(1);

  const PROJECTS_PER_PAGE = 6;

  /* =======================================
     ASSIGNED PROJECT ISSUES
  ======================================= */

  const [
    assignedProjectIssuesPage,
    setAssignedProjectIssuesPage,
  ] = useState(1);

  const ASSIGNED_PROJECT_ISSUES_PER_PAGE = 6;

  /* =======================================
     REFERRED PROJECT ISSUES
  ======================================= */

  const [
    referredProjectIssuesPage,
    setReferredProjectIssuesPage,
  ] = useState(1);

  const REFERRED_PROJECT_ISSUES_PER_PAGE = 6;

  /* =======================================
     ASSIGNED TASK ISSUES
  ======================================= */

  const [
    assignedTaskIssuesPage,
    setAssignedTaskIssuesPage,
  ] = useState(1);

  const ASSIGNED_TASK_ISSUES_PER_PAGE = 6;

  /* =======================================
     LOAD PROFILE
  ======================================= */

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

  /* =======================================
     SAFE PROFILE DATA
  ======================================= */

  const user = profile?.user || null;

  const projects = profile?.projects || [];

  const tasks = profile?.tasks || [];

  const assignedProjectIssues =
    profile?.assignedProjectIssues || [];

  const referredProjectIssues =
    profile?.referredProjectIssues || [];

  const assignedTaskIssues =
    profile?.assignedTaskIssues || [];

  /* =======================================
     GLOBAL PROJECT FILTER
  ======================================= */

  const [projectFilter, setProjectFilter] =
    useState("All");

  /* =======================================
     MY TASKS - FILTER
  ======================================= */

  const filteredTasks = useMemo(() => {
    if (projectFilter === "All") {
      return tasks;
    }

    return tasks.filter(
      (task) =>
        String(task.projectId) ===
        String(projectFilter)
    );
  }, [tasks, projectFilter]);

  const totalTaskPages = Math.ceil(
    filteredTasks.length / TASKS_PER_PAGE
  );

  const paginatedTasks = filteredTasks.slice(
    (tasksPage - 1) * TASKS_PER_PAGE,
    tasksPage * TASKS_PER_PAGE
  );

  /* =======================================
     MY PROJECTS - PAGINATION
  ======================================= */

  const totalProjectPages = Math.ceil(
    projects.length / PROJECTS_PER_PAGE
  );

  const paginatedProjects = projects.slice(
    (projectsPage - 1) * PROJECTS_PER_PAGE,
    projectsPage * PROJECTS_PER_PAGE
  );

  /* =======================================
     ASSIGNED PROJECT ISSUES
     FILTER + PAGINATION
  ======================================= */

  const filteredAssignedProjectIssues =
    useMemo(() => {
      if (projectFilter === "All") {
        return assignedProjectIssues;
      }

      return assignedProjectIssues.filter(
        (issue) =>
          String(issue.projectId) ===
          String(projectFilter)
      );
    }, [
      assignedProjectIssues,
      projectFilter,
    ]);

  const totalAssignedProjectIssuePages =
    Math.ceil(
      filteredAssignedProjectIssues.length /
        ASSIGNED_PROJECT_ISSUES_PER_PAGE
    );

  const paginatedAssignedProjectIssues =
    filteredAssignedProjectIssues.slice(
      (assignedProjectIssuesPage - 1) *
        ASSIGNED_PROJECT_ISSUES_PER_PAGE,
      assignedProjectIssuesPage *
        ASSIGNED_PROJECT_ISSUES_PER_PAGE
    );

  /* =======================================
     REFERRED PROJECT ISSUES
     FILTER + PAGINATION
  ======================================= */

  const filteredReferredProjectIssues =
    useMemo(() => {
      if (projectFilter === "All") {
        return referredProjectIssues;
      }

      return referredProjectIssues.filter(
        (issue) =>
          String(issue.projectId) ===
          String(projectFilter)
      );
    }, [
      referredProjectIssues,
      projectFilter,
    ]);

  const totalReferredProjectIssuePages =
    Math.ceil(
      filteredReferredProjectIssues.length /
        REFERRED_PROJECT_ISSUES_PER_PAGE
    );

  const paginatedReferredProjectIssues =
    filteredReferredProjectIssues.slice(
      (referredProjectIssuesPage - 1) *
        REFERRED_PROJECT_ISSUES_PER_PAGE,
      referredProjectIssuesPage *
        REFERRED_PROJECT_ISSUES_PER_PAGE
    );

  /* =======================================
     ASSIGNED TASK ISSUES
     FILTER + PAGINATION
  ======================================= */

  const filteredAssignedTaskIssues =
    useMemo(() => {
      if (projectFilter === "All") {
        return assignedTaskIssues;
      }

      return assignedTaskIssues.filter(
        (issue) =>
          String(issue.projectId) ===
          String(projectFilter)
      );
    }, [
      assignedTaskIssues,
      projectFilter,
    ]);

  const totalAssignedTaskIssuePages =
    Math.ceil(
      filteredAssignedTaskIssues.length /
        ASSIGNED_TASK_ISSUES_PER_PAGE
    );

  const paginatedAssignedTaskIssues =
    filteredAssignedTaskIssues.slice(
      (assignedTaskIssuesPage - 1) *
        ASSIGNED_TASK_ISSUES_PER_PAGE,
      assignedTaskIssuesPage *
        ASSIGNED_TASK_ISSUES_PER_PAGE
    );

  /* =======================================
     RESET PAGINATION WHEN FILTER CHANGES
  ======================================= */

  useEffect(() => {
    setTasksPage(1);
    setAssignedProjectIssuesPage(1);
    setReferredProjectIssuesPage(1);
    setAssignedTaskIssuesPage(1);
  }, [projectFilter]);

  /* =======================================
     KEEP PROJECT PAGINATION VALID
  ======================================= */

  useEffect(() => {
    if (
      totalProjectPages > 0 &&
      projectsPage > totalProjectPages
    ) {
      setProjectsPage(totalProjectPages);
    }

    if (
      totalProjectPages === 0 &&
      projectsPage !== 1
    ) {
      setProjectsPage(1);
    }
  }, [
    totalProjectPages,
    projectsPage,
  ]);

  /* =======================================
     KEEP TASK PAGINATION VALID
  ======================================= */

  useEffect(() => {
    if (
      totalTaskPages > 0 &&
      tasksPage > totalTaskPages
    ) {
      setTasksPage(totalTaskPages);
    }

    if (
      totalTaskPages === 0 &&
      tasksPage !== 1
    ) {
      setTasksPage(1);
    }
  }, [
    totalTaskPages,
    tasksPage,
  ]);

  /* =======================================
     KEEP ASSIGNED PROJECT ISSUE PAGINATION
     VALID
  ======================================= */

  useEffect(() => {
    if (
      totalAssignedProjectIssuePages > 0 &&
      assignedProjectIssuesPage >
        totalAssignedProjectIssuePages
    ) {
      setAssignedProjectIssuesPage(
        totalAssignedProjectIssuePages
      );
    }

    if (
      totalAssignedProjectIssuePages === 0 &&
      assignedProjectIssuesPage !== 1
    ) {
      setAssignedProjectIssuesPage(1);
    }
  }, [
    totalAssignedProjectIssuePages,
    assignedProjectIssuesPage,
  ]);

  /* =======================================
     KEEP REFERRED ISSUE PAGINATION VALID
  ======================================= */

  useEffect(() => {
    if (
      totalReferredProjectIssuePages > 0 &&
      referredProjectIssuesPage >
        totalReferredProjectIssuePages
    ) {
      setReferredProjectIssuesPage(
        totalReferredProjectIssuePages
      );
    }

    if (
      totalReferredProjectIssuePages === 0 &&
      referredProjectIssuesPage !== 1
    ) {
      setReferredProjectIssuesPage(1);
    }
  }, [
    totalReferredProjectIssuePages,
    referredProjectIssuesPage,
  ]);

  /* =======================================
     KEEP ASSIGNED TASK ISSUE PAGINATION
     VALID
  ======================================= */

  useEffect(() => {
    if (
      totalAssignedTaskIssuePages > 0 &&
      assignedTaskIssuesPage >
        totalAssignedTaskIssuePages
    ) {
      setAssignedTaskIssuesPage(
        totalAssignedTaskIssuePages
      );
    }

    if (
      totalAssignedTaskIssuePages === 0 &&
      assignedTaskIssuesPage !== 1
    ) {
      setAssignedTaskIssuesPage(1);
    }
  }, [
    totalAssignedTaskIssuePages,
    assignedTaskIssuesPage,
  ]);

  /* =======================================
     NAVIGATION
  ======================================= */

  const openProject = (projectId) => {
    navigate(`/projects/${projectId}`, {
      state: {
        from: "profile",
      },
    });
  };

  const openTask = (
    projectId,
    taskId
  ) => {
    navigate(
      `/projects/${projectId}/tasks/${taskId}`,
      {
        state: {
          from: "profile",
        },
      }
    );
  };

  const openProjectIssue = (
    projectId,
    issueId
  ) => {
    navigate(
      `/projects/${projectId}/issues/${issueId}`,
      {
        state: {
          from: "profile",
        },
      }
    );
  };

  const openTaskIssue = (
    projectId,
    taskId,
    issueId
  ) => {
    navigate(
      `/projects/${projectId}/tasks/${taskId}/issues/${issueId}`,
      {
        state: {
          from: "profile",
        },
      }
    );
  };

  /* =======================================
     CHANGE EMAIL
  ======================================= */

  const handleChangeEmail = async (e) => {
    e.preventDefault();

    setChangeEmailMessage("");
    setChangeEmailError("");

    if (!currentPassword.trim()) {
      setChangeEmailError(
        "Please enter your current password"
      );
      return;
    }

    if (!newEmail.trim()) {
      setChangeEmailError(
        "Please enter your new email address"
      );
      return;
    }

    if (!newEmail.includes("@")) {
      setChangeEmailError(
        "Please enter a valid email address"
      );
      return;
    }

    try {
      setChangeEmailLoading(true);

      const response = await changeEmail(
        currentPassword,
        newEmail.trim()
      );

      setChangeEmailMessage(
        response.message ||
          "Verification email sent to your new email address."
      );

      setCurrentPassword("");
setShowCurrentPassword(false);
setNewEmail("");
      setShowChangeEmail(false);
    } catch (error) {
      setChangeEmailError(
        error.response?.data?.message ||
          "Unable to change email. Please try again later."
      );
    } finally {
      setChangeEmailLoading(false);
    }
  };

  /* =======================================
     CLOSE CHANGE EMAIL MODAL
  ======================================= */

  const handleCloseChangeEmail = () => {
    if (changeEmailLoading) {
      return;
    }

    setShowChangeEmail(false);
    setCurrentPassword("");
    setNewEmail("");
    setChangeEmailError("");
    setChangeEmailMessage("");
  };

  /* =======================================
     LOADING
  ======================================= */

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

  /* =======================================
     ERROR
  ======================================= */

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
              type="button"
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

  /* =======================================
     MAIN PROFILE UI
  ======================================= */

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
                      {user?.email || "No email"}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      ID: {user?.userCode || "N/A"}
                    </span>

                  </div>
                </div>
              </div>

              <button
                type="button"
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
            CHANGE EMAIL
        ===================================== */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-indigo-300" />

                <h2 className="text-lg font-semibold text-slate-100">
                  Email Address
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                Change the email address associated with your account.
              </p>

              <p className="mt-2 break-all text-sm font-medium text-slate-200">
                {user?.email || "No email"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowChangeEmail(true);
                setChangeEmailError("");
                setChangeEmailMessage("");
              }}
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Change Email
            </button>

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
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                {paginatedProjects.map(
                  (project) => (
                    <button
                      key={project._id}
                      type="button"
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
                  )
                )}

              </div>

              {totalProjectPages > 1 && (
                <Pagination
                  currentPage={projectsPage}
                  totalPages={totalProjectPages}
                  onPageChange={setProjectsPage}
                />
              )}
            </>
          )}
        </ProfileSection>

        {/* =====================================
            GLOBAL PROJECT FILTER
        ===================================== */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <FilterBar
            value={projectFilter}
            onChange={setProjectFilter}
            projects={projects}
          />
        </div>

        {/* =====================================
            MY TASKS
        ===================================== */}

        <ProfileSection
          title="My Tasks"
          description="Tasks currently assigned to you."
          icon={ListTodo}
        >

          {filteredTasks.length === 0 ? (
            <EmptyState
              message={
                tasks.length === 0
                  ? "No tasks are currently assigned to you."
                  : "No tasks match this project filter."
              }
            />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">

                {paginatedTasks.map(
                  (task) => (
                    <button
                      key={`${task.projectId}-${task._id}`}
                      type="button"
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
                  )
                )}

              </div>

              {totalTaskPages > 1 && (
                <Pagination
                  currentPage={tasksPage}
                  totalPages={totalTaskPages}
                  onPageChange={setTasksPage}
                />
              )}
            </>
          )}
        </ProfileSection>

        {/* =====================================
            ASSIGNED PROJECT ISSUES
        ===================================== */}

        <ProfileSection
          title="Assigned Project Issues"
          description="Project-level issues currently assigned to you."
          icon={CircleAlert}
        >

          {filteredAssignedProjectIssues.length === 0 ? (
            <EmptyState
              message={
                assignedProjectIssues.length === 0
                  ? "No project-level issues are currently assigned to you."
                  : "No issues match this project filter."
              }
            />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">

                {paginatedAssignedProjectIssues.map(
                  (issue) => (
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
                  )
                )}

              </div>

              {totalAssignedProjectIssuePages > 1 && (
                <Pagination
                  currentPage={
                    assignedProjectIssuesPage
                  }
                  totalPages={
                    totalAssignedProjectIssuePages
                  }
                  onPageChange={
                    setAssignedProjectIssuesPage
                  }
                />
              )}
            </>
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

          {filteredReferredProjectIssues.length === 0 ? (
            <EmptyState
              message={
                referredProjectIssues.length === 0
                  ? "No project-level issues have been referred to you."
                  : "No issues match this project filter."
              }
            />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">

                {paginatedReferredProjectIssues.map(
                  (issue) => (
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
                  )
                )}

              </div>

              {totalReferredProjectIssuePages > 1 && (
                <Pagination
                  currentPage={
                    referredProjectIssuesPage
                  }
                  totalPages={
                    totalReferredProjectIssuePages
                  }
                  onPageChange={
                    setReferredProjectIssuesPage
                  }
                />
              )}
            </>
          )}
        </ProfileSection>

        {/* =====================================
            ASSIGNED TASK ISSUES
        ===================================== */}

        <ProfileSection
          title="Assigned Task Issues"
          description="Task-level issues currently assigned to you."
          icon={CircleAlert}
        >

          {filteredAssignedTaskIssues.length === 0 ? (
            <EmptyState
              message={
                assignedTaskIssues.length === 0
                  ? "No task-level issues are currently assigned to you."
                  : "No issues match this project filter."
              }
            />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">

                {paginatedAssignedTaskIssues.map(
                  (issue) => (
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
                  )
                )}

              </div>

              {totalAssignedTaskIssuePages > 1 && (
                <Pagination
                  currentPage={
                    assignedTaskIssuesPage
                  }
                  totalPages={
                    totalAssignedTaskIssuePages
                  }
                  onPageChange={
                    setAssignedTaskIssuesPage
                  }
                />
              )}
            </>
          )}
        </ProfileSection>

      </div>

      {/* =====================================
          CHANGE EMAIL MODAL
      ===================================== */}

      {showChangeEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl sm:p-8">

            {/* Header */}

            <div className="flex items-start justify-between gap-4">

              <div>
                <h2 className="text-xl font-semibold text-white sm:text-2xl">
                  Change Email
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Update the email address associated with your account.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseChangeEmail}
                disabled={changeEmailLoading}
                className="rounded-lg px-3 py-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                ✕
              </button>

            </div>

            {/* Error */}

            {changeEmailError && (
              <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                {changeEmailError}
              </div>
            )}

            {/* Success */}

            {changeEmailMessage && (
              <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
                {changeEmailMessage}
              </div>
            )}

            {/* Form */}

            <form
              onSubmit={handleChangeEmail}
              className="mt-6 grid gap-5"
            >

              {/* Current Password */}

              <div>
                <label
                  htmlFor="changeEmailCurrentPassword"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Current Password
                </label>

                <div className="relative">
  <input
    type={showCurrentPassword ? "text" : "password"}
    value={currentPassword}
    onChange={(e) => setCurrentPassword(e.target.value)}
    placeholder="Enter your current password"
    autoComplete="current-password"
    disabled={changeEmailLoading}
    className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />

  <button
    type="button"
    onClick={() =>
      setShowCurrentPassword((previous) => !previous)
    }
    disabled={changeEmailLoading}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition disabled:cursor-not-allowed"
    aria-label={
      showCurrentPassword
        ? "Hide password"
        : "Show password"
    }
  >
    {showCurrentPassword ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3l18 18"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.58 10.58a2 2 0 002.84 2.84"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.88 4.24A9.77 9.77 0 0112 4c5 0 8.5 4 10 8a16.7 16.7 0 01-4.12 5.36"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.61 6.61C4.92 7.74 3.69 9.4 2 12c1.5 4 5 8 10 8 1.61 0 3.07-.39 4.39-1.09"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  </button>
</div>
              </div>

              {/* New Email */}

              <div>
                <label
                  htmlFor="changeEmailNewEmail"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  New Email Address
                </label>

                <input
                  id="changeEmailNewEmail"
                  type="email"
                  value={newEmail}
                  onChange={(event) =>
                    setNewEmail(
                      event.target.value
                    )
                  }
                  autoComplete="email"
                  placeholder="Enter your new email address"
                  disabled={changeEmailLoading}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Information */}

              <div className="rounded-xl border border-indigo-400/10 bg-indigo-400/5 px-4 py-3 text-sm text-slate-400">
                A verification link will be sent to your new email
                address. Your email will only change after you verify
                the link. The verification link expires after 15 minutes.
              </div>

              {/* Actions */}

              <div className="mt-1 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={handleCloseChangeEmail}
                  disabled={changeEmailLoading}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changeEmailLoading}
                  className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {changeEmailLoading
                    ? "Sending..."
                    : "Send Verification Email"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

/* =========================================
   PAGINATION
========================================= */

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">

      <button
        type="button"
        onClick={() =>
          onPageChange((page) =>
            Math.max(1, page - 1)
          )
        }
        disabled={currentPage === 1}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <div className="flex max-w-full items-center justify-center gap-2 overflow-x-auto px-1 pb-1">

        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() =>
              onPageChange(page)
            }
            className={`h-9 min-w-9 shrink-0 rounded-lg px-3 text-sm font-medium transition ${
              currentPage === page
                ? "bg-indigo-500 text-white"
                : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {page}
          </button>
        ))}

      </div>

      <button
        type="button"
        onClick={() =>
          onPageChange((page) =>
            Math.min(
              totalPages,
              page + 1
            )
          )
        }
        disabled={currentPage === totalPages}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>

    </div>
  );
};

/* =========================================
   FILTER BAR
========================================= */

const FilterBar = ({
  value,
  onChange,
  projects,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-200">
          <Filter className="h-4 w-4 text-indigo-300" />
          Filter by project
        </div>

        <p className="mt-1 text-xs text-slate-500">
          Applies to your tasks and assigned or referred issues.
        </p>
      </div>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-indigo-400/40 sm:w-72"
      >
        <option value="All">
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
      type="button"
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