import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getIssueActivities } from "../services/activityService";

function Activity() {
  const { id: projectId, issueId } = useParams();

  const [activities, setActivities] = useState([]);
  const [issue, setIssue] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalActivities: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getIssueActivities(
        issueId,
        page,
        10,
        selectedDate
      );

      setActivities(data.activities || []);
      setPagination(
        data.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalActivities: 0,
          limit: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );

      if (data.activities?.[0]?.issue) {
        setIssue(data.activities[0].issue);
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load activity."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (issueId) {
      fetchActivities();
    }
  }, [issueId, page, selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setPage(1);
  };

  const clearDateFilter = () => {
    setSelectedDate("");
    setPage(1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatAction = (activity) => {
    const details = activity.details || {};

    switch (activity.action) {
      case "ISSUE_CREATED":
        return "created this issue";

      case "ISSUE_UPDATED":
        return "updated this issue";

      case "ISSUE_ASSIGNED":
        return "assigned this issue";

      case "ISSUE_REASSIGNED":
        return "reassigned this issue";

      case "ISSUE_UNASSIGNED":
        return "removed the issue assignment";

      case "STATUS_CHANGED":
        return `changed status from ${
          details.from || "Unknown"
        } to ${details.to || "Unknown"}`;

      case "PRIORITY_CHANGED":
        return `changed priority from ${
          details.from || "Unknown"
        } to ${details.to || "Unknown"}`;

      default:
        return "updated this issue";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        <Link
          to={`/projects/${projectId}/issues/${issueId}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Issue
        </Link>

        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wider text-indigo-400">
            Issue Activity
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
            Activity / Audit Log
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Track important changes made to this issue.
          </p>
        </div>

        {/* Date filter */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">

            <div className="flex-1">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Filter by date
              </label>

              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50"
              />
            </div>

            {selectedDate && (
              <button
                type="button"
                onClick={clearDateFilter}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Summary */}
        {!loading && !error && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-400">
              {pagination.totalActivities}{" "}
              {pagination.totalActivities === 1
                ? "activity"
                : "activities"}
            </p>

            {selectedDate && (
              <p className="text-xs text-indigo-400">
                Showing activities for {selectedDate}
              </p>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-5 space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          activities.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
              <h3 className="text-lg font-semibold">
                No activity found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {selectedDate
                  ? "There are no activities for the selected date."
                  : "No activity has been recorded for this issue yet."}
              </p>
            </div>
          )}

        {/* Activity list */}
        {!loading &&
          !error &&
          activities.length > 0 && (
            <div className="mt-5 space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity._id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
                >
                  <div className="flex gap-4">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs font-semibold text-indigo-300">
                      {activity.user?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-300">
                          <span className="font-semibold text-white">
                            {activity.user?.name ||
                              "Unknown User"}
                          </span>{" "}
                          {formatAction(activity)}
                        </p>

                        <p className="shrink-0 text-xs text-slate-600">
                          {formatDate(
                            activity.createdAt
                          )}
                        </p>
                      </div>
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
      </div>
    </div>
  );
}

export default Activity;