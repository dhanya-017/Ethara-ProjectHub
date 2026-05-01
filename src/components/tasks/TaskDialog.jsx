// @ts-ignore
import React, { useState, useEffect } from "react";
// @ts-ignore
import { cn } from "@/lib/utils.js";
import { localDatabase } from "@/api/localDatabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
// @ts-ignore
import { Avatar, AvatarFallback } from "@/components/ui/avatar.jsx";
// @ts-ignore
import { Badge } from "@/components/ui/badge.jsx";
import { Textarea } from "@/components/ui/textarea.jsx";
import { Label } from "@/components/ui/label.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.jsx";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast.jsx";

export default function TaskDialog({
  open,
  onOpenChange,
  task,
  projectId,
  projects,
  members,
  onSaved,
  isAdmin,
}) {
  const isEdit = !!task?.id;
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    project_id: projectId || "",
    status: "todo",
    priority: "medium",
    assigned_to: "",
    assigned_to_name: "",
    due_date: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task?.id) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        project_id: task.project_id || projectId || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        assigned_to: task.assigned_to || "",
        assigned_to_name: task.assigned_to_name || "",
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
      });
    } else {
      setForm({
        title: "",
        description: "",
        project_id: projectId || "",
        status: "todo",
        priority: "medium",
        assigned_to: "",
        assigned_to_name: "",
        due_date: "",
      });
    }
  }, [task, projectId, open]);

  const handleAssigneeChange = (email) => {
    const member = members?.find((m) => m.user_email === email);
    setForm({
      ...form,
      assigned_to: email,
      assigned_to_name: member?.user_name || email,
    });
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.project_id) return;
    setSaving(true);
    if (isEdit) {
      await localDatabase.entities.Task.update(task.id, form);
    } else {
      await localDatabase.entities.Task.create(form);
    }
    setSaving(false);
    toast({ title: isEdit ? "Task updated" : "Task created", description: form.title });
    onSaved?.();
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    setSaving(true);
    await localDatabase.entities.Task.delete(task.id);
    setSaving(false);
    toast({ title: "Task deleted" });
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <
// @ts-ignore
      DialogContent className="sm:max-w-lg">
        <DialogHeader className={undefined}>
          <
// @ts-ignore
          DialogTitle>{isEdit ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <
// @ts-ignore
            Label>Title *</Label>
            <Input
              // @ts-ignore
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
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
              placeholder="Add details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!projectId && projects?.length > 0 && (
              <div>
                <
// @ts-ignore
                Label>Project *</Label>
                <Select
                  value={form.project_id}
                  onValueChange={(v) => setForm({ ...form, project_id: v })}
                >
                  <
// @ts-ignore
                  SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <
// @ts-ignore
                  SelectContent>
                    {projects.map((p) => (
                      <
// @ts-ignore
                      SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
                SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <
// @ts-ignore
                SelectContent>
                  <
// @ts-ignore
                  SelectItem value="todo">To Do</SelectItem>
                  <
// @ts-ignore
                  SelectItem value="in_progress">In Progress</SelectItem>
                  <
// @ts-ignore
                  SelectItem value="in_review">In Review</SelectItem>
                  <
// @ts-ignore
                  SelectItem value="done">Done</SelectItem>
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
                SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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

            {members?.length > 0 && (
              <div>
                <
// @ts-ignore
                Label>Assign to</Label>
                <Select
                  value={form.assigned_to}
                  onValueChange={handleAssigneeChange}
                >
                  <
// @ts-ignore
                  SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <
// @ts-ignore
                  SelectContent>
                    {members.map((m) => (
                      <
// @ts-ignore
                      SelectItem key={m.user_email} value={m.user_email}>
                        {m.user_name || m.user_email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
        </div>

        <DialogFooter className="flex justify-between">
          {isEdit && isAdmin && (
            <
// @ts-ignore
            Button
              variant="ghost"
              className="text-destructive hover:text-destructive mr-auto"
              onClick={handleDelete}
              disabled={saving}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
          <div className="flex gap-2">
            <
// @ts-ignore
            Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <
// @ts-ignore
            Button onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
