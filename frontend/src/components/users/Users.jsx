import React, { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import {
  ArrowPathIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  PlusIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";

const Users = () => {
  const { user: currentUser } = useContext(AuthContext);

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member",
    profileImageUrl: "",
    adminInvitation: "",
  });

  const [createErrors, setCreateErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users");

      setUsers(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchUsers();
      toast.success("Users refreshed");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    const errors = {};

    if (!createForm.name.trim()) {
      errors.name = "Name is required";
    }

    if (!createForm.email.trim()) {
      errors.email = "Email is required";
    }

    if (!createForm.password.trim()) {
      errors.password = "Password is required";
    }

    setCreateErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      setCreating(true);

      await api.post("/users", createForm);

      toast.success("User created successfully");

      await fetchUsers();

      setShowCreateModal(false);

      setCreateForm({
        name: "",
        email: "",
        password: "",
        role: "Member",
        profileImageUrl: "",
        adminInvitation: "",
      });
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-900 border-t-transparent dark:border-indigo-500 dark:border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
              Team Members
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage organization users and monitor workload.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary gap-2 disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                New User
              </button>
            )}
          </div>
        </div>

        {users.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white py-20 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />

            <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
              No users found
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              There are currently no users in the system.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {users.map((member) => (
              <div
                key={member._id}
                onClick={() => {
                  setSelectedUser(member);
                  setShowDetailsModal(true);
                }}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-lg font-semibold text-white sm:h-12 sm:w-12">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-slate-950 dark:text-white">
                        {member.name}
                      </h3>

                      <div className="mt-1 flex min-w-0 items-center gap-1">
                        <EnvelopeIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />

                        <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
                      member.role?.toLowerCase() === "admin"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {member.role}
                  </span>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BriefcaseIcon className="h-4 w-4 text-gray-400" />

                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Task Overview
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
                    <div>
                      <p className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                        {member.pendingTasks || 0}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">Pending</p>
                    </div>

                    <div>
                      <p className="text-xl font-bold text-blue-600 sm:text-2xl">
                        {member.inProgressTasks || 0}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">In Progress</p>
                    </div>

                    <div>
                      <p className="text-xl font-bold text-green-600 sm:text-2xl">
                        {member.completedTasks || 0}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showDetailsModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <div className="max-h-[100svh] w-full max-w-lg overflow-y-auto rounded-t-lg bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-lg dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6 dark:border-slate-800">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-slate-950 dark:text-white">
                    {selectedUser.name}
                  </h2>
                  <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                    {selectedUser.email}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  aria-label="Close user details"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xl font-semibold text-white">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Role
                    </p>
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {selectedUser.role}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="text-xl font-semibold text-slate-950 dark:text-white">
                      {selectedUser.pendingTasks || 0}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Pending
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="text-xl font-semibold text-blue-600">
                      {selectedUser.inProgressTasks || 0}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      In Progress
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="text-xl font-semibold text-green-600">
                      {selectedUser.completedTasks || 0}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Completed
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-secondary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <div className="max-h-[100svh] w-full max-w-lg overflow-y-auto rounded-t-lg bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-lg dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                  Create User
                </h2>

                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  aria-label="Close create user"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-5 p-4 sm:p-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>

                  <input
                    type="text"
                    className="input-field"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        name: e.target.value,
                      })
                    }
                  />

                  {createErrors.name && (
                    <p className="text-xs text-red-600 mt-1">
                      {createErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>

                  <input
                    type="email"
                    className="input-field"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>

                  <input
                    type="password"
                    className="input-field"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        password: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Role
                  </label>

                  <select
                    className="input-field"
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        role: e.target.value,
                      })
                    }
                  >
                    <option>Member</option>
                    <option>Admin</option>
                  </select>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-end dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating}
                    className="btn-primary disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
