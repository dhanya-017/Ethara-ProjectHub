import React, { useState } from "react";
import { localDatabase } from "@/api/localDatabase.js";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { CheckSquare, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import TaskCard from "@/components/tasks/TaskCard";
import TaskDialog from "@/components/tasks/TaskDialog";

export default function Tasks() {
  const { user, isAdmin } = useOutletContext();
  const [taskDialog, setTaskDialog] = useState({ open: false, task: null });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => localDatabase.entities.Task.list("-created_date"),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => localDatabase.entities.Project.list(),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => localDatabase.entities.TeamMember.list(),
  });

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  const myTasks = isAdmin
    ? tasks
    : tasks.filter((t) => t.assigned_to === user?.email || t.created_by === user?.email);

  const filtered = myTasks.filter((t) => {
    const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div>
      <PageHeader
        title="My Tasks"
        description={isAdmin ? "All tasks across projects" : "Tasks assigned to you"}
      >
        <Button onClick={() => setTaskDialog({ open: true, task: null })}>
          <Plus className="h-4 w-4 mr-1" />
          New Task
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={search || statusFilter !== "all" ? "No tasks match your filters" : "No tasks yet"}
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first task to get started"
          }
          actionLabel={!search && statusFilter === "all" ? "Create Task" : undefined}
          onAction={() => setTaskDialog({ open: true, task: null })}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              showProject
              projectName={projectMap[task.project_id]}
              onClick={(t) => setTaskDialog({ open: true, task: t })}
            />
          ))}
        </div>
      )}

      <TaskDialog
        open={taskDialog.open}
        onOpenChange={(o) => setTaskDialog({ open: o, task: null })}
        task={taskDialog.task}
        projects={projects}
        members={members}
        isAdmin={isAdmin}
        onSaved={refetch}
      />
    </div>
  );
}