import React, { useState } from "react";
import { localDatabase } from "@/api/localDatabase.js";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { FolderKanban, Plus, Search } from "lucide-react";
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
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectDialog from "@/components/projects/ProjectDialog";

export default function Projects() {
  const { user, isAdmin } = useOutletContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: projects = [], isLoading, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: () => localDatabase.entities.Project.list("-created_date"),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => localDatabase.entities.Task.list(),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => localDatabase.entities.TeamMember.list(),
  });

  const tasksByProject = tasks.reduce((acc, t) => {
    if (!acc[t.project_id]) acc[t.project_id] = { total: 0, done: 0 };
    acc[t.project_id].total++;
    if (t.status === "done") acc[t.project_id].done++;
    return acc;
  }, {});

  const membersByProject = members.reduce((acc, m) => {
    acc[m.project_id] = (acc[m.project_id] || 0) + 1;
    return acc;
  }, {});

  const filtered = projects.filter((p) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <PageHeader title="Projects" description="Manage and track all your projects">
        {isAdmin && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Project
          </Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={search || statusFilter !== "all" ? "No projects found" : "No projects yet"}
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first project to get started"
          }
          actionLabel={!search && statusFilter === "all" && isAdmin ? "Create Project" : undefined}
          onAction={isAdmin ? () => setDialogOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              taskCount={tasksByProject[project.id]?.total || 0}
              doneCount={tasksByProject[project.id]?.done || 0}
              memberCount={membersByProject[project.id] || 0}
            />
          ))}
        </div>
      )}

      <ProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={user}
        onSaved={refetch}
      />
    </div>
  );
}