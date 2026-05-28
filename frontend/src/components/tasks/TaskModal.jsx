import React, { useState, useEffect, useContext } from "react";
import { AiOutlineClose, AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import taskService from "../../services/taskService";
import toast from "react-hot-toast";

const TaskModal = ({ task, viewOnly = false, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Pending",
    dueDate: "",
    assignedTo: [],
    attachments: [],
    todoChecklist: [
      {
        text: "",
        completed: false,
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "Medium",
        status: task.status || "Pending",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        assignedTo: Array.isArray(task.assignedTo)
          ? task.assignedTo.map((member) =>
              typeof member === "string" ? member : member._id,
            )
          : [],
        attachments: Array.isArray(task.attachments) ? task.attachments : [],
        todoChecklist:
          Array.isArray(task.todoChecklist) && task.todoChecklist.length > 0
            ? task.todoChecklist.map((item) => ({
                text: item.text || "",
                completed: item.completed || false,
              }))
            : [
                {
                  text: "",
                  completed: false,
                },
              ],
      });
    }
  }, [task]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch members:", error);
        toast.error("Unable to load task assignees");
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    // Check if due date is in the past (warning only)
    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      toast.error("Due date cannot be in the past");
      newErrors.dueDate = "Due date cannot be in the past";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, options, type, checked } = e.target;

    if (name === "assignedTo") {
      if (Array.isArray(value)) {
        setFormData({
          ...formData,
          assignedTo: value,
        });
        return;
      }

      if (options) {
        const selectedValues = Array.from(options)
          .filter((option) => option.selected)
          .map((option) => option.value);
        setFormData({
          ...formData,
          assignedTo: selectedValues,
        });
        return;
      }

      setFormData({
        ...formData,
        assignedTo: value ? [value] : [],
      });
      return;
    }

    if (name === "attachments") {
      const urls = value
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url !== "");
      setFormData({
        ...formData,
        attachments: urls,
      });
      return;
    }

    if (name.startsWith("checklistText_")) {
      const index = Number(name.split("_")[1]);
      const nextChecklist = [...formData.todoChecklist];
      nextChecklist[index].text = value;
      setFormData({
        ...formData,
        todoChecklist: nextChecklist,
      });
      return;
    }

    if (name.startsWith("checklistCompleted_")) {
      const index = Number(name.split("_")[1]);
      const nextChecklist = [...formData.todoChecklist];
      nextChecklist[index].completed = checked;
      setFormData({
        ...formData,
        todoChecklist: nextChecklist,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const addChecklistItem = () => {
    setFormData({
      ...formData,
      todoChecklist: [
        ...formData.todoChecklist,
        { text: "", completed: false },
      ],
    });
  };

  const removeChecklistItem = (index) => {
    const nextChecklist = formData.todoChecklist.filter(
      (_, idx) => idx !== index,
    );
    setFormData({
      ...formData,
      todoChecklist: nextChecklist.length
        ? nextChecklist
        : [{ text: "", completed: false }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate,
        attachments: formData.attachments,
        todoChecklist: formData.todoChecklist.filter((item) =>
          item.text.trim(),
        ),
      };

      // Only include status if editing
      if (task) {
        payload.status = formData.status;
      }

      // Only admins can assign tasks
      if (isAdmin && Array.isArray(formData.assignedTo)) {
        payload.assignedTo = formData.assignedTo;
      }

      if (task) {
        await taskService.updateTask(task._id, payload);
        toast.success("Task updated successfully");
      } else {
        await taskService.createTask(payload);
        toast.success("Task created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Operation failed:", error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="card hide-scrollbar max-h-[100svh] w-full max-w-2xl animate-slide-up overflow-y-auto rounded-none p-0 sm:max-h-[90vh] sm:rounded-lg">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-indigo-600 sm:text-sm">
              Task Details
            </p>
            <h2 className="mt-2 truncate text-xl font-semibold text-slate-950 sm:text-2xl dark:text-white">
              {viewOnly ? "View Task" : task ? "Edit Task" : "Create New Task"}
            </h2>
          </div>
          {viewOnly && (
            <span className="hidden shrink-0 items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200 sm:inline-flex">
              Read only view
            </span>
          )}
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close modal"
          >
            <AiOutlineClose className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            if (viewOnly) {
              e.preventDefault();
            } else {
              handleSubmit(e);
            }
          }}
          className="space-y-5 p-4 sm:p-6"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter task title"
              autoFocus={!viewOnly}
              disabled={viewOnly}
              required
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 animate-fade-in">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="input-field"
              placeholder="Enter task description (optional)"
              disabled={viewOnly}
              required
            />
          </div>

          {/* Priority and Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-field"
                disabled={viewOnly}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {task && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                  disabled={viewOnly}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="input-field"
              min={new Date().toISOString().split("T")[0]}
              disabled={viewOnly}
              required
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attachments (URLs)
            </label>
            <input
              type="text"
              name="attachments"
              value={formData.attachments.join(", ")}
              onChange={handleChange}
              className="input-field"
              placeholder="https://example.com/file.pdf, https://example.com/image.jpg"
              disabled={viewOnly}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Separate multiple URLs with commas
            </p>
            {formData.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.attachments.map((url, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-indigo-600 dark:text-indigo-400 truncate"
                  >
                    {url}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Todo Checklist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Todo Checklist
            </label>
            <div className="space-y-3">
              {formData.todoChecklist.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3"
                >
                  <input
                    type="checkbox"
                    name={`checklistCompleted_${index}`}
                    checked={item.completed}
                    onChange={handleChange}
                    className="mt-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={viewOnly}
                  />
                  <input
                    type="text"
                    name={`checklistText_${index}`}
                    value={item.text}
                    onChange={handleChange}
                    className="flex-1 input-field"
                    placeholder={`Checklist item ${index + 1}`}
                    disabled={viewOnly}
                    required
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChecklistItem(index);
                    }}
                    className="mt-2 text-red-600 hover:text-red-800 transition-colors"
                    aria-label="Remove item"
                    disabled={viewOnly}
                  >
                    <AiOutlineDelete className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {!viewOnly && (
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 transition-colors"
                >
                  <AiOutlinePlus className="h-4 w-4" />
                  Add checklist item
                </button>
              )}
            </div>
          </div>

          {/* Assign to Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign to Member(s)
            </label>
            {isAdmin && !viewOnly ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {users.map((member) => {
                    const checked = formData.assignedTo.includes(member._id);
                    return (
                      <label
                        key={member._id}
                        className="inline-flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:bg-slate-900"
                      >
                        <input
                          type="checkbox"
                          name="assignedTo"
                          value={member._id}
                          checked={checked}
                          onChange={(e) => {
                            const nextSelection = e.target.checked
                              ? [...formData.assignedTo, member._id]
                              : formData.assignedTo.filter(
                                  (selectedId) => selectedId !== member._id,
                                );
                            handleChange({
                              target: {
                                name: "assignedTo",
                                value: nextSelection,
                              },
                            });
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="min-w-0">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {member.name}
                          </span>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {member.email}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {formData.assignedTo.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selected members:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.assignedTo.map((id) => {
                        const member = users.find((u) => u._id === id);
                        return member ? (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200"
                          >
                            {member.name}
                            <button
                              type="button"
                              onClick={() => {
                                const newSelection = formData.assignedTo.filter(
                                  (selectedId) => selectedId !== id,
                                );
                                handleChange({
                                  target: {
                                    name: "assignedTo",
                                    value: newSelection,
                                  },
                                });
                              }}
                              className="text-blue-900 hover:text-blue-700"
                            >
                              x
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-600 dark:text-gray-300">
                {task?.assignedTo?.length > 0 ? (
                  <div>
                    <p className="font-medium mb-1">Assigned to:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {task.assignedTo.map((member, idx) => (
                        <li key={idx}>
                          {typeof member === "string" ? member : member.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  "Only admins can assign members to tasks. This task is currently unassigned."
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 -mx-4 mt-4 flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 sm:-mx-6 sm:flex-row sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              {viewOnly ? "Close" : "Cancel"}
            </button>
            {!viewOnly && (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : task ? (
                  "Update Task"
                ) : (
                  "Create Task"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
