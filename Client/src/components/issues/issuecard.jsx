import { Link } from "react-router-dom";
function IssueCard({ issue ,  projectId}) {

  
 return (
  <Link
    to={
      taskId
        ? `/projects/${projectId}/tasks/${taskId}/issues/${issue._id}`
        : `/projects/${projectId}/issues/${issue._id}`
    }
    className="block"
  >

    
    <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-white">
            {issue.title}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            #{issue._id?.slice(-6)}
          </p>
        </div>

        <StatusBadge status={issue.status} />
      </div>

      {/* Description */}
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
        {issue.description}
      </p>

      {/* Labels */}
      {issue.labels?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {issue.labels.map((label, index) => (
            <span
              key={`${label}-${index}`}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
            >
              #{label}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <PriorityBadge priority={issue.priority} />

        <div className="text-xs text-slate-500">
          {issue.assignedTo ? (
            <span>
              Assigned to{" "}
              <span className="text-slate-300">
                {issue.assignedTo.name}
              </span>
            </span>
          ) : (
            "Unassigned"
          )}
        </div>
      </div>
    </div>
</Link>
  );
}


function StatusBadge({ status }) {
  const styles = {
    Open: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    "In Progress":
      "bg-amber-500/10 text-amber-300 border-amber-500/20",
    Resolved:
      "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    Closed: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  };

  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
        styles[status] || styles.Open
      }`}
    >
      {status}
    </span>
  );
}


function PriorityBadge({ priority }) {
  const styles = {
    Low: "text-slate-400",
    Medium: "text-blue-300",
    High: "text-orange-300",
    Critical: "text-red-300",
  };

  return (
    <span
      className={`text-xs font-medium ${
        styles[priority] || styles.Medium
      }`}
    >
      ● {priority} Priority
    </span>
  );
}

export default IssueCard;