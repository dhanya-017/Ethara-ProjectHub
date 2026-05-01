import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const STATUS_COLORS = {
  todo: "#94a3b8",
  in_progress: "#6366f1",
  in_review: "#f59e0b",
  done: "#10b981",
};

const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

export default function TaskStatusChart({ tasks }) {
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    value: count,
    color: STATUS_COLORS[status] || "#94a3b8",
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No tasks yet
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <PieChart width={140} height={140}>
        <Pie
          data={data}
          cx={70}
          cy={70}
          innerRadius={40}
          outerRadius={65}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
      <div className="space-y-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="font-semibold ml-auto">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
