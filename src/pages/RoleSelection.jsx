import React, { useState } from "react";
import { localDatabase } from "@/api/localDatabase.js";
import { ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const roles = [
  {
    key: "admin",
    label: "Admin",
    icon: ShieldCheck,
    description: "Manage projects, invite team members, oversee all tasks and reports.",
    color: "border-primary bg-primary/5 text-primary",
  },
  {
    key: "user",
    label: "Member",
    icon: User,
    description: "Work on assigned tasks, collaborate on projects, track your progress.",
    color: "border-emerald-500 bg-emerald-50 text-emerald-600",
  },
];

export default function RoleSelection({ onRoleSelected }) {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);
    await localDatabase.auth.updateMe({ role: selected });
    onRoleSelected(selected);
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to ProjectHub</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Choose your role to get started. This determines what you can do in the app.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {roles.map((role) => (
            <button
              key={role.key}
              onClick={() => setSelected(role.key)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                selected === role.key
                  ? role.color + " ring-2 ring-offset-2 ring-primary/30"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              )}
            >
              <div className={cn("p-2 rounded-lg", selected === role.key ? "bg-white/60" : "bg-muted")}>
                <role.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{role.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
              </div>
            </button>
          ))}
        </div>

        <
// @ts-ignore
        Button
          className="w-full"
          disabled={!selected || saving}
          onClick={handleConfirm}
        >
          {saving ? "Setting up your account..." : "Continue as " + (selected ? roles.find(r => r.key === selected)?.label : "...")}
        </Button>
      </div>
    </div>
  );
}