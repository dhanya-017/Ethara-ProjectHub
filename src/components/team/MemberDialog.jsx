import React, { useState } from "react";
import { localDatabase } from "@/api/localDatabase.js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.jsx";
import { useToast } from "@/components/ui/use-toast.jsx";

const roles = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" }
];

export default function MemberDialog({ open, onOpenChange, projectId, existingMembers, onSaved }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!email.trim()) return;
    
    // Check if member already exists
    const exists = existingMembers.some(m => m.user_email === email.trim());
    if (exists) {
      toast({ 
        title: "Member already exists", 
        description: "This user is already a member of this project",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      await localDatabase.entities.TeamMember.create({
        project_id: projectId,
        user_email: email.trim(),
        user_name: email.trim(), // In real app, would get user name from email
        role: role
      });
      
      toast({ title: "Member added", description: `${email} added to project` });
      onSaved?.();
      onOpenChange(false);
      setEmail("");
      setRole("member");
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to add member",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              type="email"
            />
          </div>
          
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !email.trim()}
          >
            {saving ? "Adding..." : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
