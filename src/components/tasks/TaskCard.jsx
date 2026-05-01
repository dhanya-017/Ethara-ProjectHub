import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Flag } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils.js";

const statusConfig = {
  todo: { label: "To Do", class: "bg-slate-100 text-slate-600 border-slate-200" },
  in_progress: { label: "In Progress", class: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  in_review: { label: "In Review", class: "bg-amber-50 text-amber-600 border-amber-200" },
  done: { label: "Done", class: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

const priorityConfig = {
  low: { label: "Low", class: "text-slate-400" },
  medium: { label: "Med", class: "text-amber-500" },
  high: { label: "High", class: "text-orange-500" },
  critical: { label: "Critical", class: "text-red-500" },
};

export default function TaskCard({ task, onClick, showProject, projectName }) {
  const status = statusConfig[task.status] || statusConfig.todo;
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const isOverdue =
    task.due_date && task.status !== "done" && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));

  return (
    <div
      onClick={() => onClick?.(task)}
      className="bg-card border rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {task.title}
        </h3>
        <Flag className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", priority.class)} />
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 font-medium", status.class)}>
          {status.label}
        </Badge>

        {showProject && projectName && (
          <Badge variant="outline" className="text-[10px] px-2 py-0.5">
            {projectName}
          </Badge>
        )}

        {task.due_date && (
          <span
            className={cn(
              "flex items-center gap-1 text-[10px] ml-auto",
              isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"
            )}
          >
            <Calendar className="h-3 w-3" />
            {format(new Date(task.due_date), "MMM d")}
          </span>
        )}
      </div>

      {task.assigned_to_name && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
              {task.assigned_to_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{task.assigned_to_name}</span>
        </div>
      )}
    </div>
  );
}
