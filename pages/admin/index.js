"use client";
import React, { useState, useEffect } from "react";
import { FaUser, FaLock } from "react-icons/fa";

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin");
    if (adminStatus === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const adminUser = "admin";
    const adminPass = "1234";

    if (formData.username === adminUser && formData.password === adminPass) {
      localStorage.setItem("isAdmin", "true");
      setIsLoggedIn(true);
    } else {
      alert("❌ Invalid Credentials");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    setIsLoggedIn(false);
  };

  // 🚀 Show Dashboard if Logged in
  if (isLoggedIn) {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-blue-700 text-white flex flex-col">
          <div className="p-4 text-2xl font-bold border-b border-blue-600">
            Admin Panel
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <a href="#" className="block px-4 py-2 rounded hover:bg-blue-600">
              Dashboard
            </a>
            <a href="#" className="block px-4 py-2 rounded hover:bg-blue-600">
              Volunteers
            </a>
            <a href="#" className="block px-4 py-2 rounded hover:bg-blue-600">
              Form Submissions
            </a>
            <a href="#" className="block px-4 py-2 rounded hover:bg-blue-600">
              Settings
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navbar */}
          <header className="h-16 bg-white shadow flex items-center justify-between px-6">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search..."
                className="border rounded px-3 py-1"
              />
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-1 rounded"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Volunteers</h2>
            <div className="bg-white rounded shadow overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b">
                <span className="font-semibold">Volunteer List</span>
                <button className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
                  + New Volunteer
                </button>
              </div>
              <table className="w-full table-auto">
                <thead className="bg-gray-100 text-sm text-left">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Creator</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50 text-sm">
                    <td className="px-4 py-2">2</td>
                    <td className="px-4 py-2">Shahin Alam</td>
                    <td className="px-4 py-2">shahin@gmail.com</td>
                    <td className="px-4 py-2">Super Admin</td>
                    <td className="px-4 py-2 space-x-2">
                      <button className="text-blue-600 hover:underline">
                        Edit
                      </button>
                      <button className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 🔐 Login Screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm"
      >
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6 flex items-center justify-center gap-2">
          🔐 Admin Login
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <div className="flex items-center border rounded px-3">
            <FaUser className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="admin"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              className="w-full py-2 outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="flex items-center border rounded px-3">
            <FaLock className="text-gray-400 mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="w-full py-2 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-blue-500 ml-2"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Sign In
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Demo Login → <strong>admin / 1234</strong>
        </p>
      </form>
    </div>
  );
}
