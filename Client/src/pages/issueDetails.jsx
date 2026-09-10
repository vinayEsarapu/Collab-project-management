import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import api from "../services/api";
import IssueForm from "../components/issues/issueform";
import {
  updateIssue,
  deleteIssue,
  getTaskIssueById,
} from "../services/issueservices";
import { getProjectById } from "../services/projectservices";
import { createComment } from "../services/commentService";

function IssueDetails() {
  const {
    id: projectId,
    taskId,
    issueId,
  } = useParams();

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditForm, setShowEditForm] =
    useState(false);
  const [deleting, setDeleting] = useState(false);
  const [project, setProject] = useState(null);
  const [commentText, setCommentText] =
    useState("");
  const [postingComment, setPostingComment] =
    useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  /*
   * --------------------------------------------------
   * Navigation paths
   * --------------------------------------------------
   */

  const issueCommentsPath = taskId
    ? `/projects/${projectId}/tasks/${taskId}/issues/${issueId}/comments`
    : `/projects/${projectId}/issues/${issueId}/comments`;

  const issueActivityPath = taskId
    ? `/projects/${projectId}/tasks/${taskId}/issues/${issueId}/activity`
    : `/projects/${projectId}/issues/${issueId}/activity`;

  const backToIssuesPath = taskId
    ? `/projects/${projectId}/tasks/${taskId}/issues`
    : `/projects/${projectId}/issues`;

  /*
   * --------------------------------------------------
   * Contextual Back Navigation
   *
   * Profile -> Issue -> Back -> Profile
   *
   * Normal navigation keeps the original behavior:
   * Project Issue -> Project Issues
   * Task Issue -> Task Issues
   * --------------------------------------------------
   */

  const handleBack = () => {
    if (location.state?.from === "profile") {
      navigate("/profile");
      return;
    }

    navigate(issueActivityPath, {
  state: {
    from: "issue-details",
    issueDetailsPath: location.pathname,
    parentState: location.state,
  },
});
  };

  /*
   * --------------------------------------------------
   * Permissions
   * --------------------------------------------------
   */

  const isOwner =
    user?._id &&
    project?.owner?._id &&
    user._id.toString() ===
      project.owner._id.toString();

  const isCreator =
    user?._id &&
    issue?.createdBy?._id &&
    user._id.toString() ===
      issue.createdBy._id.toString();

  const isAssignee =
    user?._id &&
    issue?.assignedTo?._id &&
    user._id.toString() ===
      issue.assignedTo._id.toString();

  const canEdit = Boolean(
    isOwner ||
      isCreator ||
      isAssignee
  );

  /*
   * --------------------------------------------------
   * Fetch Project
   * --------------------------------------------------
   */

  const fetchProject = async () => {
    try {
      const data =
        await getProjectById(projectId);

      setProject(data);
    } catch (error) {
      console.error(
        "Failed to load project:",
        error
      );
    }
  };

  /*
   * --------------------------------------------------
   * Post Comment
   * --------------------------------------------------
   */

  const handlePostComment = async (event) => {
    event.preventDefault();

    const content = commentText.trim();

    if (!content) {
      return;
    }

    try {
      setPostingComment(true);
      setError("");

      await createComment(
        issueId,
        content,
        taskId || null
      );

      setCommentText("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to post comment."
      );
    } finally {
      setPostingComment(false);
    }
  };

  /*
   * --------------------------------------------------
   * Update Issue
   * --------------------------------------------------
   */

  const handleUpdateIssue = async (
    issueData
  ) => {
    try {
      let data;

      if (taskId) {
        const response = await api.put(
          `/issues/task/${taskId}/${issueId}`,
          issueData
        );

        data = response.data;
      } else {
        data = await updateIssue(
          issueId,
          issueData
        );
      }

      setIssue(data.issue || data);
      setShowEditForm(false);
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to update issue."
      );
    }
  };

  /*
   * --------------------------------------------------
   * Delete Issue
   * --------------------------------------------------
   */

  const handleDeleteIssue = async () => {
    try {
      setDeleting(true);
      setError("");

      if (taskId) {
        await api.delete(
          `/issues/task/${taskId}/${issueId}`
        );
      } else {
        await deleteIssue(issueId);
      }

      /*
       * If the issue was opened from Profile,
       * return to Profile after deletion.
       *
       * Otherwise preserve the existing behavior
       * and return to the appropriate issue list.
       */
      if (location.state?.from === "profile") {
        navigate("/profile");
        return;
      }

      navigate(backToIssuesPath);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete issue."
      );
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  /*
   * --------------------------------------------------
   * Fetch Issue
   * --------------------------------------------------
   */

  const fetchIssue = async () => {
    try {
      setLoading(true);
      setError("");

      let data;

      if (taskId) {
        data = await getTaskIssueById(
          taskId,
          issueId
        );
      } else {
        const response = await api.get(
          `/issues/${issueId}`
        );

        data = response.data;
      }

      setIssue(data.issue || data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load issue."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * --------------------------------------------------
   * Load Issue + Project
   * --------------------------------------------------
   */

  useEffect(() => {
    if (issueId) {
      fetchIssue();
    }

    if (projectId) {
      fetchProject();
    }
  }, [issueId, projectId]);

  /*
   * --------------------------------------------------
   * Status Styles
   * --------------------------------------------------
   */

  const getStatusStyle = (status) => {
    const styles = {
      Open:
        "border-blue-500/20 bg-blue-500/10 text-blue-300",

      "In Progress":
        "border-amber-500/20 bg-amber-500/10 text-amber-300",

      Resolved:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",

      Closed:
        "border-slate-500/20 bg-slate-500/10 text-slate-300",
    };

    return (
      styles[status] ||
      "border-white/10 bg-white/5 text-slate-300"
    );
  };

  /*
   * --------------------------------------------------
   * Priority Styles
   * --------------------------------------------------
   */

  const getPriorityStyle = (priority) => {
    const styles = {
      Low: "text-slate-400",
      Medium: "text-blue-300",
      High: "text-orange-300",
      Critical: "text-red-300",
    };

    return (
      styles[priority] ||
      "text-slate-300"
    );
  };

  /*
   * --------------------------------------------------
   * Loading State
   * --------------------------------------------------
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-6 w-32 rounded bg-white/10" />

          <div className="mt-6 h-12 w-3/4 rounded bg-white/10" />

          <div className="mt-4 h-32 rounded-2xl bg-white/10" />

          <div className="mt-4 h-40 rounded-2xl bg-white/10" />
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * Error State
   * --------------------------------------------------
   */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to Issues
          </button>

          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <h2 className="text-lg font-semibold text-red-300">
              Unable to load issue
            </h2>

            <p className="mt-2 text-sm text-red-200/70">
              {error}
            </p>

            <button
              onClick={fetchIssue}
              className="mt-5 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/30"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * Issue Not Found
   * --------------------------------------------------
   */

  if (!issue) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to Issues
          </button>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <h2 className="text-xl font-semibold">
              Issue not found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              The issue may have been deleted or
              does not exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------
   * Main UI
   * --------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Issues
        </button>

        {/* Header */}
        <div className="mt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
                Issue
              </p>

              <h1 className="mt-2 break-words text-2xl font-bold tracking-tight sm:text-4xl">
                {issue.title}
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusStyle(
                  issue.status
                )}`}
              >
                {issue.status}
              </span>

              <span
                className={`rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium ${getPriorityStyle(
                  issue.priority
                )}`}
              >
                ● {issue.priority} Priority
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">

          {/* Description */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Description
            </h2>

            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {issue.description ||
                "No description provided."}
            </div>
          </section>

          {/* Details */}
          <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Details
            </h2>

            <div className="mt-5 space-y-5">

              {/* Status */}
              <div>
                <p className="text-xs text-slate-500">
                  Status
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  {issue.status}
                </p>
              </div>

              {/* Priority */}
              <div>
                <p className="text-xs text-slate-500">
                  Priority
                </p>

                <p
                  className={`mt-1 text-sm font-medium ${getPriorityStyle(
                    issue.priority
                  )}`}
                >
                  {issue.priority}
                </p>
              </div>

              {/* Assigned To */}
              <div>
                <p className="text-xs text-slate-500">
                  Assigned To
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  {issue.assignedTo?.name ||
                    issue.assignedTo?.email ||
                    "Unassigned"}
                </p>
              </div>

              {/* Created By */}
              <div>
                <p className="text-xs text-slate-500">
                  Created By
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  {issue.createdBy?.name ||
                    "Unknown"}
                </p>
              </div>

              {/* Project */}
              <div>
                <p className="text-xs text-slate-500">
                  Project
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  {issue.project?.name ||
                    "Current Project"}
                </p>
              </div>

            </div>
          </aside>
        </div>

        {/* Labels */}
        {issue.labels?.length > 0 && (
          <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Labels
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {issue.labels.map(
                (label, index) => (
                  <span
                    key={`${label}-${index}`}
                    className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-medium text-indigo-300"
                  >
                    #{label}
                  </span>
                )
              )}
            </div>
          </section>
        )}

        {/* Comments */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Post Comments
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Add a comment to this issue.
            </p>
          </div>

          <form
            onSubmit={handlePostComment}
            className="mt-5"
          >
            <textarea
              value={commentText}
              onChange={(e) =>
                setCommentText(
                  e.target.value
                )
              }
              placeholder="Write a comment..."
              rows={4}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-white/20"
            />

            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={
                  postingComment ||
                  !commentText.trim()
                }
                className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {postingComment
                  ? "Posting..."
                  : "Post Comment"}
              </button>
            </div>
          </form>
        </section>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          {/* View Comments */}
         <Link
  to={issueCommentsPath}
  state={
    location.state?.from === "profile"
      ? {
          from: "profile",
        }
      : undefined
  }
  className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-5 py-3 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/20 hover:text-indigo-200"
>
  View Comments
</Link>

          {/* View Activity */}
          <Link
            to={issueActivityPath}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            View Activity
          </Link>

          {/* Delete */}
          {isOwner && (
            <button
              onClick={() =>
                setShowDeleteConfirm(true)
              }
              disabled={deleting}
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting
                ? "Deleting..."
                : "Delete Issue"}
            </button>
          )}

          {/* Edit */}
          {canEdit && (
            <button
              onClick={() =>
                setShowEditForm(true)
              }
              className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Edit Issue
            </button>
          )}
        </div>
      </div>

      {/* Edit Issue Form */}
      {showEditForm && (
        <IssueForm
          project={project}
          projectId={projectId}
          taskId={taskId}
          issue={issue}
          canAssign={
            taskId ? false : isOwner
          }
          members={
            taskId
              ? []
              : project?.members || []
          }
          onSubmit={handleUpdateIssue}
          onClose={() =>
            setShowEditForm(false)
          }
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl">

            <h2 className="text-lg font-semibold text-white">
              Delete Issue?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Are you sure you want to delete this
              issue? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(false)
                }
                disabled={deleting}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteIssue}
                disabled={deleting}
                className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Issue"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IssueDetails;