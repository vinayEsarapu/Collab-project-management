import { useState , useEffect } from "react";
import { useMemo } from "react";
import { useAuth } from "../../context/Authcontext.jsx";

function IssueForm({ project , projectId, members = [],  issue = null,   canAssign = false,onSubmit, onClose }) {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const [formData, setFormData] = useState({
  title: issue?.title || "",
  description: issue?.description || "",
  status: issue?.status || "Open",
  priority: issue?.priority || "Medium",
  labels: issue?.labels || [],
  assignedTo:
  issue?.assignedTo?._id ||
  issue?.assignedTo ||
  "",

referredTo:
  issue?.referredTo?._id ||
  issue?.referredTo ||
  "",
  });

  useEffect(() => {
  if (!issue) return;

  setFormData({
    title: issue.title || "",
    description: issue.description || "",
    status: issue.status || "Open",
    priority: issue.priority || "Medium",
    labels: issue.labels || [],

    assignedTo:
      issue.assignedTo?._id ||
      issue.assignedTo ||
      "",

    referredTo:
      issue.referredTo?._id ||
      issue.referredTo ||
      "",
  });
}, [issue]);

  const [labelInput, setLabelInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const projectMembers = useMemo(() => {
  const projectUsers = members?.length
    ? members
    : project?.members || [];

  const owner = project?.owner;

  const users = owner
    ? [owner, ...projectUsers]
    : projectUsers;

  return users.filter((user, index, self) => {
    const userId = user?._id?.toString();

    if (!userId) return false;

    return (
      index ===
      self.findIndex(
        (item) => item?._id?.toString() === userId
      )
    );
  });
}, [members, project]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addLabel = () => {
    const label = labelInput.trim();

    if (!label) return;

    if (formData.labels.includes(label)) {
      setLabelInput("");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      labels: [...previous.labels, label],
    }));

    setLabelInput("");
  };

  const removeLabel = (labelToRemove) => {
    setFormData((previous) => ({
      ...previous,
      labels: previous.labels.filter(
        (label) => label !== labelToRemove
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.title.trim()) {
      setError("Please enter an issue title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter an issue description.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
  title: formData.title.trim(),
  description: formData.description.trim(),
  status: formData.status,
  priority: formData.priority,
  labels: formData.labels,
  project: projectId,
  referredTo: formData.referredTo || null,
};

// Only owner-controlled UI sends actual assignment.
if (canAssign) {
  payload.assignedTo = formData.assignedTo || null;
}

await onSubmit(payload);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save issue. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl animate-[fadeIn_0.2s_ease-out] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl max-h-[90vh]">
        
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
               {issue ? "Edit Issue" : "Create Issue"}
              
            </h2>

            <p className="mt-1 text-sm text-slate-400">
                {issue
                  ? "Update the issue details."
                  : "Add a new issue to this project."}
             // Add a new issue to this project.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Login button not working"
              maxLength={100}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/10"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the issue..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-400/10"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Priority
              </label>

              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Assignee */}
          {/* Refer To */}
{!issue && (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-300">
      Refer To
    </label>

    <select
      name="referredTo"
      value={formData.referredTo}
      onChange={handleChange}
      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50"
    >
      <option value="">
        No referral
      </option>

       {projectMembers
  .filter((member) => {
    const memberId = member?._id?.toString();

    return (
      memberId &&
      memberId !== currentUserId?.toString()
    );
  })
  .map((member) => (
    <option
      key={member._id}
      value={member._id}
    >
      {member.name || member.email}
    </option>
  ))}
    </select>

    <p className="mt-2 text-xs text-slate-500">
      Referencing someone does not assign the issue to them.
      Only the project owner can assign the issue.
    </p>
  </div>
)}

{/* Actual Assignment */}
{canAssign && (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-300">
      Assign To
    </label>

    <select
      name="assignedTo"
      value={formData.assignedTo}
      onChange={handleChange}
      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400/50"
    >
      <option value="">
        Unassigned
      </option>

      {projectMembers.map((member) => (
        <option
          key={member._id}
          value={member._id}
        >
          {member.name || member.email}
        </option>
      ))}
    </select>

    <p className="mt-2 text-xs text-slate-500">
      Only the project owner can assign or reassign an issue.
    </p>
  </div>
)}

          {/* Labels */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Labels
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={labelInput}
                onChange={(event) =>
                  setLabelInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addLabel();
                  }
                }}
                placeholder="bug, frontend..."
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-400/50"
              />

              <button
                type="button"
                onClick={addLabel}
                className="rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Add
              </button>
            </div>

            {formData.labels.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.labels.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => removeLabel(label)}
                    className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs text-indigo-300 transition hover:bg-red-400/10 hover:text-red-300"
                  >
                    #{label} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
               disabled={submitting}
              className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20"
            >
               {submitting
                ? issue
                  ? "Saving..."
                  : "Creating..."
                : issue
                  ? "Save Changes"
                  : "Create Issue"}
              
            
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IssueForm;