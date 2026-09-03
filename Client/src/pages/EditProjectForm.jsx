const EditProjectForm = ({
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  editStatus,
  setEditStatus,
  technologyInput,
  setTechnologyInput,
  editTechnologies,
  editMembers,
  setEditMembers,
  project,
  availableUsers,
  isLoadingUsers,
  showMemberSelector,
  setShowMemberSelector,
  projectEditError,
  projectEditSuccess,
  isSavingProject,
  handleAddTechnology,
  handleRemoveTechnology,
  handleOpenMemberSelector,
  handleSelectMember,
  handleSaveProject,
  handleCancelEditProject,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl sm:p-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
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
            className="rounded-lg px-3 py-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {projectEditError && (
          <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {projectEditError}
          </div>
        )}

        {/* Success */}
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
              onChange={(event) => setEditStatus(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Technologies */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Technologies
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
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
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                {isLoadingUsers ? "Loading..." : "Add Members"}
              </button>
            </div>

            {/* Selected members */}
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
                      {member.name?.charAt(0).toUpperCase() || "M"}
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
              <div className="mt-4 rounded-xl border border-white/10 bg-slate-950 p-4">
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
                    onClick={() => setShowMemberSelector(false)}
                    className="rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {availableUsers
                    .filter(
                      (availableUser) =>
                        availableUser._id.toString() !==
                        project.owner?._id?.toString()
                    )
                    .map((availableUser) => {
                      const isSelected = editMembers.some(
                        (memberId) =>
                          memberId.toString() ===
                          availableUser._id.toString()
                      );

                      return (
                        <button
                          key={availableUser._id}
                          type="button"
                          onClick={() =>
                            handleSelectMember(availableUser._id)
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

                          <span
                            className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${
                              isSelected
                                ? "bg-indigo-500 text-white"
                                : "border border-white/10 text-slate-400"
                            }`}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
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
            {isSavingProject ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectForm;