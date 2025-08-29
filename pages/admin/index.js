"use client";
import React, { useState, useEffect } from "react";
import { FaUser, FaLock } from "react-icons/fa";

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
      fetchTransactions(token);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "https://bkash-project-backend.vercel.app/api/v1/admin/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("accessToken", data.accessToken);
        setIsLoggedIn(true);
        fetchTransactions(data.accessToken);
      } else {
        alert(data.message || "❌ Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("❌ Server error, please try again!");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (token) => {
    setFetching(true);
    try {
      const res = await fetch(
        "https://bkash-project-backend.vercel.app/api/v1/users/get-users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      console.log("transaction data", data);
      if (res.ok && data.success) {
        // filter only those who have paymentId
        const paidUsers = data.data.filter((u) => u.paymentId);
        setTransactions(paidUsers);
      } else {
        console.error("Fetch Users Error:", data);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setFetching(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    setTransactions([]);
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
            {/* <a href="#" className="block px-4 py-2 rounded hover:bg-blue-600">
              Volunteers
            </a>
            <a href="#" className="block px-4 py-2 rounded hover:bg-blue-600">
              Form Submissions
            </a>
            <a href="#" className="block px-4 py-2 rounded hover:bg-blue-600">
              Settings
            </a> */}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navbar */}
          <header className="h-16 bg-white shadow flex items-center justify-between px-6">
            <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            <div className="flex items-center gap-4">
              {/* <input
                type="text"
                placeholder="Search..."
                className="border rounded px-3 py-1"
              /> */}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-1 rounded"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="flex-1 p-6 overflow-y-auto text-gray-700">
            <h2 className="text-xl font-bold mb-4">Transactions</h2>
            <div className="bg-white rounded shadow overflow-hidden">
              <div className="p-4 flex justify-between items-center border-b">
                <span className="font-semibold">Transaction List</span>
              </div>
              {fetching ? (
                <p className="p-4 text-gray-500">Loading transactions...</p>
              ) : transactions.length > 0 ? (
                <table className="w-full table-auto">
                  <thead className="bg-gray-100 text-sm text-left">
                    <tr>
                      <th className="px-4 py-2">Transaction ID</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Donation Materials</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((user) => (
                      <tr
                        key={user.paymentId._id}
                        className="hover:bg-gray-50 text-sm"
                      >
                        <td className="px-4 py-2">
                          {user.paymentId.transactionId}
                        </td>
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">
                          {user.donationMaterials || "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          {user.paymentId.amount} {user.paymentId.currency}
                        </td>
                        <td
                          className={`px-4 py-2 font-semibold ${
                            user.paymentId.status === "SUCCESS"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {user.paymentId.status}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(user.paymentId.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-4 text-gray-500">No transactions found</p>
              )}
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
            Email
          </label>
          <div className="flex items-center border rounded px-3">
            <FaUser className="text-gray-400 mr-2" />
            <input
              type="email"
              placeholder="your@gmail.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="w-full py-2 outline-none text-gray-500"
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
              className="w-full py-2 outline-none text-gray-500"
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
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Use admin credentials to log in
        </p>
      </form>
    </div>
  );
}
