import { useEffect, useMemo, useState } from "react";
import IssueCard from "../components/issues/IssueCard";
import { useAuth } from "../context/Authcontext";
import IssueForm from "../components/issues/issueform";
import {
  createIssue,
  getIssuesByProject,
} from "../services/issueservices";
import { Link, useParams } from "react-router-dom";
import { getProjectById } from "../services/projectservices";
//import projectService from "../services/projectservices";

function Issues() {
  const { id: projectId } = useParams();
  const [issues, setIssues] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

//   const getProjectById = async (projectId) => {
//   const response = await api.get(`/projects/${projectId}`);

//   return response.data.project;
// };
  const isProjectOwner =
  user?._id &&
  project?.owner?._id &&
  user._id.toString() === project.owner._id.toString();

  const fetchProject = async () => {
  try {
    const data = await getProjectById(projectId);

    setProject(data);
  } catch (error) {
    console.error("Failed to load project:", error);
  }
};

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getIssuesByProject(projectId);

      setIssues(data.issues || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load issues."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchIssues();
    }
  }, [projectId]);

  const handleCreateIssue = async (issueData) => {
  try {
    setError("");

    await createIssue(issueData);

    setShowForm(false);

    await fetchIssues();
  } catch (error) {
    setError(
        error.response?.data?.error ||
      error.response?.data?.message ||
      "Failed to create issue. Please try again."
    );

    throw error;
  }
};

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        issue.title
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        issue.description
          ?.toLowerCase()
          .includes(search.toLowerCase());

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
  }, [issues, search, statusFilter, priorityFilter]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>

            <Link
              to={`/projects/${projectId}`}
             className="mb-6 inline-flex items-center text-sm text-slate-400 transition hover:text-white"
            >
            ← Back to Current Project
           </Link>

            <p className="text-sm font-medium text-indigo-400">
              Project Issues
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Issues
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Track bugs, tasks and problems across your project.
            </p>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setPriorityFilter("All");
           }}
           className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
          Clear
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20"
          >
            <span className="text-lg transition-transform duration-200 group-hover:rotate-90">
              +
            </span>
            Create Issue
          </button>
        </div>

        {/* Filters */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_180px]">

            <div className="relative">
              <input
                type="text"
                placeholder="Search issues..."
                value={search}
                onChange={(event) =>setSearch(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300 outline-none focus:border-indigo-400/50"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">  In Progress </option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>setPriorityFilter(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-300 outline-none focus:border-indigo-400/50"
            >
              <option value="All">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Issue count */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {filteredIssues.length}{" "}
            {filteredIssues.length === 1
              ? "issue"
              : "issues"}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filteredIssues.length === 0 && (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
              ◇
            </div>

            <h3 className="mt-4 text-lg font-semibold text-white">
              No issues found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {search ||
              statusFilter !== "All" ||
              priorityFilter !== "All"
                ? "Try changing your search or filters."
                : "Create your first issue to start tracking project work."}
            </p>

            {!search &&
              statusFilter === "All" &&
              priorityFilter === "All" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-5 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold transition hover:bg-indigo-400"
                >
                  Create your first issue
                </button>
              )}
          </div>
        )}

        {/* Issue list */}
        {!loading && filteredIssues.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                projectId={projectId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <IssueForm
          projectId={projectId}
           project={project}
            canAssign={isProjectOwner}
          //issue={issue}
          members={project?.members || []}
          onSubmit={handleCreateIssue}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default Issues;