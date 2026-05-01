import React, { useState } from "react";
import { localDatabase } from "@/api/localDatabase.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useParams, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  ArrowLeft,
  Plus,
  Settings,
  Users,
  CheckSquare,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import TaskCard from "@/components/tasks/TaskCard";
import TaskDialog from "@/components/tasks/TaskDialog";
import ProjectDialog from "@/components/projects/ProjectDialog";
import MemberDialog from "@/components/team/MemberDialog";

const statusColumns = [
  { key: "todo", label: "To Do", color: "bg-slate-400" },
  { key: "in_progress", label: "In Progress", color: "bg-indigo-500" },
  { key: "in_review", label: "In Review", color: "bg-amber-500" },
  { key: "done", label: "Done", color: "bg-emerald-500" },
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useOutletContext();
  const queryClient = useQueryClient();
  const [taskDialog, setTaskDialog] = useState({ open: false, task: null });
  const [projectDialog, setProjectDialog] = useState(false);
  const [memberDialog, setMemberDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("board");

  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ["project", id],
    queryFn: () => localDatabase.entities.Project.filter({ id }),
    select: (data) => data[0],
  });

  const { data: tasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ["project-tasks", id],
    queryFn: () => localDatabase.entities.Task.filter({ project_id: id }),
  });

  const { data: members = [], refetch: refetchMembers } = useQuery({
    queryKey: ["project-members", id],
    queryFn: () => localDatabase.entities.TeamMember.filter({ project_id: id }),
  });

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  const invalidateAll = () => {
    refetchTasks();
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    const newStatus = destination.droppableId;
    await localDatabase.entities.Task.update(draggableId, { status: newStatus });
    invalidateAll();
  };

  if (loadingProject) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="Project not found"
        description="This project may have been deleted"
      />
    );
  }

  const handleDeleteProject = async () => {
    if (!confirm("Delete this project and all its tasks?")) return;
    // Delete all tasks
    for (const task of tasks) {
      await localDatabase.entities.Task.delete(task.id);
    }
    // Delete all members
    for (const member of members) {
      await localDatabase.entities.TeamMember.delete(member.id);
    }
    await localDatabase.entities.Project.delete(project.id);
    window.location.href = "/projects";
  };

  return (
    <div>
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ backgroundColor: project.color || "#6366f1" }}
          >
            {project.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setTaskDialog({ open: true, task: null })}>
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
          {isAdmin && (
            <>
              <Button size="sm" variant="outline" onClick={() => setMemberDialog(true)}>
                <Users className="h-4 w-4 mr-1" />
                Add Member
              </Button>
              <Button size="sm" variant="outline" onClick={() => setProjectDialog(true)}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={handleDeleteProject}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-card border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {doneCount} of {tasks.length} tasks completed
          </span>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {members.length} members
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          {tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks yet"
              description="Add your first task to this project"
              actionLabel="Add Task"
              onAction={() => setTaskDialog({ open: true, task: null })}
            />
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statusColumns.map((col) => {
                  const colTasks = tasks.filter((t) => t.status === col.key);
                  return (
                    <div key={col.key}>
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <div className={cn("h-2 w-2 rounded-full", col.color)} />
                        <span className="text-sm font-semibold">{col.label}</span>
                        <Badge variant="secondary" className="ml-auto text-[10px] h-5">
                          {colTasks.length}
                        </Badge>
                      </div>
                      <Droppable droppableId={col.key}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                              "space-y-3 min-h-[100px] rounded-lg p-1 transition-colors",
                              snapshot.isDraggingOver && "bg-primary/5 ring-1 ring-primary/20"
                            )}
                          >
                            {colTasks.map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={cn(snapshot.isDragging && "rotate-1 shadow-lg opacity-90")}
                                  >
                                    <TaskCard
                                      task={task}
                                      onClick={(t) => setTaskDialog({ open: true, task: t })}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          )}
        </TabsContent>

        <TabsContent value="list">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={(t) => setTaskDialog({ open: true, task: t })}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {members.map((member) => (
              <div key={member.id} className="bg-card border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {(member.user_name || member.user_email)?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{member.user_name || member.user_email}</p>
                    <p className="text-xs text-muted-foreground">{member.user_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">{member.role}</Badge>
                  {isAdmin && member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={async () => {
                        await localDatabase.entities.TeamMember.delete(member.id);
                        refetchMembers();
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <TaskDialog
        open={taskDialog.open}
        onOpenChange={(o) => setTaskDialog({ open: o, task: null })}
        task={taskDialog.task}
        projectId={id}
        members={members}
        isAdmin={isAdmin}
        onSaved={invalidateAll}
      />

      <ProjectDialog
        open={projectDialog}
        onOpenChange={setProjectDialog}
        project={project}
        user={user}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["project", id] })}
      />

      <MemberDialog
        open={memberDialog}
        onOpenChange={setMemberDialog}
        projectId={id}
        existingMembers={members}
        onSaved={refetchMembers}
      />
    </div>
  );
}