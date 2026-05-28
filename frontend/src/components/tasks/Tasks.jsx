import React, { useState, useEffect, useContext } from "react";
import TaskList from "./TaskList";
import TaskFilters from "../dashboard/TaskFilters";
import TaskModal from "./TaskModal";
import taskService from "../../services/taskService";
import { PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
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
  };

  const handleTaskCreated = () => {
    setShowTaskModal(false);
    fetchTasks();
  };

  const handleTaskUpdated = () => {
    setEditingTask(null);
    fetchTasks();
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      if (newStatus) {
        await taskService.updateTaskStatus(taskId, newStatus);
        toast.success("Task status updated");
      }
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      toast.success("Task deleted successfully");
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status?.toLowerCase() === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
            All Tasks
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Track your tasks in a clean, easy view. Click any card to open and
            edit the task.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <TaskFilters currentFilter={filter} onFilterChange={setFilter} />
          {isAdmin && (
            <button
              onClick={handleCreateTask}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              New Task
            </button>
          )}
        </div>
      </div>

      <TaskList
        tasks={filteredTasks}
        loading={loading}
        onEdit={handleEditTask}
        onView={handleEditTask}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteTask}
        showAddCard={isAdmin}
        onCreate={handleCreateTask}
      />

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          onSuccess={editingTask ? handleTaskUpdated : handleTaskCreated}
        />
      )}
    </div>
  );
};

export default Tasks;
