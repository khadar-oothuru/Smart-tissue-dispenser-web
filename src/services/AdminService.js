import axios from "axios";
import config from "../config/config";

class AdminService {
  constructor() {
    this.authContext = null;
    this.baseURL = config.API_URL;
  }

  // Set auth context (similar to the React Native version)
  setAuthContext(authContext) {
    this.authContext = authContext;
    console.log("AdminService: Auth context set", {
      user: authContext?.user?.email,
      hasToken: !!authContext?.accessToken,
    });
  }

  // Helper to get auth headers
  getAuthHeaders() {
    if (!this.authContext?.accessToken) {
      throw new Error("No access token available");
    }
    return {
      Authorization: `Bearer ${this.authContext.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  // Helper to handle API errors
  handleError(error, defaultMessage) {
    console.error("AdminService API Error:", error);
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      defaultMessage;
    throw new Error(message);
  }

  // Fetch users (with pagination support)
  async fetchUsers() {
    try {
      console.log("AdminService: Fetching users...");
      const response = await axios.get(`${this.baseURL}/auth/admin/users/`, {
        headers: this.getAuthHeaders(),
      });
      console.log("AdminService: Users fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, "Failed to fetch users");
    }
  }

  // Fetch admin statistics
  async fetchAdminStats() {
    try {
      console.log("AdminService: Fetching admin stats...");
      const response = await axios.get(`${this.baseURL}/auth/admin/stats/`, {
        headers: this.getAuthHeaders(),
      });
      console.log("AdminService: Stats fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, "Failed to fetch admin statistics");
    }
  }

  // Fetch admin profile
  async fetchAdminProfile() {
    try {
      console.log("AdminService: Fetching admin profile...");
      const response = await axios.get(`${this.baseURL}/auth/admin/profile/`, {
        headers: this.getAuthHeaders(),
      });
      console.log(
        "AdminService: Admin profile fetched successfully:",
        response.data
      );
      return response.data;
    } catch (error) {
      this.handleError(error, "Failed to fetch admin profile");
    }
  }

  // Update user status (activate/deactivate)
  async updateUserStatus(userId, isActive) {
    try {
      console.log(`AdminService: Updating user ${userId} status to:`, isActive);
      const response = await axios.patch(
        `${this.baseURL}/auth/admin/users/${userId}/`,
        { is_active: isActive },
        {
          headers: this.getAuthHeaders(),
        }
      );
      console.log("AdminService: User status updated successfully");
      return response.data;
    } catch (error) {
      this.handleError(error, "Failed to update user status");
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      console.log(`AdminService: Deleting user ${userId}...`);
      const response = await axios.delete(
        `${this.baseURL}/auth/admin/users/${userId}/delete/`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      console.log("AdminService: User deleted successfully");
      return response.data;
    } catch (error) {
      this.handleError(error, "Failed to delete user");
    }
  }

  // Create new user
  async createUser(userData) {
    try {
      console.log("AdminService: Creating new user...");
      const response = await axios.post(
        `${this.baseURL}/auth/admin/users/`,
        userData,
        {
          headers: this.getAuthHeaders(),
        }
      );
      console.log("AdminService: User created successfully");
      return response.data;
    } catch (error) {
      this.handleError(error, "Failed to create user");
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      console.log(`AdminService: Updating user ${userId}...`);
      const response = await axios.patch(
        `${this.baseURL}/auth/admin/users/${userId}/`,
        userData,
        {
          headers: this.getAuthHeaders(),
        }
      );
      console.log("AdminService: User updated successfully");
      return response.data;
    } catch (error) {
      this.handleError(error, "Failed to update user");
    }
  }

  // Update user role
  async updateUserRole(userId, newRole) {
    try {
      console.log(`AdminService: Updating user ${userId} role to ${newRole}...`);
      const response = await axios.patch(
        `${this.baseURL}/auth/admin/users/${userId}/role/`,
        { role: newRole },
        {
          headers: this.getAuthHeaders(),
        }
      );
      console.log("AdminService: User role updated successfully");
      return response.data;
    } catch (error) {
      this.handleError(error, "Failed to update user role");
    }
  }

  // Fetch app logs
  async fetchAppLogs(page = 1, limit = 50) {
    try {
      console.log("AdminService: Fetching app logs...");
      const response = await axios.get(
        `${this.baseURL}/auth/admin/logs/?page=${page}&limit=${limit}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      console.log("AdminService: App logs fetched successfully");
      return response.data;
    } catch (error) {
      this.handleError(error, "Failed to fetch app logs");
    }
  }

  // Update admin profile
  async updateAdminProfile(profileData) {
    try {
      console.log("AdminService: Updating admin profile...");
      const response = await axios.patch(
        `${this.baseURL}/auth/admin/profile/`,
        profileData,
        {
          headers: this.getAuthHeaders(),
        }
      );
      console.log("AdminService: Admin profile updated successfully");
      return response.data;
    } catch (error) {
      this.handleError(error, "Failed to update admin profile");
    }
  }
}

// Export singleton instance
const adminService = new AdminService();
export default adminService;
