import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProjectById,
  updateProject,
  getUsersForMemberSelection,
  addMember,
  removeMember,
   createProjectComment,
} from "../services/projectservices";
import { useAuth } from "../context/Authcontext.jsx";


function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
const [availableUsers, setAvailableUsers] = useState([]);
const [showMemberSelector, setShowMemberSelector] = useState(false);
const [isLoadingUsers, setIsLoadingUsers] = useState(false);
const [isEditingProject, setIsEditingProject] = useState(false);

const [editTitle, setEditTitle] = useState("");
const [editDescription, setEditDescription] = useState("");
const [editStatus, setEditStatus] = useState("");
//const [editTechnologies, setEditTechnologies] = useState("");
const [editTechnologies, setEditTechnologies] = useState([]);
const [technologyInput, setTechnologyInput] = useState("");

const [editMembers, setEditMembers] = useState([]);
const [isSavingProject, setIsSavingProject] = useState(false);

const [projectEditError, setProjectEditError] = useState("");
const [projectEditSuccess, setProjectEditSuccess] = useState("");

const [commentText, setCommentText] = useState("");
const [commentError, setCommentError] = useState("");
const [commentSuccess, setCommentSuccess] = useState("");
const [isPostingComment, setIsPostingComment] = useState(false);
const isOwner =
  user?._id &&
  project?.owner &&
  user._id.toString() ===
    (project.owner._id || project.owner).toString();


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
  if (isAuthLoading) {
    return;
  }

  if (!user) {
    return;
  }

  loadProject();
}, [id, isAuthLoading, user]);

  const handleStartEditProject = () => {
  setEditTitle(project.title || "");
  setEditDescription(project.description || "");
  setEditStatus(project.status || "Planning");

  setEditTechnologies(project.technologies || []);
setTechnologyInput("");

  setEditMembers(
    project.members?.map((member) =>
      typeof member === "object"
        ? member._id
        : member
    ) || []
  );

  setProjectEditError("");
  setProjectEditSuccess("");
  setShowMemberSelector(false);
  setIsEditingProject(true);
};

const handleCancelEditProject = () => {
  setIsEditingProject(false);

  setEditTitle("");
  setEditDescription("");
  setEditStatus("");
  setEditTechnologies("");
  setTechnologyInput("");
  setEditMembers([]);

  setProjectEditError("");
  setProjectEditSuccess("");
};

const handleAddTechnology = () => {
  const technology = technologyInput.trim();

  if (!technology) {
    return;
  }

  const alreadyExists = editTechnologies.some(
    (item) =>
      item.toLowerCase() === technology.toLowerCase()
  );

  if (alreadyExists) {
    setTechnologyInput("");
    return;
  }

  setEditTechnologies((current) => [
    ...current,
    technology,
  ]);

  setTechnologyInput("");
};

const handleRemoveTechnology = (technologyToRemove) => {
  setEditTechnologies((current) =>
    current.filter(
      (technology) => technology !== technologyToRemove
    )
  );
};
const handleSaveProject = async () => {
  const title = editTitle.trim();
  const description = editDescription.trim();

  if (!title) {
    setProjectEditError("Project title is required.");
    return;
  }

  if (!description) {
    setProjectEditError("Project description is required.");
    return;
  }

  

  try {
    setIsSavingProject(true);
    setProjectEditError("");
    setProjectEditSuccess("");

    const updatedProject = await updateProject(id, {
      title,
      description,
      status: editStatus,
      technologies: editTechnologies,
      members: editMembers,
    });

    setProject(updatedProject);

    setIsEditingProject(false);

    setProjectEditSuccess(
      "Project updated successfully."
    );

    //await loadActivity(1);
  } catch (error) {
    console.error(
      "Failed to update project:",
      error
    );

    setProjectEditError(
      error.response?.data?.message ||
        "Unable to update project."
    );
  } finally {
    setIsSavingProject(false);
  }
};
const handleOpenMemberSelector = async () => {
  try {
    setIsLoadingUsers(true);
    setProjectEditError("");

    const users = await getUsersForMemberSelection();

    setAvailableUsers(users);
    setShowMemberSelector(true);
  } catch (error) {
    console.error("Failed to load users:", error);

    setProjectEditError(
      error.response?.data?.message ||
        "Unable to load registered users."
    );
  } finally {
    setIsLoadingUsers(false);
  }
};

const handlePostComment = async () => {
  const comment = commentText.trim();

  if (!comment) {
    setCommentError("Comment cannot be empty.");
    return;
  }

  try {
    setIsPostingComment(true);
    setCommentError("");
    setCommentSuccess("");

    await createProjectComment(id, comment);

    setCommentText("");

    setCommentSuccess(
      "Comment posted successfully."
    );
  } catch (error) {
    console.error(
      "Failed to post project comment:",
      error
    );

    setCommentError(
      error.response?.data?.message ||
        "Unable to post comment."
    );
  } finally {
    setIsPostingComment(false);
  }
};


const handleSelectMember = (userId) => {
  setEditMembers((currentMembers) => {
    const exists = currentMembers.some(
      (id) => id.toString() === userId.toString()
    );

    if (exists) {
      return currentMembers;
    }

    return [...currentMembers, userId];
  });
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
          onClick={() => navigate("/projects")}
          className="mb-8 text-sm text-slate-400 transition-colors hover:text-white"
        >
          ← Back to Projects
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

  <div className="flex flex-wrap gap-2">
    {isOwner && (
      <button
        type="button"
        onClick={handleStartEditProject}
        className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
      >
        Edit Project
      </button>
    )}

    <button
      type="button"
      onClick={() =>
        navigate(`/projects/${id}/issues`)
      }
      className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-400"
    >
      View Issues →
    </button>
  </div>
</div>
            </div>
          </div>
        </section>

        {isEditingProject && isOwner && (
  <section className="mt-6 rounded-2xl border border-indigo-400/20 bg-white/[0.03] p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold">
          Edit Project
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Update your project details and members.
        </p>
      </div>

      <button
        type="button"
        onClick={handleCancelEditProject}
        disabled={isSavingProject}
        className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
      >
        Cancel
      </button>
    </div>

    {projectEditError && (
      <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
        {projectEditError}
      </div>
    )}

    {projectEditSuccess && (
      <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
        {projectEditSuccess}
      </div>
    )}

    <div className="mt-6 grid gap-5">
      {/* Title */}
      <div>
        <label
          htmlFor="editProjectTitle"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Project Title
        </label>

        <input
          id="editProjectTitle"
          type="text"
          value={editTitle}
          onChange={(event) => {
            setEditTitle(event.target.value);
            setProjectEditError("");
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/50"
          placeholder="Enter project title"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="editProjectDescription"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Description
        </label>

        <textarea
          id="editProjectDescription"
          value={editDescription}
          onChange={(event) => {
            setEditDescription(event.target.value);
            setProjectEditError("");
          }}
          rows={4}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/50"
          placeholder="Enter project description"
        />
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="editProjectStatus"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Status
        </label>

        <select
          id="editProjectStatus"
          value={editStatus}
          onChange={(event) =>
            setEditStatus(event.target.value)
          }
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50"
        >
          <option value="Planning">
            Planning
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Completed">
            Completed
          </option>
        </select>
      </div>

      {/* Technologies */}
      {/* Technologies */}
<div>
  <label className="mb-2 block text-sm font-medium text-slate-200">
    Technologies
  </label>

  <div className="flex flex-col gap-3 sm:flex-row">
    <input
      id="editProjectTechnologies"
      type="text"
      value={technologyInput}
      onChange={(event) =>
        setTechnologyInput(event.target.value)
      }
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          handleAddTechnology();
        }
      }}
      placeholder="Enter a technology..."
      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400/50"
    />

    <button
      type="button"
      onClick={handleAddTechnology}
      className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
    >
      Add
    </button>
  </div>

  {/* Technology tags */}
  {editTechnologies.length > 0 && (
    <div className="mt-4 flex flex-wrap gap-2">
      {editTechnologies.map((technology) => (
        <div
          key={technology}
          className="flex items-center gap-2 rounded-lg border border-indigo-400/20 bg-indigo-400/10 px-3 py-2 text-xs font-medium text-indigo-300"
        >
          <span>{technology}</span>

          <button
            type="button"
            onClick={() =>
              handleRemoveTechnology(technology)
            }
            className="text-indigo-300 transition hover:text-red-300"
            title={`Remove ${technology}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}

  <p className="mt-2 text-xs text-slate-500">
    Enter one technology and click Add. You can also press Enter.
  </p>
</div>

      {/* Members */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-200">
              Project Members
            </label>

            <p className="mt-1 text-xs text-slate-500">
              Add or remove members from this project.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenMemberSelector}
            disabled={isLoadingUsers}
            className="rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/20 disabled:opacity-50"
          >
            {isLoadingUsers
              ? "Loading..."
              : "Add Members"}
          </button>
        </div>

        {/* Current selected members */}
        <div className="mt-4 space-y-2">
          {project.members
            ?.filter((member) =>
              editMembers.some(
                (memberId) =>
                  memberId.toString() ===
                  member._id.toString()
              )
            )
            .map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300">
                  {member.name
                    ?.charAt(0)
                    .toUpperCase() || "M"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {member.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {member.userCode}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditMembers((current) =>
                      current.filter(
                        (memberId) =>
                          memberId.toString() !==
                          member._id.toString()
                      )
                    )
                  }
                  className="rounded-lg px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-400/10"
                >
                  Remove
                </button>
              </div>
            ))}

          {editMembers.length === 0 && (
            <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-slate-500">
              No members selected.
            </p>
          )}
        </div>

        {/* Member selector */}
        {showMemberSelector && (
          <div className="mt-4 rounded-xl border border-white/10 bg-slate-900 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-200">
                  Select Members
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Choose users to add to the project.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowMemberSelector(false)
                }
                className="rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto">
              {availableUsers
                .filter(
                  (availableUser) =>
                    availableUser._id.toString() !==
                    project.owner?._id?.toString()
                )
                .map((availableUser) => {
                  const isSelected =
                    editMembers.some(
                      (memberId) =>
                        memberId.toString() ===
                        availableUser._id.toString()
                    );

                  return (
                    <button
                      key={availableUser._id}
                      type="button"
                      onClick={() =>
                        handleSelectMember(
                          availableUser._id
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-indigo-400/30 bg-indigo-400/10"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-sm font-semibold text-indigo-300">
                        {availableUser.name
                          ?.charAt(0)
                          .toUpperCase() || "U"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {availableUser.name}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {availableUser.userCode}
                        </p>
                      </div>

                      {isSelected ? (
                        <span className="rounded-lg bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white">
                          Selected
                        </span>
                      ) : (
                        <span className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-slate-400">
                          Select
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleCancelEditProject}
          disabled={isSavingProject}
          className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSaveProject}
          disabled={isSavingProject}
          className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSavingProject
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </div>
  </section>
)}

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

        {/* Tasks */}
{/* Project Tasks */}
<section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-lg font-semibold">
        Project Tasks
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        View and manage the tasks associated with this project.
      </p>
    </div>

    <div className="flex items-center gap-3">
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
        {project.tasks?.length || 0} task
        {project.tasks?.length === 1 ? "" : "s"}
      </span>

      <button
        type="button"
        onClick={() =>
          navigate(`/projects/${id}/tasks`)
        }
        className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400"
      >
        View Tasks →
      </button>
    </div>
  </div>
</section>

{/* Project Comments */}
<section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-lg font-semibold">
        Project Comments
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Share updates, questions, or discussions with your project team.
      </p>
    </div>

    <button
      type="button"
      onClick={() => navigate(`/projects/${id}/comments`)}
      className="w-fit rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
    >
      View Comments →
    </button>
  </div>

  {/* Post Comment */}
  <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4">
    <label
      htmlFor="projectComment"
      className="mb-2 block text-sm font-medium text-slate-200"
    >
      Post Comment
    </label>

    <textarea
      id="projectComment"
      value={commentText}
      onChange={(event) => {
        setCommentText(event.target.value);
        setCommentError("");
        setCommentSuccess("");
      }}
      rows={4}
      placeholder="Write a comment about this project..."
      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-white/[0.07]"
    />

    {commentError && (
      <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
        {commentError}
      </div>
    )}

    {commentSuccess && (
      <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-300">
        {commentSuccess}
      </div>
    )}

    <div className="mt-4 flex justify-end">
      <button
        type="button"
        onClick={handlePostComment}
        disabled={isPostingComment}
        className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPostingComment ? "Posting..." : "Post Comment"}
      </button>
    </div>
  </div>
</section>

<section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-lg font-semibold">
        Project Activity
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        View the history of changes and activity in this project.
      </p>
    </div>

    <button
      type="button"
      onClick={() => navigate(`/projects/${id}/activity`)}
      className="w-fit rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-400"
    >
      View Activity / Logs →
    </button>
  </div>
</section>
        {/* Members */}
     {/* Project Members */}
<section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-lg font-semibold">
        Project Members
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Members currently participating in this project.
      </p>
    </div>

    <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
      {project.members?.length || 0} member
      {project.members?.length === 1 ? "" : "s"}
    </span>
  </div>

  {/* Members List */}
  <div className="mt-6 space-y-3">
    {/* Project Owner */}
    {project.owner && (
      <MemberCard
        member={project.owner}
        isOwner={true}
      />
    )}

    {/* Project Members */}
    {project.members?.length > 0 ? (
      project.members.map((member) => (
        <MemberCard
          key={member._id}
          member={member}
        />
      ))
    ) : (
      <div className="rounded-xl border border-dashed border-white/10 px-6 py-8 text-center">
        <div className="text-2xl">👥</div>

        <p className="mt-3 text-sm font-medium text-slate-300">
          No members added yet
        </p>

        <p className="mt-1 text-xs text-slate-500">
          The project owner can add members while editing the project.
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

       {member?.userCode && (
         <p className="mt-1 text-xs text-slate-500">
            {member.userCode}
         </p>
        )}

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

function ActivityCard({ activity }) {
  const userName =
    activity.user?.name ||
    activity.user?.userCode ||
    "Unknown user";

  const userInitial =
    userName.charAt(0).toUpperCase();

  const activityDate = activity.createdAt
    ? new Date(activity.createdAt).toLocaleString()
    : "";

  return (
    <div className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
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
            {activityDate}
          </span>
        </div>

        <p className="mt-2 text-sm leading-5 text-slate-400">
          {activity.description}
        </p>
      </div>
    </div>
  );
}
export default ProjectDetails;