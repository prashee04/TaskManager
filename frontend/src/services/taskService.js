import api from "./api";

const taskService = {
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/tasks${params ? `?${params}` : ""}`);
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  updateTaskStatus: async (id, status) => {
    const response = await api.put(`/tasks/${id}/status`, { status });
    return response.data;
  },

  updateTaskChecklist: async (id, todoChecklist) => {
    const response = await api.put(`/tasks/${id}/todo`, { todoChecklist });
    return response.data;
  },

  getDashboardData: async () => {
    const response = await api.get("/tasks/dashboard-data");
    return response.data;
  },

  getUserDashboardData: async () => {
    const response = await api.get("/tasks/user-dashboard-data");
    return response.data;
  },
};

export default taskService;
