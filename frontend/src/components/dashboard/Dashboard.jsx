import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { AuthContext } from "../../context/AuthContext";
import TaskList from "../tasks/TaskList";
import TaskFilters from "./TaskFilters";
import TaskModal from "../tasks/TaskModal";
import taskService from "../../services/taskService";
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
    toast.success("Dashboard refreshed");
  };

  const handleTaskSuccess = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    setViewOnly(false);
    fetchTasks();
    toast.success(
      editingTask ? "Task updated successfully" : "Task created successfully",
    );
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setViewOnly(false);
    setShowTaskModal(true);
  };

  const handleViewTask = (task) => {
    setEditingTask(task);
    setViewOnly(true);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setViewOnly(false);
    setShowTaskModal(true);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      toast.success("Task status updated");
      await fetchTasks();
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update task status",
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      toast.success("Task deleted successfully");
      await fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error(error.response?.data?.message || "Failed to delete task");
    }
  };

  const filteredTasks = useMemo(
    () =>
      tasks
        .filter((task) => {
          if (filter === "all") return true;
          return task.status?.toLowerCase() === filter;
        })
        .filter(
          (task) =>
            searchTerm === "" ||
            (task.title || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (task.description || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        ),
    [tasks, filter, searchTerm],
  );

  const stats = {
    total: tasks.length,
    completed: tasks.filter(
      (t) => (t.status || "").toLowerCase() === "completed",
    ).length,
    inProgress: tasks.filter(
      (t) => (t.status || "").toLowerCase() === "in progress",
    ).length,
    completionRate:
      tasks.length > 0
        ? Math.round(
            (tasks.filter((t) => (t.status || "").toLowerCase() === "completed")
              .length /
              tasks.length) *
              100,
          )
        : 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 dark:to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none dark:bg-indigo-500/5" />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Tasks Overview
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                Manage workload, track ownership, and monitor delivery status across your team.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-secondary gap-2 disabled:opacity-50 transition-all shadow-sm hover:shadow"
              >
                <ArrowPathIcon
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              {isAdmin && (
                <button
                  onClick={handleCreateTask}
                  className="btn-primary gap-2 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <PlusIcon className="h-4 w-4" />
                  New Task
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          <div className="card relative overflow-hidden group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-12 h-12 text-slate-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Tasks
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="card relative overflow-hidden group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              In Progress
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {stats.inProgress}
            </p>
          </div>
          <div className="card relative overflow-hidden group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Completed
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {stats.completed}
            </p>
          </div>
          <div className="card relative overflow-hidden group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Completion Rate
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {stats.completionRate}%
              </p>
            </div>
            {/* Tiny progress bar */}
            <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${stats.completionRate}%` }} 
              />
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border-0 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-2.5 pl-11 text-sm text-slate-900 placeholder:text-slate-500 outline-none ring-1 ring-inset ring-slate-200/60 dark:ring-slate-800/60 focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-shadow dark:text-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="h-4 w-4 text-slate-500" />
                </button>
              )}
            </div>

            <div className="h-px w-full bg-slate-200/60 dark:bg-slate-800/60 lg:h-8 lg:w-px" />
            
            <TaskFilters currentFilter={filter} onFilterChange={setFilter} />
          </div>
        </div>

        <TaskList
          tasks={filteredTasks}
          loading={loading}
          onEdit={handleEditTask}
          onView={handleViewTask}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteTask}
          searchTerm={searchTerm}
          onClearSearch={() => setSearchTerm("")}
        />

        {showTaskModal && (
          <TaskModal
            task={editingTask}
            viewOnly={viewOnly}
            onClose={() => {
              setShowTaskModal(false);
              setEditingTask(null);
              setViewOnly(false);
            }}
            onSuccess={handleTaskSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
