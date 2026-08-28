import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import IssueForm from "../components/issues/issueform";
import {
  updateIssue,
  deleteIssue,
} from "../services/issueservices";
import {
  getComments,
  createComment,
} from "../services/commentService";
//import projectService from "../services/projectservices";
import {getProjectById} from "../services/projectservices";


function IssueDetails() {
  const { id: projectId, issueId } = useParams();

  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");

  const formatTimeAgo = (date) => {
  const now = new Date();
  const created = new Date(date);

  const seconds = Math.floor(
    (now - created) / 1000
  );

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} ${
      minutes === 1 ? "minute" : "minutes"
    } ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ${
      hours === 1 ? "hour" : "hours"
    } ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} ${
      days === 1 ? "day" : "days"
    } ago`;
  }

  return created.toLocaleDateString();
};

  const fetchProject = async () => {
  try {
    const data = await getProjectById(projectId);

    setProject(data);
  } catch (error) {
    console.error("Failed to load project:", error);
  }
};

  const handleUpdateIssue = async (issueData) => {
  try {
    const data = await updateIssue(
      issueId,
      issueData
    );

    setIssue(data.issue || data);

    setShowEditForm(false);
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to update issue."
    );
  }
};

const handleDeleteIssue = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this issue?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeleting(true);
    setError("");

    await deleteIssue(issueId);

    navigate(`/projects/${projectId}/issues`);
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Failed to delete issue."
    );
  } finally {
    setDeleting(false);
  }
};

  const fetchIssue = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/issues/${issueId}`);

      setIssue(response.data.issue || response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load issue."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
  try {
    setCommentsLoading(true);
    setCommentError("");

    const data = await getComments(issueId);

    setComments(data.comments || []);
  } catch (error) {
    setCommentError(
      error.response?.data?.message ||
        "Failed to load comments."
    );
  } finally {
    setCommentsLoading(false);
  }
};

const handleAddComment = async (event) => {
  event.preventDefault();

  if (!commentText.trim()) {
    return;
  }

  try {
    setCommentSubmitting(true);
    setCommentError("");

    const data = await createComment(
      issueId,
      commentText
    );

    setComments((currentComments) => [
      ...currentComments,
      data.comment,
    ]);

    setCommentText("");
  } catch (error) {
    setCommentError(
      error.response?.data?.message ||
        "Failed to add comment."
    );
  } finally {
    setCommentSubmitting(false);
  }
};

  useEffect(() => {
  if (issueId) {
    fetchIssue();
    fetchComments();
  }

  if (projectId) {
    fetchProject();
  }
}, [issueId, projectId]);

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

  const getPriorityStyle = (priority) => {
    const styles = {
      Low: "text-slate-400",
      Medium: "text-blue-300",
      High: "text-orange-300",
      Critical: "text-red-300",
    };

    return styles[priority] || "text-slate-300";
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <Link
            to={`/projects/${projectId}/issues`}
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to Issues
          </Link>

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

  if (!issue) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <Link
            to={`/projects/${projectId}/issues`}
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to Issues
          </Link>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <h2 className="text-xl font-semibold">
              Issue not found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              The issue may have been deleted or does not exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link
          to={`/projects/${projectId}/issues`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Issues
        </Link>

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

              <p className="mt-2 text-sm text-slate-500">
                #{issue._id}
              </p>
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

        {/* Main content */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">

          {/* Description */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Description
            </h2>

            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {issue.description || "No description provided."}
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

              {/* Assignee */}
              <div>
                <p className="text-xs text-slate-500">
                  Assigned To
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  {issue.assignedTo?.name ||
                    "Unassigned"}
                </p>

                {issue.assignedTo?.email && (
                  <p className="mt-1 text-xs text-slate-500">
                    {issue.assignedTo.email}
                  </p>
                )}
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
              {issue.labels.map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-medium text-indigo-300"
                >
                  #{label}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Comments */}
<section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:p-6">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Activity
      </h2>

      <p className="mt-1 text-xs text-slate-500">
         Comments and activity on this issue.
      </p>
    </div>

    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
      {comments.length}
    </span>
  </div>

  {/* Comment list */}
  <div className="mt-5 space-y-4">
    {commentsLoading ? (
      <div className="space-y-3">
        <div className="h-16 animate-pulse rounded-xl bg-white/5" />
        <div className="h-16 animate-pulse rounded-xl bg-white/5" />
      </div>
    ) : comments.length === 0 ? (
      <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
        <p className="text-sm text-slate-500">
           No activity yet.
        </p>

        <p className="mt-1 text-xs text-slate-600">
           Add a comment to start the discussion.
        </p>
      </div>
    ) : (
      comments.map((comment) => (
  <div
    key={comment._id}
    className="relative flex gap-4"
  >
    {/* Timeline line */}
    <div className="absolute left-4 top-9 bottom-[-16px] w-px bg-white/10 last:hidden" />

    {/* Activity icon */}
    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs font-semibold text-indigo-300">
      {comment.createdBy?.name
        ?.charAt(0)
        ?.toUpperCase() || "U"}
    </div>

    {/* Activity content */}
    <div className="min-w-0 flex-1 pb-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-white">
            {comment.createdBy?.name || "Unknown User"}
          </span>{" "}
          commented
        </p>

        <p className="text-xs text-slate-600">
          {formatTimeAgo(comment.createdAt)}
        </p>
      </div>

      <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
          {comment.content}
        </p>
      </div>
    </div>
  </div>
))
)}
  </div>

  {/* Error */}
  {commentError && (
    <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {commentError}
    </div>
  )}

  {/* Add comment */}
  <form
    onSubmit={handleAddComment}
    className="mt-5"
  >
    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
      Add a comment
    </label>

    <textarea
      value={commentText}
      onChange={(event) =>
        setCommentText(event.target.value)
      }
      placeholder="Write your comment..."
      rows={3}
      maxLength={1000}
      className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
    />

    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-600">
        {commentText.length}/1000 characters
      </p>

      <button
        type="submit"
        disabled={
          commentSubmitting ||
          !commentText.trim()
        }
        className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {commentSubmitting
          ? "Posting..."
          : "Post Comment"}
      </button>
    </div>
  </form>
</section>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={() =>
              navigate(`/projects/${projectId}/issues`)
            }
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Back to Issues
          </button>

          <button
            onClick={handleDeleteIssue}
            disabled={deleting}
            className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {deleting ? "Deleting..." : "Delete Issue"}
          </button>

          <button
           onClick={() => setShowEditForm(true)}
           className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
           Edit Issue
          </button>
        </div>
      </div>
      {showEditForm && (
       <IssueForm
        projectId={projectId}
        issue={issue}
        members={project?.members || []}
        onSubmit={handleUpdateIssue}
        onClose={() => setShowEditForm(false)}
      />
)}
</div>
  );
}

export default IssueDetails;