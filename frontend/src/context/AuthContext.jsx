import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import authService from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem("token");
          console.error("Failed to load user:", error);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        profileImageUrl: data.profileImageUrl,
      });
      localStorage.setItem("token", data.token);
      toast.success("Login successful!");
      navigate("/dashboard");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false, error: error.response?.data?.message };
    }
  };
  const signup = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        profileImageUrl: data.profileImageUrl,
      });
      localStorage.setItem("token", data.token);
      toast.success("Account created successfully!");
      navigate("/dashboard");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const updateProfile = async (userData) => {
    try {
      const data = await authService.updateProfile(userData);
      setUser((prev) => ({ ...prev, ...data }));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      toast.success("Profile updated successfully!");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
