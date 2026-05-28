import React from "react";
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const StatCard = ({ title, value, icon: Icon, color, change }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="text-3xl font-bold text-slate-950 dark:text-white mt-3">
          {value}
        </p>
        {change !== undefined && (
          <p
            className={`text-xs mt-3 font-medium ${change >= 0 ? "text-emerald-600" : "text-rose-600"}`}
          >
            {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% from last week
          </p>
        )}
      </div>
      <div className={`p-3 rounded-3xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const TaskStats = ({ stats }) => {
  const statItems = [
    {
      title: "Total Tasks",
      value: stats.totalTasks || 0,
      icon: ClipboardDocumentListIcon,
      color: "bg-indigo-500",
      change: 12,
    },
    {
      title: "Pending",
      value: stats.pendingTasks || 0,
      icon: ClockIcon,
      color: "bg-yellow-500",
      change: -5,
    },
    {
      title: "Completed",
      value: stats.completedTasks || 0,
      icon: CheckCircleIcon,
      color: "bg-green-500",
      change: 8,
    },
    {
      title: "Overdue",
      value: stats.overdueTasks || 0,
      icon: ExclamationTriangleIcon,
      color: "bg-red-500",
      change: 3,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statItems.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};

export default TaskStats;
