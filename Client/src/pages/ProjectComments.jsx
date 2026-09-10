import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import {
  getProjectComments,
  getProjectById,
  createProjectComment,
  updateProjectComment,
  deleteProjectComment,
} from "../services/projectservices";

function ProjectComments() {
  const { id: projectId } = useParams();
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  // -----------------------------------------
  // FILTERS
  // -----------------------------------------

  const [commenterId, setCommenterId] = useState("");
  const [commenterName, setCommenterName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [commenters, setCommenters] = useState([]);
  const [commentersLoading, setCommentersLoading] =
    useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalComments: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // -----------------------------------------
  // COMMENT FORM
  // -----------------------------------------

  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] =
    useState(false);

  // -----------------------------------------
  // EDIT COMMENT
  // -----------------------------------------

  const [editingCommentId, setEditingCommentId] =
    useState(null);

  const [editingCommentText, setEditingCommentText] =
    useState("");

  const [commentUpdating, setCommentUpdating] =
    useState(false);

  // -----------------------------------------
  // DELETE COMMENT
  // -----------------------------------------

  const [commentDeletingId, setCommentDeletingId] =
    useState(null);

  // -----------------------------------------
  // CHECK COMMENT AUTHOR
  // -----------------------------------------

  const isCommentAuthor = (comment) => {
    return (
      user?._id &&
      comment?.createdBy?._id &&
      user._id.toString() ===
        comment.createdBy._id.toString()
    );
  };

  // -----------------------------------------
  // FORMAT TIME AGO
  // -----------------------------------------

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

  // -----------------------------------------
  // FETCH COMMENTERS
  // -----------------------------------------

  const fetchCommenters = async () => {
    if (!projectId) {
      return;
    }

    try {
      setCommentersLoading(true);

      const project =
        await getProjectById(projectId);

      const users = [];

      if (project?.owner?._id) {
        users.push(project.owner);
      }

      if (Array.isArray(project?.members)) {
        users.push(...project.members);
      }

      const uniqueUsers = Array.from(
        new Map(
          users.map((member) => [
            member._id.toString(),
            member,
          ])
        ).values()
      );

      uniqueUsers.sort((a, b) =>
        (a.name || "").localeCompare(
          b.name || ""
        )
      );

      setCommenters(uniqueUsers);
    } catch (error) {
      console.error(
        "Failed to load project commenters:",
        error
      );
    } finally {
      setCommentersLoading(false);
    }
  };

  // -----------------------------------------
  // FETCH COMMENTS
  // -----------------------------------------

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProjectComments(
        projectId,
        page,
        10,
        commenterId,
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
      console.error(
        "Failed to load project comments:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load project comments."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // LOAD COMMENTERS
  // -----------------------------------------

  useEffect(() => {
    if (projectId) {
      fetchCommenters();
    }
  }, [projectId]);

  // -----------------------------------------
  // LOAD COMMENTS
  // -----------------------------------------

  useEffect(() => {
    if (projectId) {
      fetchComments();
    }
  }, [
    projectId,
    page,
    commenterId,
    selectedDate,
  ]);

  // -----------------------------------------
  // ADD COMMENT
  // -----------------------------------------

  const handleAddComment = async (event) => {
    event.preventDefault();

    const comment = commentText.trim();

    if (!comment) {
      return;
    }

    try {
      setCommentSubmitting(true);
      setError("");

      await createProjectComment(
        projectId,
        comment
      );

      setCommentText("");

      // Return to first page so the newest
      // comment is visible.
      setPage(1);

      // If already on page 1, explicitly reload.
      if (page === 1) {
        await fetchComments();
      }
    } catch (error) {
      console.error(
        "Failed to add project comment:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to add comment."
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  // -----------------------------------------
  // EDIT COMMENT
  // -----------------------------------------

  const handleEditComment = async (
    commentId
  ) => {
    const comment =
      editingCommentText.trim();

    if (!comment) {
      return;
    }

    try {
      setCommentUpdating(true);
      setError("");

      await updateProjectComment(
        projectId,
        commentId,
        comment
      );

      setEditingCommentId(null);
      setEditingCommentText("");

      await fetchComments();
    } catch (error) {
      console.error(
        "Failed to update project comment:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update comment."
      );
    } finally {
      setCommentUpdating(false);
    }
  };

  // -----------------------------------------
  // DELETE COMMENT
  // -----------------------------------------

  const handleDeleteComment = async (
    commentId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCommentDeletingId(commentId);
      setError("");

      await deleteProjectComment(
        projectId,
        commentId
      );

      await fetchComments();
    } catch (error) {
      console.error(
        "Failed to delete project comment:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete comment."
      );
    } finally {
      setCommentDeletingId(null);
    }
  };

  // -----------------------------------------
  // CLEAR DATE FILTER
  // -----------------------------------------

  const handleClearDate = () => {
    setSelectedDate("");
    setPage(1);
  };

  // -----------------------------------------
  // CLEAR ALL FILTERS
  // -----------------------------------------

  const handleClearAllFilters = () => {
    setCommenterId("");
    setCommenterName("");
    setSelectedDate("");
    setPage(1);
  };

  // -----------------------------------------
  // LOADING SCREEN
  // -----------------------------------------

  if (
    loading &&
    comments.length === 0
  ) {
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

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <Link
          to={`/projects/${projectId}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Project
        </Link>

        {/* Header */}
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
            Project Comments
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
            Comments
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            View and discuss comments with your
            project team.
          </p>
        </div>

        {/* -----------------------------------
            FILTERS
        ----------------------------------- */}

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
          <div className="grid gap-4 sm:grid-cols-2">

            {/* Commenter Filter */}
            <div>
              <label
                htmlFor="project-commenter-filter"
                className="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Filter by commenter
              </label>

              <select
                id="project-commenter-filter"
                value={commenterId}
                onChange={(event) => {
                  const selectedId =
                    event.target.value;

                  setCommenterId(selectedId);

                  const selectedUser =
                    commenters.find(
                      (member) =>
                        member._id?.toString() ===
                        selectedId
                    );

                  setCommenterName(
                    selectedUser?.name || ""
                  );

                  setPage(1);
                }}
                disabled={commentersLoading}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {commentersLoading
                    ? "Loading commenters..."
                    : "All commenters"}
                </option>

                {commenters.map((member) => (
                  <option
                    key={member._id}
                    value={member._id}
                  >
                    {member.name ||
                      "Unknown User"}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label
                htmlFor="project-comment-date-filter"
                className="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Filter by date
              </label>

              <input
                id="project-comment-date-filter"
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  setSelectedDate(
                    event.target.value
                  );
                  setPage(1);
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
          </div>

          {/* Filter Actions */}
          {(commenterId || selectedDate) && (
            <div className="mt-4 flex flex-wrap gap-2">

              {commenterId && (
                <button
                  type="button"
                  onClick={() => {
                    setCommenterId("");
                    setCommenterName("");
                    setPage(1);
                  }}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Clear commenter
                </button>
              )}

              {selectedDate && (
                <button
                  type="button"
                  onClick={handleClearDate}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Clear date
                </button>
              )}

              {commenterId &&
                selectedDate && (
                  <button
                    type="button"
                    onClick={
                      handleClearAllFilters
                    }
                    className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/20 hover:text-indigo-200"
                  >
                    Clear all filters
                  </button>
                )}
            </div>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Summary */}
        {!error && (
          <div className="mt-6">
            <p className="text-sm text-slate-400">
              {pagination.totalComments}{" "}
              {pagination.totalComments === 1
                ? "comment"
                : "comments"}

              {commenterName && (
                <>
                  {" "}
                  by{" "}
                  <span className="text-slate-300">
                    {commenterName}
                  </span>
                </>
              )}

              {selectedDate && (
                <>
                  {" "}
                  on{" "}
                  <span className="text-slate-300">
                    {new Date(
                      `${selectedDate}T00:00:00`
                    ).toLocaleDateString()}
                  </span>
                </>
              )}
            </p>
          </div>
        )}

        {/* No comments */}
        {!loading &&
          !error &&
          comments.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
              <h3 className="text-lg font-semibold">
                No comments found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {selectedDate
                  ? "There are no comments for the selected date."
                  : "Be the first person to comment on this project."}
              </p>
            </div>
          )}

        {/* Comments */}
        {!error &&
          comments.length > 0 && (
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

                    <div className="min-w-0 flex-1">

                      {/* Header */}
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-300">
                          <span className="font-semibold text-white">
                            {comment.createdBy
                              ?.name ||
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

                      {/* Edit */}
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
                            className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
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
                              className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
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
                              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Comment */}
                          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                              {comment.content}
                            </p>
                          </div>

                          {/* Author Controls */}
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
                                className="text-xs font-medium text-slate-500 hover:text-indigo-300"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteComment(
                                    comment._id
                                  )
                                }
                                disabled={
                                  commentDeletingId ===
                                  comment._id
                                }
                                className="text-xs font-medium text-slate-500 hover:text-red-300 disabled:opacity-50"
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
                Page{" "}
                {pagination.currentPage} of{" "}
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
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-40"
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
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

        {/* Post Comment */}
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
                setCommentText(event.target.value)
              }
              placeholder="Write a comment about this project..."
              rows={4}
              maxLength={1000}
              className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500/50"
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
                className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {commentSubmitting
                  ? "Posting..."
                  : "Post Comment"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ProjectComments;