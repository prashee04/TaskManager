import React from "react";

const TaskFilters = ({ currentFilter, onFilterChange }) => {
  const filters = [
    {
      id: "all",
      label: "All",
      active: "bg-slate-900 text-white",
    },
    {
      id: "pending",
      label: "Pending",
      active: "bg-slate-100 text-slate-800",
    },
    {
      id: "in progress",
      label: "In Progress",
      active: "bg-sky-100 text-sky-800",
    },
    {
      id: "completed",
      label: "Completed",
      active: "bg-emerald-100 text-emerald-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      {filters.map((filter) => {
        const isActive = currentFilter === filter.id;
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-center text-sm font-semibold transition sm:px-4 ${
              isActive
                ? `${filter.active} border-transparent shadow-sm`
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
};

export default TaskFilters;
