import React, { useState } from "react";
import { localDatabase } from "@/api/localDatabase.js";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { Users, Mail, FolderKanban, CheckSquare, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

export default function Team() {
  const { user, isAdmin } = useOutletContext();
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    await localDatabase.users.inviteUser(inviteEmail.trim(), "user");
    setInviting(false);
    toast({ title: "Invitation sent", description: `Invite sent to ${inviteEmail}` });
    setInviteEmail("");
    setInviteOpen(false);
  };

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => localDatabase.entities.TeamMember.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => localDatabase.entities.Project.list(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => localDatabase.entities.Task.list(),
  });

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  // Group by person
  const peopleMap = {};
  members.forEach((m) => {
    if (!peopleMap[m.user_email]) {
      peopleMap[m.user_email] = {
        email: m.user_email,
        name: m.user_name || m.user_email,
        projects: [],
      };
    }
    peopleMap[m.user_email].projects.push({
      projectId: m.project_id,
      projectName: projectMap[m.project_id] || "Unknown",
      role: m.role,
    });
  });

  const people = Object.values(peopleMap);

  // Count tasks per person
  const taskCountByEmail = tasks.reduce((acc, t) => {
    if (t.assigned_to) {
      acc[t.assigned_to] = (acc[t.assigned_to] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Team" description="People across all your projects">
        {isAdmin && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1" />
            Invite User
          </Button>
        )}
      </PageHeader>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Invite User to App</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label>Email address</Label>
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              type="email"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
              {inviting ? "Sending..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : people.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members yet"
          description="Add members to your projects to see them here"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person) => (
            <div key={person.email} className="bg-card border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {person.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{person.name}</p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {person.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <FolderKanban className="h-3 w-3" />
                  {person.projects.length} projects
                </span>
                <span className="flex items-center gap-1">
                  <CheckSquare className="h-3 w-3" />
                  {taskCountByEmail[person.email] || 0} tasks
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {person.projects.map((p, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px]">
                    {p.projectName}
                    <span className="ml-1 opacity-60 capitalize">({p.role})</span>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}