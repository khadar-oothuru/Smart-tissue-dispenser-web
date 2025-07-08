import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Moon,
  Sun,
  Monitor,
  Palette,
  Database,
  Globe,
  Wifi,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  RefreshCw,
  Save,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Key,
  Mail,
  Phone,
  MapPin,
  Building,
  Users,
  FileText,
  Download,
  Upload,
  RotateCcw,
  Zap,
  Power,
  Battery,
  WifiOff,
  Server,
  HardDrive,
  Network,
  ShieldCheck,
  ShieldAlert,
  Settings2,
  Cog,
  Sliders,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const Settings = () => {
  const { accessToken, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Settings states
  const [generalSettings, setGeneralSettings] = useState({
    systemName: "Smart Tissue Management System",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    language: "English",
    autoRefresh: true,
    refreshInterval: 30,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    alertNotifications: true,
    maintenanceNotifications: true,
    reportNotifications: false,
    quietHours: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    lockoutDuration: 15,
    requireStrongPassword: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    dataRetention: 365,
    backupFrequency: "daily",
    autoBackup: true,
    logLevel: "info",
    debugMode: false,
    maintenanceMode: false,
  });

  // Profile states
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    organization: user?.organization || "",
    role: user?.role || "admin",
  });

  // System info
  const [systemInfo, setSystemInfo] = useState({
    version: "1.0.0",
    lastUpdate: new Date().toISOString(),
    uptime: "99.9%",
    totalDevices: 0,
    activeDevices: 0,
    totalUsers: 0,
    databaseSize: "2.5 GB",
    storageUsed: "45%",
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadSystemInfo();
  }, []);

  // Load settings from backend/localStorage
  const loadSettings = async () => {
    try {
      setLoading(true);
      // This would load settings from backend
      // For now, using default values
      console.log("Loading settings...");
    } catch (error) {
      console.error("Failed to load settings:", error);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // Load system information
  const loadSystemInfo = async () => {
    try {
      // This would fetch system info from backend
      console.log("Loading system info...");
    } catch (error) {
      console.error("Failed to load system info:", error);
    }
  };

  // Save settings
  const saveSettings = async (settingsType, data) => {
    try {
      setSaving(true);
      setError(null);

      // This would save settings to backend
      console.log(`Saving ${settingsType} settings:`, data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(`${settingsType} settings saved successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    await saveSettings("profile", profileData);
  };

  // Handle general settings update
  const handleGeneralSettingsUpdate = async () => {
    await saveSettings("general", generalSettings);
  };

  // Handle notification settings update
  const handleNotificationSettingsUpdate = async () => {
    await saveSettings("notifications", notificationSettings);
  };

  // Handle security settings update
  const handleSecuritySettingsUpdate = async () => {
    await saveSettings("security", securitySettings);
  };

  // Handle system settings update
  const handleSystemSettingsUpdate = async () => {
    await saveSettings("system", systemSettings);
  };

  // Settings section component
  const SettingsSection = ({ title, description, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );

  // Setting item component
  const SettingItem = ({ label, description, children }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );

  // Tab navigation
  const renderTabButton = (tabKey, title, icon) => {
    const Icon = icon;
    return (
      <button
        onClick={() => setActiveTab(tabKey)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === tabKey
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span>{title}</span>
      </button>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <SettingsSection
              title="General Settings"
              description="Configure basic system preferences and appearance"
            >
              <div className="space-y-4">
                <SettingItem
                  label="System Name"
                  description="Display name for the system"
                >
                  <input
                    type="text"
                    value={generalSettings.systemName}
                    onChange={(e) =>
                      setGeneralSettings((prev) => ({
                        ...prev,
                        systemName: e.target.value,
                      }))
                    }
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </SettingItem>

                <SettingItem
                  label="Theme"
                  description="Choose your preferred color scheme"
                >
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleTheme("light")}
                      className={`p-2 rounded-lg ${
                        theme === "light"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleTheme("dark")}
                      className={`p-2 rounded-lg ${
                        theme === "dark"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleTheme("system")}
                      className={`p-2 rounded-lg ${
                        theme === "system"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Monitor className="h-4 w-4" />
                    </button>
                  </div>
                </SettingItem>

                <SettingItem
                  label="Auto Refresh"
                  description="Automatically refresh data at regular intervals"
                >
                  <input
                    type="checkbox"
                    checked={generalSettings.autoRefresh}
                    onChange={(e) =>
                      setGeneralSettings((prev) => ({
                        ...prev,
                        autoRefresh: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </SettingItem>

                <SettingItem
                  label="Refresh Interval"
                  description="How often to refresh data (seconds)"
                >
                  <select
                    value={generalSettings.refreshInterval}
                    onChange={(e) =>
                      setGeneralSettings((prev) => ({
                        ...prev,
                        refreshInterval: parseInt(e.target.value),
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={300}>5 minutes</option>
                  </select>
                </SettingItem>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleGeneralSettingsUpdate}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </SettingsSection>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <SettingsSection
              title="Notification Settings"
              description="Configure how and when you receive notifications"
            >
              <div className="space-y-4">
                <SettingItem
                  label="Email Notifications"
                  description="Receive notifications via email"
                >
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        emailNotifications: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </SettingItem>

                <SettingItem
                  label="Push Notifications"
                  description="Receive push notifications in browser"
                >
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        pushNotifications: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </SettingItem>

                <SettingItem
                  label="Alert Notifications"
                  description="Receive notifications for device alerts"
                >
                  <input
                    type="checkbox"
                    checked={notificationSettings.alertNotifications}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        alertNotifications: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </SettingItem>

                <SettingItem
                  label="Quiet Hours"
                  description="Pause notifications during specified hours"
                >
                  <input
                    type="checkbox"
                    checked={notificationSettings.quietHours}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        quietHours: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </SettingItem>

                {notificationSettings.quietHours && (
                  <div className="ml-6 space-y-2">
                    <SettingItem label="Quiet Hours Start">
                      <input
                        type="time"
                        value={notificationSettings.quietHoursStart}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            quietHoursStart: e.target.value,
                          }))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </SettingItem>
                    <SettingItem label="Quiet Hours End">
                      <input
                        type="time"
                        value={notificationSettings.quietHoursEnd}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            quietHoursEnd: e.target.value,
                          }))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </SettingItem>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={handleNotificationSettingsUpdate}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </SettingsSection>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <SettingsSection
              title="Security Settings"
              description="Configure security preferences and authentication"
            >
              <div className="space-y-4">
                <SettingItem
                  label="Two-Factor Authentication"
                  description="Add an extra layer of security to your account"
                >
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        twoFactorAuth: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </SettingItem>

                <SettingItem
                  label="Session Timeout"
                  description="Automatically log out after inactivity (minutes)"
                >
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        sessionTimeout: parseInt(e.target.value),
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </SettingItem>

                <SettingItem
                  label="Require Strong Password"
                  description="Enforce strong password requirements"
                >
                  <input
                    type="checkbox"
                    checked={securitySettings.requireStrongPassword}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        requireStrongPassword: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </SettingItem>

                <SettingItem
                  label="Login Attempts"
                  description="Maximum failed login attempts before lockout"
                >
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={securitySettings.loginAttempts}
                    onChange={(e) =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        loginAttempts: parseInt(e.target.value),
                      }))
                    }
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </SettingItem>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleSecuritySettingsUpdate}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </SettingsSection>
          </div>
        );

      case "system":
        return (
          <div className="space-y-6">
            <SettingsSection
              title="System Settings"
              description="Configure system behavior and maintenance"
            >
              <div className="space-y-4">
                <SettingItem
                  label="Data Retention"
                  description="How long to keep data (days)"
                >
                  <select
                    value={systemSettings.dataRetention}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        dataRetention: parseInt(e.target.value),
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={180}>180 days</option>
                    <option value={365}>1 year</option>
                  </select>
                </SettingItem>

                <SettingItem
                  label="Auto Backup"
                  description="Automatically backup system data"
                >
                  <input
                    type="checkbox"
                    checked={systemSettings.autoBackup}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        autoBackup: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </SettingItem>

                <SettingItem
                  label="Backup Frequency"
                  description="How often to perform backups"
                >
                  <select
                    value={systemSettings.backupFrequency}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        backupFrequency: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </SettingItem>

                <SettingItem
                  label="Debug Mode"
                  description="Enable debug logging for troubleshooting"
                >
                  <input
                    type="checkbox"
                    checked={systemSettings.debugMode}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        debugMode: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </SettingItem>

                <SettingItem
                  label="Maintenance Mode"
                  description="Put system in maintenance mode"
                >
                  <input
                    type="checkbox"
                    checked={systemSettings.maintenanceMode}
                    onChange={(e) =>
                      setSystemSettings((prev) => ({
                        ...prev,
                        maintenanceMode: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </SettingItem>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleSystemSettingsUpdate}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </SettingsSection>

            <SettingsSection
              title="System Information"
              description="Current system status and statistics"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    System Status
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Version:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {systemInfo.version}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Uptime:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {systemInfo.uptime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Last Update:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(systemInfo.lastUpdate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Storage
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Database Size:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {systemInfo.databaseSize}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Storage Used:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {systemInfo.storageUsed}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SettingsSection>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            <SettingsSection
              title="Profile Settings"
              description="Update your personal information and preferences"
            >
              <div className="space-y-4">
                <SettingItem label="First Name" description="Your first name">
                  <input
                    type="text"
                    value={profileData.first_name}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        first_name: e.target.value,
                      }))
                    }
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </SettingItem>

                <SettingItem label="Last Name" description="Your last name">
                  <input
                    type="text"
                    value={profileData.last_name}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        last_name: e.target.value,
                      }))
                    }
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </SettingItem>

                <SettingItem label="Email" description="Your email address">
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </SettingItem>

                <SettingItem label="Phone" description="Your phone number">
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </SettingItem>

                <SettingItem
                  label="Organization"
                  description="Your organization or company"
                >
                  <input
                    type="text"
                    value={profileData.organization}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        organization: e.target.value,
                      }))
                    }
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </SettingItem>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleProfileUpdate}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </SettingsSection>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl">
            Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure system preferences and manage your account
          </p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">{success}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {renderTabButton("general", "General", Settings)}
          {renderTabButton("notifications", "Notifications", Bell)}
          {renderTabButton("security", "Security", Shield)}
          {renderTabButton("system", "System", Cog)}
          {renderTabButton("profile", "Profile", User)}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Settings;
