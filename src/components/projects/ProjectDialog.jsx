// @ts-ignore
import React, { useState, useEffect } from "react";
import { localDatabase } from "@/api/localDatabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#14b8a6"];

export default function ProjectDialog({ open, onOpenChange, project, user, onSaved }) {
  const isEdit = !!project?.id;
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
    start_date: "",
    due_date: "",
    color: "#6366f1",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project?.id) {
      setForm({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "planning",
        priority: project.priority || "medium",
        start_date: project.start_date ? project.start_date.split("T")[0] : "",
        due_date: project.due_date ? project.due_date.split("T")[0] : "",
        color: project.color || "#6366f1",
      });
    } else {
      setForm({
        name: "",
        description: "",
        status: "planning",
        priority: "medium",
        start_date: "",
        due_date: "",
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
  }, [project, open]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (isEdit) {
      await localDatabase.entities.Project.update(project.id, form);
    } else {
      const created = await localDatabase.entities.Project.create({
        ...form,
        owner_email: user?.email,
      });
      // Add creator as owner team member
      await localDatabase.entities.TeamMember.create({
        project_id: created.id,
        user_email: user?.email,
        user_name: user?.full_name || user?.email,
        role: "owner",
      });
    }
    setSaving(false);
    toast({ title: isEdit ? "Project updated" : "Project created", description: form.name });
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <
// @ts-ignore
      DialogContent className="sm:max-w-lg">
        <
// @ts-ignore
        DialogHeader>
          <
// @ts-ignore
          DialogTitle>{isEdit ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <
// @ts-ignore
            Label>Project Name *</Label>
            <Input
              // @ts-ignore
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="My awesome project"
            />
          </div>

          <div>
            <
// @ts-ignore
            Label>Description</Label>
            <Textarea
              // @ts-ignore
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What's this project about?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <
// @ts-ignore
              Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <
// @ts-ignore
                SelectTrigger><SelectValue /></SelectTrigger>
                <
// @ts-ignore
                SelectContent>
                  <
// @ts-ignore
                  SelectItem value="planning">Planning</SelectItem>
                  <
// @ts-ignore
                  SelectItem value="active">Active</SelectItem>
                  <
// @ts-ignore
                  SelectItem value="on_hold">On Hold</SelectItem>
                  <
// @ts-ignore
                  SelectItem value="completed">Completed</SelectItem>
                  <
// @ts-ignore
                  SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <
// @ts-ignore
              Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v })}
              >
                <
// @ts-ignore
                SelectTrigger><SelectValue /></SelectTrigger>
                <
// @ts-ignore
                SelectContent>
                  <
// @ts-ignore
                  SelectItem value="low">Low</SelectItem>
                  <
// @ts-ignore
                  SelectItem value="medium">Medium</SelectItem>
                  <
// @ts-ignore
                  SelectItem value="high">High</SelectItem>
                  <
// @ts-ignore
                  SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <
// @ts-ignore
              Label>Start date</Label>
              <Input
                // @ts-ignore
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div>
              <
// @ts-ignore
              Label>Due date</Label>
              <Input
                // @ts-ignore
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <
// @ts-ignore
            Label>Color</Label>
            <div className="flex gap-2 mt-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-7 w-7 rounded-full transition-all ${
                    form.color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setForm({ ...form, color: c })}
                />
              ))}
            </div>
          </div>
        </div>

        <
// @ts-ignore
        DialogFooter>
          <
// @ts-ignore
          Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <
// @ts-ignore
          Button onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}