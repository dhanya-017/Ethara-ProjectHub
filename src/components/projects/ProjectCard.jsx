import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Users, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const statusConfig = {
  planning: { label: "Planning", class: "bg-slate-100 text-slate-600" },
  active: { label: "Active", class: "bg-indigo-50 text-indigo-600" },
  on_hold: { label: "On Hold", class: "bg-amber-50 text-amber-600" },
  completed: { label: "Completed", class: "bg-emerald-50 text-emerald-600" },
  archived: { label: "Archived", class: "bg-slate-100 text-slate-400" },
};

export default function ProjectCard({ project, taskCount = 0, doneCount = 0, memberCount = 0 }) {
  const status = statusConfig[project.status] || statusConfig.planning;
  const progress = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block bg-card border rounded-xl p-5 hover:shadow-lg hover:border-primary/20 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: project.color || "#6366f1" }}
          >
            {project.name?.[0]?.toUpperCase() || "P"}
          </div>
          <div>
            <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
              {project.name}
            </h3>
            <Badge variant="secondary" className={cn("text-[10px] mt-1", status.class)}>
              {status.label}
            </Badge>
          </div>
        </div>
      </div>

      {project.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description}
        </p>
      )}

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress 
// @ts-ignore
          value={progress} className="h-1.5" />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1">
            <CheckSquare className="h-3 w-3" />
            {doneCount}/{taskCount}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {memberCount}
          </span>
          {project.due_date && (
            <span className="flex items-center gap-1 ml-auto">
              <Calendar className="h-3 w-3" />
              {format(new Date(project.due_date), "MMM d")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}