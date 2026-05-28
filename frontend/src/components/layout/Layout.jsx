import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import ProfileModal from "../profile/ProfileModal";

const Layout = ({ children }) => {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return (
      saved === "true" ||
      (saved === null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Prevent scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  // Keyboard shortcut for sidebar toggle (Ctrl+B or Cmd+B)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Define navigation based on user role (without mutation)
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Tasks", href: "/tasks", icon: ClipboardDocumentListIcon },
    ...(user?.role === "Admin"
      ? [{ name: "Users", href: "/users", icon: UserGroupIcon }]
      : []),
  ];

  const pageTitle =
    navigation.find((item) => item.href === location.pathname)?.name ||
    "Dashboard";

  const isActive = (path) => location.pathname === path;

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render layout (redirect should happen in parent)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="h-full flex flex-col justify-between">
          {/* Sidebar Header */}
          <div>
            <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                    Task Manager
                  </h1>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  aria-label="Close sidebar"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="px-4 py-6 space-y-2" aria-label="Main navigation">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 ${
                    isActive(item.href)
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  <item.icon className="h-5 w-5 mr-3" aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-5">
            {/* Theme Toggle & Logout */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <SunIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <MoonIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Logout"
              >
                <ArrowRightOnRectangleIcon
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Logout
              </button>
            </div>

            {/* User Info & Profile */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-600 text-white text-lg font-semibold">
                  {user.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs uppercase text-slate-500 dark:text-slate-400">
                    {user.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
                aria-label="Profile Settings"
                title="Profile Settings"
              >
                <Cog6ToothIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 lg:hidden"
                aria-label="Open menu"
              >
                <Bars3Icon className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-slate-950 dark:text-white">
                  {pageTitle}
                </h2>
              </div>
            </div>
            <div className="hidden max-w-[40%] truncate text-sm text-slate-500 dark:text-slate-400 sm:block">
              {user.name
                ? `Welcome back, ${user.name.split(" ")[0]}`
                : "Welcome back"}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main>{children}</main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          user={user}
          onUpdateUser={(updatedUser) => {
            // Handle user update if needed
            // You might want to implement this in your AuthContext
            console.log("User updated:", updatedUser);
          }}
        />
      )}
    </div>
  );
};

export default Layout;
