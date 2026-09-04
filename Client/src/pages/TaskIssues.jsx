import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import IssueCard from "../components/issues/IssueCard";
import IssueForm from "../components/issues/issueform";
import { useAuth } from "../context/Authcontext";
import {
  createIssue,
  getIssuesByTask,
} from "../services/issueservices";
import {
  getProjectById,
  getTaskById,
} from "../services/projectservices";

function TaskIssues() {
  const {
    id: projectId,
    taskId,
     issueId,
  } = useParams();

  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [task, setTask] = useState(null);
  const [issues, setIssues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState( issueId === "new");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const isProjectOwner =
    user?._id &&
    project?.owner?._id &&
    user._id.toString() ===
      project.owner._id.toString();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        projectData,
        taskData,
        issueData,
      ] = await Promise.all([
        getProjectById(projectId),
        getTaskById(projectId, taskId),
        getIssuesByTask(taskId),
      ]);

      setProject(projectData);
      setTask(taskData);
      setIssues(issueData.issues || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load task issues."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && taskId) {
      fetchData();
    }
  }, [projectId, taskId]);

  useEffect(() => {
  if (issueId === "new") {
    setShowForm(true);
  }
}, [issueId]);

  const handleCreateIssue = async (issueData) => {
    try {
      setError("");

      await createIssue({
  ...issueData,
  project: projectId,
  task: taskId,

  // Task issue defaults to task assignee.
  assignedTo:
    issueData.assignedTo ||
    task?.assignedTo?._id ||
    task?.assignedTo ||
    null,
});

      setShowForm(false);

      await fetchData();
    } catch (error) {
      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to create issue."
      );

      throw error;
    }
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        issue.title
          ?.toLowerCase()
          .includes(searchText) ||
        issue.description
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        issue.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        issue.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    issues,
    search,
    statusFilter,
    priorityFilter,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-6 w-40 rounded bg-white/10" />
          <div className="mt-4 h-10 w-72 rounded bg-white/10" />
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-48 rounded-2xl border border-white/10 bg-white/[0.03]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <Link
          to={`/projects/${projectId}/tasks/${taskId}`}
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to Task
        </Link>

        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-400">
              Task Issues
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              {task?.title || "Task Issues"}
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Issues belonging only to this task.
            </p>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setPriorityFilter("All");
            }}
            className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
          >
            Clear Filters
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold hover:bg-indigo-400"
          >
            + Create Issue
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_180px]">

            <input
              type="text"
              placeholder="Search task issues..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300 outline-none"
            >
              <option value="All">
                All Status
              </option>
              <option value="Open">Open</option>
              <option value="In Progress">
                In Progress
              </option>
              <option value="Resolved">
                Resolved
              </option>
              <option value="Closed">
                Closed
              </option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300 outline-none"
            >
              <option value="All">
                All Priority
              </option>
              <option value="Low">Low</option>
              <option value="Medium">
                Medium
              </option>
              <option value="High">High</option>
              <option value="Critical">
                Critical
              </option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6">
          <p className="text-sm text-slate-400">
            {filteredIssues.length}{" "}
            {filteredIssues.length === 1
              ? "issue"
              : "issues"}
          </p>
        </div>

        {!loading &&
          filteredIssues.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
              <h3 className="text-lg font-semibold">
                No issues found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                There are no issues for this task
                matching the current filters.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-5 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-400"
              >
                Create Issue
              </button>
            </div>
          )}

        {filteredIssues.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                projectId={projectId}
                taskId={taskId}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
       <IssueForm
  projectId={projectId}
  project={project}
  canAssign={isProjectOwner}
  members={project?.members || []}
  currentUserId={user?._id}
  onSubmit={handleCreateIssue}
  onClose={() => setShowForm(false)}
/>
      )}
    </div>
  );
}

export default TaskIssues;