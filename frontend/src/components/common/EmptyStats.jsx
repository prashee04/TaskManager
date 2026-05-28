// frontend/src/components/common/EmptyState.jsx
import React from "react";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

const EmptyState = ({ title, description, action }) => {
  return (
    <div className="text-center py-12 animate-fade-in">
      <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {title || "No tasks yet"}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {description || "Get started by creating your first task."}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
