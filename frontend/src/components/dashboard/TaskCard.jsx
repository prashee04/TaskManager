import React, { useState, useContext, useMemo } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import {
  CalendarIcon,
  FlagIcon,
  PencilIcon,
  CheckCircleIcon,
  UserGroupIcon,
  PaperClipIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { AuthContext } from "../../context/AuthContext";

const priorityColors = {
  Low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  Medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  High: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
};

const statusColors = {
  Pending: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  "In Progress": "bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300",
  Completed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
};

const formatDueDate = (dueDate) => {
  if (!dueDate) return null;
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return null;
  return format(d, "MMM dd, yyyy");
};

const TaskCard = ({ task, onEdit, onView, onStatusChange, onDelete }) => {
  const { user } = useContext(AuthContext);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isAssigned = task.assignedTo?.some((u) => u._id === user?._id);
  const canEdit = isAssigned;
  const canDelete = false;
  const canChangeStatus = isAssigned;

  const handleDelete = async () => {
    await onDelete?.(task._id);
    setShowDeleteConfirm(false);
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    await onStatusChange(task._id, newStatus);
    setIsUpdating(false);
  };

  const dueDateObj = useMemo(() => {
    const d = new Date(task?.dueDate);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [task?.dueDate]);

  const isOverdue =
    !!dueDateObj && dueDateObj < new Date() && task.status !== "Completed";
  const isCompleted = task.status === "Completed";

  return (
    <div
      onClick={() => onView?.(task)}
      className="group cursor-pointer relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/75 bg-white/80 backdrop-blur-sm text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-200 dark:border-slate-800/75 dark:bg-slate-900/80 dark:hover:border-indigo-500/30"
    >
      {/* Top subtle highlight line for status */}
      <div
        className={`absolute top-0 left-0 w-full h-1 ${
          isCompleted
            ? "bg-emerald-500"
            : task.status === "In Progress"
              ? "bg-blue-500"
              : "bg-slate-200 dark:bg-slate-700"
        }`}
      />

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[1.05rem] font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {task.title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {task.description || "No description provided"}
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="rounded-md p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                aria-label="Edit task"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="rounded-md p-1.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                aria-label="Delete task"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                task.priority === "High"
                  ? "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-900/20 dark:text-rose-400 dark:ring-rose-500/30"
                  : task.priority === "Medium"
                    ? "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-500/30"
                    : "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-500/30"
              }`}
            >
              <FlagIcon className="mr-1 h-3 w-3" />
              {task.priority}
            </span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                task.status === "Pending"
                  ? "bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700"
                  : task.status === "In Progress"
                    ? "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-500/30"
                    : "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-500/30"
              }`}
            >
              {task.status}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div
              className={`flex items-center gap-1.5 ${
                isOverdue ? "text-red-600 dark:text-red-400 font-medium" : ""
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{formatDueDate(task?.dueDate) ?? "No due date"}</span>
            </div>

            <div className="flex items-center gap-3">
              {task.attachments?.length > 0 && (
                <div
                  className="flex items-center gap-1"
                  title={`${task.attachments.length} attachments`}
                >
                  <PaperClipIcon className="h-3.5 w-3.5" />
                  <span>{task.attachments.length}</span>
                </div>
              )}
              {task.assignedTo?.length > 0 && (
                <div
                  className="flex items-center gap-1"
                  title={`${task.assignedTo.length} assigned`}
                >
                  <UserGroupIcon className="h-3.5 w-3.5" />
                  <span>{task.assignedTo.length}</span>
                </div>
              )}
            </div>
          </div>

          {task.progress > 0 && !isCompleted && (
            <div className="mt-1 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-500 ease-out"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {canChangeStatus && !isCompleted && (
          <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            {task.status === "Pending" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusUpdate("In Progress");
                }}
                disabled={isUpdating}
                className="w-full rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-slate-700 dark:hover:text-blue-400 dark:hover:border-blue-800 disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Start Task"}
              </button>
            )}
            {task.status === "In Progress" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusUpdate("Completed");
                }}
                disabled={isUpdating}
                className="w-full rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-slate-700 dark:hover:text-emerald-400 dark:hover:border-emerald-800 disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Mark as Complete"}
              </button>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-fade-in dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-center text-slate-900 dark:text-white mb-2">
                Delete Task
              </h3>
              <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  "{task.title}"
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="btn-danger w-full sm:w-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default TaskCard;
