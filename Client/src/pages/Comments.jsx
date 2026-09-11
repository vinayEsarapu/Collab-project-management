import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useParams,
} from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../services/commentService";
import DatePicker from "../components/DatePicker";
import ConfirmationDialog from "../components/ConfirmationDialog";
//import { getProjectById } from "../services/projectservices";

function Comments() {
  const {
    id: projectId,
    taskId,
    issueId,
  } = useParams();

  const location = useLocation();
  const { user } = useAuth();

  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Commenter filter
  // --------------------------------------------------



  // --------------------------------------------------
  // Date filter
  // --------------------------------------------------

  const [selectedDate, setSelectedDate] =
    useState("");

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalComments: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // --------------------------------------------------
  // New comment
  // --------------------------------------------------

  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] =
    useState(false);

  // --------------------------------------------------
  // Edit comment
  // --------------------------------------------------

  const [editingCommentId, setEditingCommentId] =
    useState(null);

  const [editingCommentText, setEditingCommentText] =
    useState("");

  const [commentUpdating, setCommentUpdating] =
    useState(false);

  // --------------------------------------------------
  // Delete comment
  // --------------------------------------------------

  const [commentDeletingId, setCommentDeletingId] =
    useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] =
  useState(false);

const [selectedCommentId, setSelectedCommentId] =
  useState(null);

  // --------------------------------------------------
  // Navigation state
  // --------------------------------------------------

  const cameFromProfile =
    location.state?.from === "profile";

  /*
   * Preserve profile context when moving back.
   */
  const parentNavigationState = cameFromProfile
    ? {
        from: "profile",
      }
    : undefined;

  // --------------------------------------------------
  // Back navigation
  // --------------------------------------------------

  const getBackPath = () => {
    /*
     * Profile → ... → Comments
     */
    if (cameFromProfile) {
      return "/profile";
    }

    /*
     * Task-level issue comments
     *
     * Task Issues → Issue Details → Comments
     */
    if (taskId && issueId) {
      return `/projects/${projectId}/tasks/${taskId}/issues/${issueId}`;
    }

    /*
     * Task-level comments
     *
     * Task → Comments
     */
    if (taskId) {
      return `/projects/${projectId}/tasks/${taskId}`;
    }

    /*
     * Project-level issue comments
     *
     * Issue Details → Comments
     */
    return `/projects/${projectId}/issues/${issueId}`;
  };

  // --------------------------------------------------
  // Check whether current user owns the comment
  // --------------------------------------------------

  const isCommentAuthor = (comment) => {
    return (
      user?._id &&
      comment?.createdBy?._id &&
      user._id.toString() ===
        comment.createdBy._id.toString()
    );
  };

  // --------------------------------------------------
  // Format date
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Fetch commenters
  // --------------------------------------------------

  

  // --------------------------------------------------
  // Fetch comments
  // --------------------------------------------------

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getComments(
        issueId,
        page,
        10,
        taskId,
        selectedDate
      );

      setComments(data.comments || []);

      setPagination(
        data.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalComments: 0,
          limit: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load comments."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Effects
  // --------------------------------------------------

 

  useEffect(() => {
    if (taskId || issueId) {
      fetchComments();
    }
  }, [
    taskId,
    issueId,
    page,
    selectedDate,
  ]);

  // --------------------------------------------------
  // Date filter
  // --------------------------------------------------

 const handleDateChange = (date) => {
  setSelectedDate(date);
  setPage(1);
};

  const clearDateFilter = () => {
    setSelectedDate("");
    setPage(1);
  };

  // --------------------------------------------------
  // Commenter filter
  // --------------------------------------------------


  // --------------------------------------------------
  // Add comment
  // --------------------------------------------------

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    try {
      setCommentSubmitting(true);
      setError("");

      await createComment(
        issueId,
        commentText,
        taskId
      );

      setCommentText("");

      await fetchComments();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to add comment."
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Edit comment
  // --------------------------------------------------

  const handleEditComment = async (commentId) => {
    if (!editingCommentText.trim()) {
      return;
    }

    try {
      setCommentUpdating(true);
      setError("");

      await updateComment(
        commentId,
        editingCommentText
      );

      setEditingCommentId(null);
      setEditingCommentText("");

      await fetchComments();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update comment."
      );
    } finally {
      setCommentUpdating(false);
    }
  };

  // --------------------------------------------------
  // Delete comment
  // --------------------------------------------------

  const openDeleteConfirmation = (commentId) => {
  setSelectedCommentId(commentId);
  setShowDeleteConfirm(true);
};

const closeDeleteConfirmation = () => {
  if (commentDeletingId) {
    return;
  }

  setShowDeleteConfirm(false);
  setSelectedCommentId(null);
};

const handleDeleteComment = async () => {
  if (!selectedCommentId) {
    return;
  }

  try {
    setCommentDeletingId(selectedCommentId);
    setError("");

    await deleteComment(selectedCommentId);

    setShowDeleteConfirm(false);
    setSelectedCommentId(null);

    await fetchComments();
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Failed to delete comment."
    );
  } finally {
    setCommentDeletingId(null);
  }
};
  // --------------------------------------------------
  // Loading screen
  // --------------------------------------------------

  if (loading && comments.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="h-5 w-32 animate-pulse rounded bg-white/10" />

          <div className="mt-6 h-10 w-2/3 animate-pulse rounded bg-white/10" />

          <div className="mt-8 h-24 animate-pulse rounded-2xl bg-white/5" />

          <div className="mt-5 space-y-3">
            <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
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
          to={getBackPath()}
          state={
            cameFromProfile
              ? parentNavigationState
              : undefined
          }
          className="inline-flex items-center text-sm font-medium text-slate-400 transition hover:text-white"
        >
          ← Back
        </Link>

        {/* Header */}

        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
            {taskId && issueId
              ? "Task Issue Comments"
              : taskId
              ? "Task Comments"
              : "Issue Comments"}
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
            Comments
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {taskId && issueId
              ? "View and discuss comments related to this task issue."
              : taskId
              ? "View and discuss comments related to this task."
              : "View and discuss comments related to this issue."}
          </p>
        </div>

       

  {/* Calendar date filter */}

  {/* =================================================
    DATE FILTER
    ================================================= */}

<section className="relative z-[1000] mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">

  <div className="max-w-sm">

    <label
      htmlFor="comment-date-filter"
      className="text-xs font-medium uppercase tracking-wide text-slate-500"
    >
      Filter by date
    </label>

    <div id="comment-date-filter" className="mt-2">
      <DatePicker
        value={selectedDate}
        onChange={handleDateChange}
        onClear={clearDateFilter}
      />
    </div>

  </div>

</section>

  {/* Clear date filter */}

 

        {/* Error */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Summary */}

        {!error && (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-slate-400">
              {pagination.totalComments}{" "}
              {pagination.totalComments === 1
                ? "comment"
                : "comments"}
            </p>

            <div className="flex flex-col gap-1 sm:items-end">


              {selectedDate && (
                <p className="text-xs text-indigo-400">
                  Showing comments from{" "}
                  {selectedDate}
                </p>
              )}

            </div>
          </div>
        )}

        {/* Empty comments */}

        {!loading &&
          !error &&
          comments.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">

              <h3 className="text-lg font-semibold">
                No comments found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
               {selectedDate
  ? `No comments found on ${selectedDate}.`
  : "No comments have been added yet."}
              </p>

              {selectedDate && (
                <button
                  type="button"
                 onClick={clearDateFilter}
                  className="mt-5 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Clear Date
                </button>
              )}

            </div>
          )}

        {/* Comment list */}

        {!error && comments.length > 0 && (
          <div className="mt-5 space-y-4">

            {comments.map((comment) => (
              <div
                key={comment._id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
              >
                <div className="flex gap-4">

                  {/* Avatar */}

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs font-semibold text-indigo-300">
                    {comment.createdBy?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>

                  {/* Content */}

                  <div className="min-w-0 flex-1">

                    {/* Header */}

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                      <p className="text-sm text-slate-300">
                        <span className="font-semibold text-white">
                          {comment.createdBy?.name ||
                            "Unknown User"}
                        </span>{" "}
                        commented
                      </p>

                      <p className="shrink-0 text-xs text-slate-600">
                        {formatTimeAgo(
                          comment.createdAt
                        )}
                      </p>

                    </div>

                    {/* Edit mode */}

                    {editingCommentId ===
                    comment._id ? (
                      <div className="mt-3">

                        <textarea
                          value={
                            editingCommentText
                          }
                          onChange={(event) =>
                            setEditingCommentText(
                              event.target.value
                            )
                          }
                          rows={4}
                          maxLength={1000}
                          className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
                        />

                        <div className="mt-2 flex flex-wrap gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEditComment(
                                comment._id
                              )
                            }
                            disabled={
                              commentUpdating ||
                              !editingCommentText.trim()
                            }
                            className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {commentUpdating
                              ? "Saving..."
                              : "Save"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(
                                null
                              );
                              setEditingCommentText(
                                ""
                              );
                            }}
                            disabled={
                              commentUpdating
                            }
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                          >
                            Cancel
                          </button>

                        </div>
                      </div>
                    ) : (
                      <>

                        {/* Comment text */}

                        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                            {comment.content}
                          </p>
                        </div>

                        {/* Actions */}

                        {isCommentAuthor(
                          comment
                        ) && (
                          <div className="mt-2 flex flex-wrap gap-3">

                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommentId(
                                  comment._id
                                );
                                setEditingCommentText(
                                  comment.content
                                );
                              }}
                              className="text-xs font-medium text-slate-500 transition hover:text-indigo-300"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
  openDeleteConfirmation(comment._id)
}
                              disabled={
                                commentDeletingId ===
                                comment._id
                              }
                              className="text-xs font-medium text-slate-500 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {commentDeletingId ===
                              comment._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>
                        )}

                      </>
                    )}

                  </div>
                </div>
              </div>
            ))}

          </div>
        )}

        {/* Pagination */}

        {!loading &&
          !error &&
          pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs text-slate-500">
                Page {pagination.currentPage} of{" "}
                {pagination.totalPages}
              </p>

              <div className="flex gap-2">

                <button
                  type="button"
                  disabled={
                    !pagination.hasPreviousPage
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.max(current - 1, 1)
                    )
                  }
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  disabled={
                    !pagination.hasNextPage
                  }
                  onClick={() =>
                    setPage(
                      (current) => current + 1
                    )
                  }
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>

              </div>
            </div>
          )}

        {/* Add comment */}

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:p-6">

          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Add a comment
          </h2>

          <form
            onSubmit={handleAddComment}
            className="mt-4"
          >

            <textarea
              value={commentText}
              onChange={(event) =>
                setCommentText(
                  event.target.value
                )
              }
              placeholder="Write your comment..."
              rows={4}
              maxLength={1000}
              className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
            />

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs text-slate-600">
                {commentText.length}/1000
                characters
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

      </div>
      <ConfirmationDialog
  isOpen={showDeleteConfirm}
  title="Delete comment"
  message="Are you sure you want to delete this comment?"
  onCancel={closeDeleteConfirmation}
  onConfirm={handleDeleteComment}
  loading={Boolean(commentDeletingId)}
  confirmText="Delete"
  cancelText="Cancel"
/>
    </div>
  );
}

export default Comments;