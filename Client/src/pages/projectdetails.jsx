import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
//import projectService from "../services/projectservices";
import { getProjectById ,addMember,
  removeMember, searchUsers,} from "../services/projectservices";
import { useAuth } from "../context/authcontext";


function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberSuccess, setMemberSuccess] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState(null);
  const isOwner =
  user?._id &&
  project?.owner?._id &&
  user._id.toString() === project.owner._id.toString();
  
    const loadProject = async () => {
      try {
        setIsLoading(true);
        setError("");

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
  //const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadProject();
  }, [id]);

  const handleUserSearch = async (event) => {
  const value = event.target.value;

  setUserSearch(value);
  setMemberError("");

  if (!value.trim()) {
    setUserResults([]);
    return;
  }

  try {
    setIsSearchingUsers(true);

    const users = await searchUsers(value);

    const existingMemberIds = new Set(
      (project.members || []).map((member) =>
        member._id?.toString()
      )
    );

    if (project.owner?._id) {
      existingMemberIds.add(project.owner._id.toString());
    }

    const availableUsers = users.filter(
      (user) => !existingMemberIds.has(user._id.toString())
    );

    setUserResults(availableUsers);
  } catch (error) {
    console.error("Failed to search users:", error);

    setMemberError(
      error.response?.data?.message ||
        "Unable to search users."
    );
  } finally {
    setIsSearchingUsers(false);
  }
};

const handleSelectUser = async (selectedUser) => {
  setMemberError("");
  setMemberSuccess("");

  try {
    setIsAddingMember(true);

    const updatedProject = await addMember(
      id,
      selectedUser._id
    );

    const refreshedProject = await getProjectById(id);

    setProject(refreshedProject || updatedProject);

    setUserSearch("");
    setUserResults([]);

    setMemberSuccess("Member added successfully.");
  } catch (error) {
    console.error("Failed to add member:", error);

    setMemberError(
      error.response?.data?.message ||
        "Unable to add member. Please try again."
    );
  } finally {
    setIsAddingMember(false);
  }
};
  const handleAddMember = async (event) => {
  event.preventDefault();

  setMemberError("");
  setMemberSuccess("");

  const trimmedUserId = memberUserId.trim();

  if (!trimmedUserId) {
    setMemberError("User ID is required.");
    return;
  }

  try {
    setIsAddingMember(true);

    const updatedProject = await addMember(id, trimmedUserId);

    const refreshedProject = await getProjectById(id);

    setProject(refreshedProject || updatedProject);
    setMemberUserId("");
    setMemberSuccess("Member added successfully.");
  } catch (error) {
    console.error("Failed to add member:", error);

    setMemberError(
      error.response?.data?.message ||
        "Unable to add member. Please try again."
    );
  } finally {
    setIsAddingMember(false);
  }
};

const handleRemoveMember = async (userId) => {
  setMemberError("");
  setMemberSuccess("");

  try {
    setRemovingMemberId(userId);

    await removeMember(id, userId);

    const refreshedProject = await getProjectById(id);

    setProject(refreshedProject);
    setMemberSuccess("Member removed successfully.");
  } catch (error) {
    console.error("Failed to remove member:", error);

    setMemberError(
      error.response?.data?.message ||
        "Unable to remove member. Please try again."
    );
  } finally {
    setRemovingMemberId(null);
  }
};

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

              <div className="flex flex-col gap-3 sm:items-end">
               <StatusBadge status={project.status} />

               <button
                onClick={() => navigate(`/projects/${id}/issues`)}
                 className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-400"
                        >
                 View Issues →
               </button>
</div>
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
       {/* Members */}
<section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-lg font-semibold">
        Project Members
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Manage the people collaborating on this project.
      </p>
    </div>

    <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
      {project.members?.length || 0+1} members
    </span>
  </div>

  {/* Project Owner */}
{project.owner && (
  <div className="mt-6 rounded-xl border border-indigo-400/10 bg-indigo-400/[0.03] p-4">
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300">
        {project.owner.name
          ? project.owner.name.charAt(0).toUpperCase()
          : "O"}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">
            {project.owner.name || "Project Owner"}
          </p>

          <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
            Owner
          </span>
        </div>

        <p className="truncate text-xs text-slate-500">
          {project.owner.email || "Owner"}
        </p>
      </div>
    </div>
  </div>
)}


{/* Add Member - Owner Only */}
{isOwner && (
  <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
    <label
      htmlFor="userSearch"
      className="mb-2 block text-sm font-medium text-slate-200"
    >
      Add Team Member
    </label>

    <input
      id="userSearch"
      type="text"
      value={userSearch}
      onChange={handleUserSearch}
      placeholder="Search registered users by name..."
      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/10"
    />

    {isSearchingUsers && (
      <p className="mt-3 text-xs text-slate-500">
        Searching...
      </p>
    )}

    {userResults.length > 0 && (
      <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-slate-900">
        {userResults.map((user) => (
          <button
            key={user._id}
            type="button"
            onClick={() => handleSelectUser(user)}
            disabled={isAddingMember}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <span className="truncate text-sm text-slate-200">
              {user.name}
            </span>
          </button>
        ))}
      </div>
    )}

    {userSearch.trim() && !isSearchingUsers && userResults.length === 0 && (
      <p className="mt-3 text-xs text-slate-500">
        No available users found.
      </p>
    )}
  </div>
)}
  {/* Member messages */}
  {memberError && (
    <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
      {memberError}
    </div>
  )}

  {memberSuccess && (
    <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
      {memberSuccess}
    </div>
  )}

  {/* Members list */}
  {/* Owner */}
<div className="mt-6">
  <h3 className="mb-3 text-sm font-medium text-slate-400">
    Owner
  </h3>

  <MemberCard
    member={project.owner}
    isOwner
  />
</div>

{/* Members */}
<div className="mt-6">
  <h3 className="mb-3 text-sm font-medium text-slate-400">
    Members
  </h3>

  {project.members?.length > 0 ? (
    <div className="grid gap-3 sm:grid-cols-2">
      {project.members.map((member) => (
        <MemberCard
          key={member._id}
          member={member}
          onRemove={handleRemoveMember}
          isRemoving={removingMemberId === member._id}
          isOwner={isOwner}
        />
      ))}
    </div>
  ) : (
    <div className="rounded-xl border border-dashed border-white/10 px-6 py-8 text-center">
      <div className="text-2xl">👥</div>

      <p className="mt-3 text-sm font-medium">
        No additional members
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Add your first team member above.
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

function MemberCard({
  member,
  onRemove,
  isRemoving,
  isOwner = false,
}) {
  const name = member?.name || "Project Member";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.05]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300">
        {name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-200">
          {name}
        </p>

        {isOwner && (
          <p className="mt-1 text-xs text-indigo-300">
            Owner
          </p>
        )}
      </div>

      {!isOwner && member?._id && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(member._id)}
          disabled={isRemoving}
          className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-400/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRemoving ? "Removing..." : "Remove"}
        </button>
      )}
    </div>
  );
}
export default ProjectDetails;