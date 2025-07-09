import React, { useState } from "react";
// import { useAuth } from "../../hooks/useAuth"; // Will be used when connecting to API
import { useTheme } from "../../context/ThemeContext";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  UserCog,
} from "lucide-react";
import RoleChangeModal from "./RoleChangeModal";
import UserProfileModal from "./UserProfileModal";
import UserItem from "./UserItem";
import UserItemClean from "./UserItemClean";

const UserManagement = () => {
  // const { accessToken } = useAuth(); // Will be used when connecting to API
  const { themeColors } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // table, cards, clean

  // Mock data for now - will be replaced with API calls
  const [users, setUsers] = useState([
    {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      role: "admin",
      is_active: true,
      last_login: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
      role: "manager",
      is_active: true,
      last_login: "2024-01-14T15:45:00Z",
    },
    {
      id: 3,
      first_name: "Bob",
      last_name: "Johnson",
      email: "bob.johnson@example.com",
      role: "user",
      is_active: false,
      last_login: "2024-01-10T09:20:00Z",
    },
  ]);

  // Mock stats
  const stats = {
    total_users: users.length,
    active_users: users.filter((u) => u.is_active).length,
    admin_count: users.filter((u) => u.role === "admin").length,
    new_users_this_month: 2,
  };

  // Form states
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "user",
    is_active: true,
  });

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" ? user.is_active : !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle user selection
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  // Handle user operations
  const handleAddUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Mock API call
      const newUser = {
        id: Date.now(),
        ...userData,
        last_login: new Date().toISOString(),
      };

      setUsers((prev) => [...prev, newUser]);
      setShowAddModal(false);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "user",
        is_active: true,
      });
    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (userId, userData) => {
    try {
      setLoading(true);
      setError(null);

      // Mock API call
      const updatedUser = { ...userData, id: userId };
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updatedUser : user))
      );
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setLoading(true);
      setError(null);

      // Mock API call
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    } catch (err) {
      setError(err.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedUsers.length} users?`
      )
    )
      return;

    try {
      setLoading(true);
      setError(null);

      // Mock API call
      setUsers((prev) =>
        prev.filter((user) => !selectedUsers.includes(user.id))
      );
      setSelectedUsers([]);
    } catch (err) {
      setError(err.message || "Failed to delete users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      setLoading(true);
      setError(null);

      // Mock API call
      const updatedUser = {
        ...users.find((u) => u.id === userId),
        is_active: isActive,
      };
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updatedUser : user))
      );
    } catch (err) {
      setError(err.message || "Failed to update user status");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  const handleRoleUpdate = (userId, newRole) => {
    try {
      setLoading(true);
      setError(null);

      // Mock API call
      const updatedUser = {
        ...users.find((u) => u.id === userId),
        role: newRole,
      };
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updatedUser : user))
      );
      setShowRoleModal(false);
    } catch (err) {
      setError(err.message || "Failed to update user role");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  // Get role color and icon
  const getRoleConfig = (role) => {
    switch (role) {
      case "admin":
        return { color: "bg-purple-100 text-purple-800", icon: Shield };
      case "manager":
        return { color: "bg-blue-100 text-blue-800", icon: Shield };
      case "user":
        return { color: "bg-green-100 text-green-800", icon: Users };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: Users };
    }
  };

  // Get status color and icon
  const getStatusConfig = (isActive) => {
    return isActive
      ? { color: "bg-green-100 text-green-800", icon: CheckCircle }
      : { color: "bg-red-100 text-red-800", icon: XCircle };
  };

  // Stats cards
  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {trend > 0 ? "+" : ""}
            {trend}% from last month
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl">
            User Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.total_users}
          icon={Users}
          color="bg-blue-100 text-blue-600"
          trend={5}
        />
        <StatCard
          title="Active Users"
          value={stats.active_users}
          icon={CheckCircle}
          color="bg-green-100 text-green-600"
          trend={2}
        />
        <StatCard
          title="Admins"
          value={stats.admin_count}
          icon={Shield}
          color="bg-purple-100 text-purple-600"
          trend={0}
        />
        <StatCard
          title="New This Month"
          value={stats.new_users_this_month}
          icon={UserPlus}
          color="bg-orange-100 text-orange-600"
          trend={12}
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* View Mode & Bulk Actions */}
          <div className="flex space-x-2">
            <div className="flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 text-sm font-medium ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200"} border border-gray-300 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-600`}
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 text-sm font-medium ${viewMode === "cards" ? "bg-blue-600 text-white" : "bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200"} border-t border-b border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("clean")}
                className={`px-4 py-2 text-sm font-medium ${viewMode === "clean" ? "bg-blue-600 text-white" : "bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200"} border border-gray-300 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-600`}
              >
                Clean
              </button>
            </div>

            {selectedUsers.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete ({selectedUsers.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Display */}
      {viewMode === "table" && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => {
                  const roleConfig = getRoleConfig(user.role);
                  const statusConfig = getStatusConfig(user.is_active);
                  const RoleIcon = roleConfig.icon;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
                            onClick={() => handleViewProfile(user)}
                          >
                            <span className="text-sm font-medium text-gray-700">
                              {user.first_name[0]}
                              {user.last_name[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleConfig.color} cursor-pointer`}
                          onClick={() => handleRoleChange(user)}
                        >
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.last_login).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewProfile(user)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View Profile"
                          >
                            <Users className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setFormData({
                                first_name: user.first_name || "",
                                last_name: user.last_name || "",
                                email: user.email || "",
                                phone: user.phone || "",
                                role: user.role || "user",
                                is_active: user.is_active,
                              });
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRoleChange(user)}
                            className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                            title="Change Role"
                          >
                            <UserCog className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleUserStatus(user.id, !user.is_active)
                            }
                            className={
                              user.is_active
                                ? "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            }
                            title={user.is_active ? "Deactivate" : "Activate"}
                          >
                            {user.is_active ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Card View */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserItem 
              key={user.id} 
              user={{
                ...user,
                username: user.username || `${user.first_name.toLowerCase()}.${user.last_name.toLowerCase()}`,
                full_name: `${user.first_name} ${user.last_name}`,
                date_joined_formatted: new Date(user.last_login).toLocaleDateString()
              }} 
              onRoleChange={() => handleRoleChange(user)}
              onDelete={() => handleDeleteUser(user.id)}
              onViewProfile={() => handleViewProfile(user)}
            />
          ))}
        </div>
      )}

      {/* Clean View */}
      {viewMode === "clean" && (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((user) => (
            <UserItemClean 
              key={user.id} 
              user={{
                ...user,
                username: user.username || `${user.first_name.toLowerCase()}.${user.last_name.toLowerCase()}`,
                full_name: `${user.first_name} ${user.last_name}`,
                date_joined_formatted: new Date(user.last_login).toLocaleDateString()
              }} 
              onRoleChange={() => handleRoleChange(user)}
              onDelete={() => handleDeleteUser(user.id)}
              onViewProfile={() => handleViewProfile(user)}
            />
          ))}
        </div>
      )}

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No users found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || filterRole !== "all" || filterStatus !== "all"
              ? "Try adjusting your search or filters."
              : "Get started by creating a new user."}
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Add New User
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddUser(formData);
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create User"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Edit User
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditUser(editingUser.id, formData);
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update User"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <RoleChangeModal
          visible={showRoleModal}
          user={selectedUser}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedUser(null);
          }}
          onRoleUpdate={(newRole) => handleRoleUpdate(selectedUser.id, newRole)}
        />
      )}

      {/* User Profile Modal */}
      {showProfileModal && selectedUser && (
        <UserProfileModal
          visible={showProfileModal}
          user={{
            ...selectedUser,
            username: selectedUser.username || `${selectedUser.first_name.toLowerCase()}.${selectedUser.last_name.toLowerCase()}`,
            date_joined: selectedUser.date_joined || selectedUser.last_login,
            profile_picture: selectedUser.profile_picture || null
          }}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};


export default UserManagement;
