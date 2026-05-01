import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { cn } from "@/lib/utils.js";
import { Plus } from "lucide-react";

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
      )}
      <h3 className="font-semibold text-lg">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      )}
      {actionLabel && onAction && (
        <
// @ts-ignore
        Button onClick={onAction} className="mt-4">
          <Plus className="h-4 w-4 mr-1" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
