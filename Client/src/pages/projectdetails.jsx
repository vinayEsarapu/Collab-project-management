import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import projectService from "../services/projectService";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await projectService.getProjectById(id);

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

    loadProject();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-5 w-32 rounded bg-white/10" />

          <div className="mt-8 h-10 w-2/3 rounded bg-white/10" />

          <div className="mt-4 h-5 w-full max-w-2xl rounded bg-white/5" />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="h-64 rounded-2xl bg-white/5 lg:col-span-2" />
            <div className="h-64 rounded-2xl bg-white/5" />
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
              onClick={() => navigate("/dashboard")}
              className="mt-6 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 text-sm text-slate-400 transition-colors hover:text-white"
        >
          ← Back to Dashboard
        </button>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                  🚀
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {project.title}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  {project.description}
                </p>
              </div>

              <StatusBadge status={project.status} />
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Information */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold">
              Project Information
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InfoItem
                label="Status"
                value={project.status || "Planning"}
              />

              <InfoItem
                label="Created"
                value={
                  project.createdAt
                    ? new Date(
                        project.createdAt
                      ).toLocaleDateString()
                    : "Not available"
                }
              />

              <InfoItem
                label="Last Updated"
                value={
                  project.updatedAt
                    ? new Date(
                        project.updatedAt
                      ).toLocaleDateString()
                    : "Not available"
                }
              />

              <InfoItem
                label="Members"
                value={`${project.members?.length || 0} member${
                  project.members?.length === 1 ? "" : "s"
                }`}
              />
            </div>
          </section>

          {/* Technologies */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">
              Technologies
            </h2>

            {project.technologies?.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {project.technologies.map((technology) => (
                  <span
                    key={technology}
                    className="rounded-lg border border-indigo-400/10 bg-indigo-400/5 px-3 py-2 text-xs font-medium text-indigo-300"
                  >
                    {technology}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-500">
                No technologies added yet.
              </p>
            )}
          </section>
        </div>

        {/* Members */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Project Members
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                People currently associated with this project.
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
              {project.members?.length || 0} members
            </span>
          </div>

          <div className="mt-6">
            {project.members?.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {project.members.map((member) => (
                  <MemberCard
                    key={member._id || member}
                    member={member}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 px-6 py-10 text-center">
                <div className="text-2xl">👥</div>

                <p className="mt-3 text-sm font-medium">
                  No additional members
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Team members can be added later.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Planning:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",

    "In Progress":
      "border-blue-400/20 bg-blue-400/10 text-blue-300",

    Completed:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  };

  return (
    <span
      className={`w-fit rounded-full border px-4 py-2 text-xs font-medium ${
        styles[status] ||
        "border-white/10 bg-white/5 text-slate-300"
      }`}
    >
      {status || "Planning"}
    </span>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-slate-200">
        {value}
      </p>
    </div>
  );
}

function MemberCard({ member }) {
  const name = member?.name || "Project Member";
  const email = member?.email || "Member";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.05]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300">
        {name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {name}
        </p>

        <p className="truncate text-xs text-slate-500">
          {email}
        </p>
      </div>
    </div>
  );
}

export default ProjectDetails;