import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  validateEmail,
  validatePassword,
  validateName,
} from "../../utils/validations";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Member",
    adminInvitation: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signup } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If role is selected as Admin, we'll need the invitation code
    if (name === "role") {
      setFormData({
        ...formData,
        role: value,
        // Clear adminInvitation if role is not Admin
        adminInvitation: value === "Admin" ? formData.adminInvitation : "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!validateName(formData.name)) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.role === "Admin" && !formData.adminInvitation) {
      newErrors.adminInvitation = "Admin invitation code is required";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const signupData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      adminInvitation:
        formData.role === "Admin" ? formData.adminInvitation : undefined,
    };

    await signup(signupData);
    setLoading(false);
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-50 px-3 py-6 dark:bg-slate-950 sm:px-6 sm:py-12 lg:px-8">
      <div className="w-full max-w-md animate-fade-in rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-sm font-semibold uppercase text-indigo-600">
            Create account
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl">
            Get started
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Join your team and manage tasks with a modern workflow.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="input-field"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input-field"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input-field"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {formData.role === "Admin"
                  ? "Admin users can manage tasks for the whole team."
                  : "Members can manage their assigned tasks."}
              </p>
            </div>

            {formData.role === "Admin" && (
              <div>
                <label
                  htmlFor="adminInvitation"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Admin invitation code
                </label>
                <input
                  id="adminInvitation"
                  name="adminInvitation"
                  type="text"
                  className="input-field"
                  placeholder="Enter invitation code"
                  value={formData.adminInvitation}
                  onChange={handleChange}
                />
                {errors.adminInvitation && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.adminInvitation}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
