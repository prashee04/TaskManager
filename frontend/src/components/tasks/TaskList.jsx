import React from "react";
import TaskCard from "../dashboard/TaskCard";
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const TaskList = ({
  tasks,
  loading,
  onEdit,
  onView,
  onStatusChange,
  onDelete,
  onCreate,
  showAddCard = false,
  searchTerm = "",
  onClearSearch,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Loading your tasks...
          </p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        {searchTerm ? (
          <>
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No matching tasks
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No tasks found matching "{searchTerm}"
            </p>
            <button
              onClick={onClearSearch}
              className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Clear search
            </button>
          </>
        ) : (
          <>
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No tasks yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first task.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
      {tasks.map((task, index) => (
        <div
          key={task._id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <TaskCard
            task={task}
            onEdit={onEdit}
            onView={onView}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskList;
