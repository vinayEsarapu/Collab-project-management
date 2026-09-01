import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProjectActivity, getProjectById } from "../services/projectservices";

function ProjectActivity() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [activities, setActivities] = useState([]);

  const [activityDate, setActivityDate] = useState("");
  const [activityPage, setActivityPage] = useState(1);

  const [activityPagination, setActivityPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [error, setError] = useState("");
  const [activityError, setActivityError] = useState("");

  const loadProject = async () => {
    try {
      const data = await getProjectById(id);
      setProject(data);
    } catch (error) {
      console.error("Failed to load project:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load project."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadActivity = async (
    page = 1,
    date = activityDate
  ) => {
    try {
      setIsLoadingActivity(true);
      setActivityError("");

      const data = await getProjectActivity(
        id,
        page,
        10,
        date
      );

      setActivities(data.activities || []);

      setActivityPagination(
        data.pagination || {
          page,
          limit: 10,
          total: 0,
          totalPages: 0,
        }
      );

      setActivityPage(page);
    } catch (error) {
      console.error(
        "Failed to load project activity:",
        error
      );

      setActivityError(
        error.response?.data?.message ||
          "Unable to load project activity."
      );
    } finally {
      setIsLoadingActivity(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    loadProject();
    loadActivity(1, "");
  }, [id]);

  const handleDateChange = (event) => {
    const value = event.target.value;

    setActivityDate(value);
    setActivityPage(1);

    loadActivity(1, value);
  };

  const handleClearFilter = () => {
    setActivityDate("");
    setActivityPage(1);

    loadActivity(1, "");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-5 w-40 rounded bg-white/10" />

          <div className="mt-8 h-10 w-2/3 rounded bg-white/10" />

          <div className="mt-4 h-5 w-full max-w-2xl rounded bg-white/5" />

          <div className="mt-8 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 rounded-2xl bg-white/5"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-8">
            <p className="text-lg font-semibold text-red-300">
              Unable to load project
            </p>

            <p className="mt-2 text-sm text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="mt-6 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(`/projects/${id}`)}
          className="mb-8 text-sm text-slate-400 transition-colors hover:text-white"
        >
          ← Back to Project
        </button>

        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                  📋
                </div>

                <p className="text-xs font-medium uppercase tracking-wider text-indigo-300">
                  Project Activity
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Activity & Logs
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  {project?.title
                    ? `History of changes and activity in ${project.title}.`
                    : "History of changes and activity in this project."}
                </p>
              </div>

              <span className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400">
                {activityPagination.total}{" "}
                {activityPagination.total === 1
                  ? "activity"
                  : "activities"}
              </span>
            </div>
          </div>
        </section>

        {/* Filter */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <label
                htmlFor="activityDate"
                className="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Filter by date
              </label>

              <input
                id="activityDate"
                type="date"
                value={activityDate}
                onChange={handleDateChange}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/50"
              />
            </div>

            {activityDate && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Clear Filter
              </button>
            )}
          </div>
        </section>

        {/* Error */}
        {activityError && (
          <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {activityError}
          </div>
        )}

        {/* Activity */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Activity History
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Recent actions performed in this project.
              </p>
            </div>
          </div>

          {isLoadingActivity ? (
            <div className="mt-6 space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]"
                />
              ))}
            </div>
          ) : activities.length > 0 ? (
            <>
              <div className="mt-6 space-y-3">
                {activities.map((activity) => (
                  <ActivityCard
                    key={activity._id}
                    activity={activity}
                  />
                ))}
              </div>

              {/* Pagination */}
              {activityPagination.totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Page {activityPagination.page} of{" "}
                    {activityPagination.totalPages}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        loadActivity(activityPage - 1)
                      }
                      disabled={
                        isLoadingActivity ||
                        activityPage <= 1
                      }
                      className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Previous
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        loadActivity(activityPage + 1)
                      }
                      disabled={
                        isLoadingActivity ||
                        activityPage >=
                          activityPagination.totalPages
                      }
                      className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-white/10 px-6 py-10 text-center">
              <div className="text-3xl">📝</div>

              <p className="mt-3 text-sm font-medium text-slate-300">
                No activity found
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {activityDate
                  ? "There is no activity for the selected date."
                  : "Project activity will appear here when changes are made."}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ActivityCard({ activity }) {
  const userName =
    activity.user?.name ||
    activity.user?.userCode ||
    "Unknown user";

  const userInitial =
    userName.charAt(0).toUpperCase();

  const createdAt = activity.createdAt
    ? new Date(activity.createdAt).toLocaleString()
    : "";

  return (
    <div className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/15 hover:bg-white/[0.04]">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300">
        {userInitial}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-200">
            {userName}
          </p>

          <span className="text-xs text-slate-500">
            {createdAt}
          </span>
        </div>

        <p className="mt-2 text-sm leading-5 text-slate-400">
          {activity.description}
        </p>
      </div>
    </div>
  );
}

export default ProjectActivity;