import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { cn } from "@/lib/utils.js";

export default function StatCard({ title, value, icon: Icon, trend, color = "primary" }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    green: "bg-emerald-100 text-emerald-600",
    orange: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
  };

  return (
    <div className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1.5 tracking-tight">{value}</p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1.5">{trend}</p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg", colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
