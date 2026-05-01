import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { localDatabase } from "@/api/localDatabase.js";
import { Link } from "react-router-dom";
import { FolderKanban, CheckSquare, Clock, AlertTriangle, Users, ArrowRight } from "lucide-react";
import { isPast, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/dashboard/StatCard.jsx";
import TaskStatusChart from "@/components/dashboard/TaskStatusChart.jsx";
import TaskCard from "@/components/tasks/TaskCard.jsx";
import TaskDialog from "@/components/tasks/TaskDialog.jsx";
import PageHeader from "@/components/common/PageHeader.jsx";

export default function AdminDashboard({ user }) {
  const [taskDialog, setTaskDialog] = useState({ open: false, task: null });

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => localDatabase.entities.Project.list("-created_date"),
  });

  const { data: tasks = [], isLoading: loadingTasks, refetch: refetchTasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => localDatabase.entities.Task.list("-created_date"),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => localDatabase.entities.TeamMember.list(),
  });

  const overdueTasks = tasks.filter(
    (t) => t.due_date && t.status !== "done" && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))
  );
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));
  const uniqueMembers = new Set(members.map((m) => m.user_email)).size;

  const isLoading = loadingProjects || loadingTasks;

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description={`Welcome back, ${user?.full_name?.split(" ")[0] || "Admin"} — here's the full overview`} children={undefined}      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Projects" value={projects.length} icon={FolderKanban} color="primary" trend={undefined} />
          <StatCard title="All Tasks" value={tasks.length} icon={CheckSquare} color="blue" trend={undefined} />
          <StatCard title="In Progress" value={inProgressTasks.length} icon={Clock} color="orange" trend={undefined} />
          <StatCard title="Team Members" value={uniqueMembers} icon={Users} color="green" trend={undefined} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold mb-4">All Tasks Overview</h2>
          <TaskStatusChart tasks={tasks} />
        </div>

        <div className="lg:col-span-2 bg-card border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Tasks (All Projects)</h2>
            <Link to="/tasks">
              <
// @ts-ignore
              Button variant="ghost" size="sm" className="text-xs">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          {tasks.slice(0, 6).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No tasks yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tasks.slice(0, 6).map((task) => (
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
        </div>
      </div>

      {overdueTasks.length > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="font-semibold text-red-700">Overdue Tasks ({overdueTasks.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {overdueTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                showProject
                projectName={projectMap[task.project_id]}
                onClick={(t) => setTaskDialog({ open: true, task: t })}
              />
            ))}
          </div>
        </div>
      )}

      <TaskDialog
        open={taskDialog.open}
        onOpenChange={(o) => setTaskDialog({ open: o, task: null })}
        task={taskDialog.task}
        projects={projects}
        members={members}
        isAdmin={true}
        onSaved={refetchTasks} projectId={undefined}      />
    </div>
  );
}
