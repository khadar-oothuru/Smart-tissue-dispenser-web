import React, { useState, useEffect, useCallback, useMemo } from "react";
import useTheme from "../../hooks/useThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import useDeviceStore from "../../store/useDeviceStore";
import { toast } from "react-toastify";
import { getDeviceStatusConfig } from "../../utils/deviceUtils";
import { formatTimeAgo } from "../../utils/timeUtils";
import {
  Users,
  Smartphone,
  AlertTriangle,
  Battery,
  Activity,
  TrendingUp,
  RefreshCw,
  ChevronRight,
  BarChart3,
  FileText,
  Settings,
  Wifi,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Droplets,
  Power,
  ShieldAlert,
  WifiOff,
  Database,
  Globe,
  AlertOctagon,
  Eye,
  EyeOff,
} from "lucide-react";
import SummaryCards from "../AdminDashboard/SummaryCards";
import LandingPageTop, {
  getBatteryAndPowerAlertCounts,
  getTissueAlertCounts,
} from "../AdminDashboard/LandingPageTop";
import DonutChart from "../Charts/DonutChart";
import DeviceStatusDistribution from "../DeviceStatusDistribution";
import DeviceDetailsModal from "../Devices/DeviceDetailsModal";

const AdminDashboard = () => {
  // Use theme context
  const { themeColors } = useTheme();
  const { accessToken } = useAuth();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [selectedAlertType, setSelectedAlertType] = useState("tissue"); // "battery", "tissue", or "power"
  const [showAlertDevices, setShowAlertDevices] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Device details modal state
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [deviceModalData, setDeviceModalData] = useState({
    title: "",
    details: {},
  });

  // Handler for device card click
  const handleDeviceCardClick = (deviceType) => {
    // Prepare modal data based on device type
    let title = "";
    let details = {};

    switch (deviceType) {
      case "all":
        title = "All Devices Summary";
        details = {
          "Total Devices": dashboardStats.totalDevices || 0,
          "Active Devices": dashboardStats.activeDevices || 0,
          "Offline Devices": dashboardStats.offlineDevices || 0,
          "No Power Devices": dashboardStats.noPowerDevices || 0,
          "System Health": `${dashboardStats.systemHealthPercentage || 0}%`,
          "System Status": dashboardStats.systemHealthStatus || "Unknown",
        };
        break;
      case "active":
        title = "Active Devices Summary";
        details = {
          "Active Devices": dashboardStats.activeDevices || 0,
          "Percentage of Total": `${
            dashboardStats.activeDevices
              ? (
                  (dashboardStats.activeDevices / dashboardStats.totalDevices) *
                  100
                ).toFixed(1)
              : 0
          }%`,
          "With Battery Alerts": dashboardStats.activeBatteryAlerts || 0,
          "With Tissue Alerts": dashboardStats.activeTissueAlerts || 0,
        };
        break;
      case "offline":
        title = "Offline Devices Summary";
        details = {
          "Offline Devices": dashboardStats.offlineDevices || 0,
          "Percentage of Total": `${
            dashboardStats.offlineDevices
              ? (
                  (dashboardStats.offlineDevices /
                    dashboardStats.totalDevices) *
                  100
                ).toFixed(1)
              : 0
          }%`,
          "Last Seen": "Various times",
          "Most Common Issue": "Connection lost",
        };
        break;
      case "no-power":
        title = "No Power Devices Summary";
        details = {
          "No Power Devices": dashboardStats.noPowerDevices || 0,
          "Percentage of Total": `${
            dashboardStats.noPowerDevices
              ? (
                  (dashboardStats.noPowerDevices /
                    dashboardStats.totalDevices) *
                  100
                ).toFixed(1)
              : 0
          }%`,
          "Battery Off Devices": dashboardStats.batteryOffDevices || 0,
          "Critical Battery Devices": dashboardStats.criticalDevices || 0,
        };
        break;
      default:
        title = "Device Summary";
        details = {
          "Total Devices": dashboardStats.totalDevices || 0,
        };
    }

    setDeviceModalData({
      title,
      details,
    });
    setDeviceModalOpen(true);
  };

  // Use the device store
  const deviceStore = useDeviceStore();
  const {
    devices = [],
    analytics = [],
    realtimeStatus = [],
    summaryData,
    loading,
    fetchDevices,
    fetchAllAnalyticsData,
    refreshAllData,
    loadCachedData,
  } = deviceStore;

  // --- Local Storage & Caching Logic ---
  // Helper to cache and restore dashboard data
  function useDashboardCache(key, data, setData) {
    useEffect(() => {
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          setData(JSON.parse(cached));
        } catch (e) {
          // ignore
        }
      }
    }, []);
    useEffect(() => {
      if (data) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    }, [data, key]);
  }

  // Use local state to allow cache restoration
  const [dashboardDataCache, setDashboardDataCache] = useState(null);
  const [realtimeStatusCache, setRealtimeStatusCache] = useState(null);

  // Fallbacks for cache, but do NOT reference dashboardData before it's defined
  let dashboardDataToShow = dashboardDataCache;
  let realtimeStatusToShow = realtimeStatusCache;

  // Load cached data on mount for instant UI (keep for legacy support)
  useEffect(() => {
    loadCachedData();
  }, [loadCachedData]);

  // Load cached data on mount for instant UI (keep for legacy support)
  useEffect(() => {
    loadCachedData();
  }, [loadCachedData]);

  // Merge analytics, real-time status, and device info similar to mobile app
  const mergedDevices = useMemo(() => {
    const devicesArray = Array.isArray(devices) ? devices : [];
    const analyticsArray = Array.isArray(analytics) ? analytics : [];
    const realtimeArray = Array.isArray(realtimeStatus) ? realtimeStatus : [];

    // Create lookup maps
    const analyticsMap = new Map(
      analyticsArray.map((a) => [a.device_id || a.id, a])
    );
    const realtimeMap = new Map(
      realtimeArray.map((r) => [r.device_id || r.id, r])
    );

    // Merge device data
    return devicesArray.map((device) => {
      const deviceId = device.id || device.device_id;
      const analyticsData = analyticsMap.get(deviceId) || {};
      const realtimeData = realtimeMap.get(deviceId) || {};

      return {
        ...device,
        ...analyticsData,
        ...realtimeData,
        device_id: deviceId,
        device_name: device.name || device.device_name || `Device ${deviceId}`,
      };
    });
  }, [devices, analytics, realtimeStatus]);

  // Calculate dashboard statistics using unified logic from mobile app (admindash)
  const dashboardStats = useMemo(() => {
    const totalDevices = Array.isArray(mergedDevices)
      ? mergedDevices.length
      : 0;
    let activeDevices = 0;
    let offlineDevices = 0;
    let powerOffDevices = 0;
    let lowBatteryDevices = 0;
    let emptyDevices = 0;
    let lowDevices = 0;
    let tamperDevices = 0;
    let criticalDevices = 0;
    let totalTissueAlerts = 0;
    let powerTotalAlertsCount = 0;

    mergedDevices.forEach((device) => {
      // Active/Offline
      if (device.is_active) activeDevices += 1;
      else offlineDevices += 1;

      // Power Off
      if (
        device.power_status === false ||
        device.power_status === 0 ||
        device.status === "Power Off"
      )
        powerOffDevices += 1;

      // Battery
      if (device.battery_level !== undefined) {
        if (device.battery_level <= 10) criticalDevices += 1;
        else if (device.battery_level <= 20) lowBatteryDevices += 1;
      }

      // Tissue
      if (device.tissue_level !== undefined) {
        if (device.tissue_level === 0) emptyDevices += 1;
        else if (device.tissue_level <= 20) lowDevices += 1;
      }

      // Tamper
      if (device.tamper_alert || device.status === "Tamper Alert")
        tamperDevices += 1;

      // Alerts
      if (device.status === "Empty") totalTissueAlerts += 1;
      if (device.status === "Low") totalTissueAlerts += 1;
      if (device.status === "Tamper Alert") totalTissueAlerts += 1;
      if (device.status === "Critical Battery") powerTotalAlertsCount += 1;
      if (device.status === "Low Battery") powerTotalAlertsCount += 1;
      if (device.status === "Power Off") powerTotalAlertsCount += 1;
    });

    // System health logic (unified)
    let systemHealth = "Unknown";
    if (totalDevices > 0) {
      const activePercentage = (activeDevices / totalDevices) * 100;
      const criticalPercentage = (criticalDevices / totalDevices) * 100;
      if (activePercentage >= 90 && criticalPercentage < 5)
        systemHealth = "Excellent";
      else if (activePercentage >= 80 && criticalPercentage < 10)
        systemHealth = "Good";
      else if (activePercentage >= 70 && criticalPercentage < 20)
        systemHealth = "Fair";
      else if (activePercentage >= 50 && criticalPercentage < 30)
        systemHealth = "Poor";
      else systemHealth = "Critical";
    }

    return {
      totalDevices,
      activeDevices,
      offlineDevices,
      powerOffDevices,
      lowBatteryDevices,
      emptyDevices,
      lowDevices,
      tamperDevices,
      criticalDevices,
      totalTissueAlerts,
      powerTotalAlertsCount,
      systemHealth,
      recentActivity24h: summaryData?.total_entries_today || 0,
      totalEntries: summaryData?.total_entries || 0,
      uptime: "99.9%", // This would come from backend
      todayUsage: summaryData?.usage_percentage_today || 0,
    };
  }, [mergedDevices, summaryData]);

  // Helper function to get alert message
  const getAlertMessage = (device) => {
    const statusConfig = getDeviceStatusConfig(device);
    const status = statusConfig.status;

    if (status === "Empty") return "Tissue roll empty";
    if (status === "Low") return "Tissue level low";
    if (status === "Tamper Alert") return "Tamper alert detected";
    if (status === "Critical Battery") return "Critical battery level";
    if (status === "Low Battery") return "Low battery level";
    if (status === "Power Off") return "Device offline";

    return "Device status update";
  };

  // Helper function to get alert type
  const getAlertType = (device) => {
    const statusConfig = getDeviceStatusConfig(device);
    const priority = statusConfig.priority;

    if (priority <= 2) return "error";
    if (priority <= 5) return "warning";
    return "info";
  };

  // Enhanced dashboard data with real backend integration
  const dashboardData = useMemo(
    () => ({
      ...dashboardStats,
      analytics: mergedDevices,
      recentAlerts: mergedDevices
        .filter((device) => {
          const statusConfig = getDeviceStatusConfig(device);
          return statusConfig.priority <= 5; // Only show devices with priority issues
        })
        .slice(0, 10) // Limit to 10 recent alerts
        .map((device) => ({
          id: device.id,
          device_name: device.device_name,
          message: getAlertMessage(device),
          timestamp: formatTimeAgo(
            device.last_alert_time || device.last_updated
          ),
          type: getAlertType(device),
        })),
    }),
    [dashboardStats, mergedDevices]
  );

  // Fetch data function with improved error handling
  const fetchData = useCallback(async () => {
    if (!accessToken) return;

    try {
      setRefreshing(true);
      console.log("AdminDashboard: Initial data fetch started...");
      const startTime = Date.now();

      // Use Promise.allSettled instead of Promise.all to handle partial failures
      const results = await Promise.allSettled([
        fetchDevices(accessToken),
        fetchAllAnalyticsData(accessToken),
      ]);

      // Check for any failures
      const failures = results.filter((result) => result.status === "rejected");

      if (failures.length > 0) {
        // Some requests failed
        console.warn(
          `AdminDashboard: ${failures.length} of ${results.length} initial data fetches failed`
        );

        // Log the specific errors
        failures.forEach((failure, index) => {
          const dataType = index === 0 ? "devices" : "analytics";
          console.error(
            `AdminDashboard: Failed to fetch ${dataType}:`,
            failure.reason
          );
        });

        // Show a warning toast if there were partial failures
        if (failures.length < results.length) {
          toast.warning(
            "Some dashboard data could not be loaded. The dashboard may show incomplete information."
          );
        } else {
          // All requests failed
          toast.error(
            "Failed to load dashboard data. Please try refreshing the page."
          );
        }
      } else {
        // All requests succeeded
        const duration = Date.now() - startTime;
        console.log(
          `AdminDashboard: All data fetched successfully in ${duration}ms`
        );
      }
    } catch (error) {
      console.error("AdminDashboard: Error fetching data:", error);
      toast.error(
        "Failed to load dashboard data. Please try refreshing the page."
      );

      // Log detailed error information
      console.error("Initial data fetch error details:", {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setRefreshing(false);
      if (isFirstLoad) {
        setIsFirstLoad(false);
      }
    }
  }, [accessToken, fetchDevices, fetchAllAnalyticsData, isFirstLoad]);

  // Initial data fetch
  useEffect(() => {
    if (accessToken && isFirstLoad) {
      fetchData();
    }
  }, [accessToken, isFirstLoad, fetchData]);

  // Auto-refresh every 30 seconds with improved error handling
  useEffect(() => {
    if (!accessToken || isFirstLoad) return;

    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 3;

    const interval = setInterval(async () => {
      try {
        console.log("AdminDashboard: Starting auto-refresh...");
        const startTime = Date.now();

        await fetchAllAnalyticsData(accessToken);

        const duration = Date.now() - startTime;
        console.log(`AdminDashboard: Auto-refresh completed in ${duration}ms`);

        // Reset error counter on success
        consecutiveErrors = 0;
      } catch (error) {
        consecutiveErrors++;
        console.error(
          `AdminDashboard: Auto-refresh error (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`,
          error
        );

        // Log detailed error information
        console.error("Auto-refresh error details:", {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          consecutiveErrors,
        });

        // Only show toast for the first error to avoid spamming the user
        if (consecutiveErrors === 1) {
          const errorMessage = error.message?.includes("timeout")
            ? "Background data refresh timed out. Some dashboard data may be stale."
            : "Background data refresh failed. Some dashboard data may be stale.";

          toast.warning(errorMessage, { autoClose: 5000 });
        }

        // If we've had too many consecutive errors, stop auto-refresh
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          console.error(
            "AdminDashboard: Too many consecutive auto-refresh errors. Stopping auto-refresh."
          );
          clearInterval(interval);
          toast.error(
            "Dashboard auto-refresh has been disabled due to repeated errors. Please refresh manually.",
            { autoClose: false }
          );
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [accessToken, isFirstLoad, fetchAllAnalyticsData]);

  // Define handleRefresh with improved error handling
  const handleRefresh = useCallback(async () => {
    if (!accessToken) return;

    try {
      setRefreshing(true);
      console.log("AdminDashboard: Starting manual refresh...");
      const startTime = Date.now();

      await refreshAllData(accessToken);

      const duration = Date.now() - startTime;
      console.log(`AdminDashboard: Manual refresh completed in ${duration}ms`);

      // Show toast notification for successful refresh
      toast.success("Dashboard data refreshed successfully");
    } catch (error) {
      console.error("AdminDashboard: Refresh error:", error);

      // Show user-friendly error message
      const errorMessage = error.message?.includes("timeout")
        ? "Dashboard refresh timed out. The server might be busy, please try again later."
        : "Failed to refresh dashboard data. Please try again.";

      toast.error(errorMessage);

      // Log detailed error information
      console.error("Refresh error details:", {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setRefreshing(false);
    }
  }, [accessToken, refreshAllData]);

  // Alert Distribution Data (same as React Native version)
  const alertDistributionData = useMemo(() => {
    if (selectedAlertType === "tissue") {
      const { emptyCount, lowCount, tamperCount } =
        getTissueAlertCounts(realtimeStatus);

      // Calculate full count (devices that are not empty or low)
      const fullCount = Math.max(
        0,
        dashboardData.totalDevices - emptyCount - lowCount
      );

      return [
        { name: "Empty", value: emptyCount, color: "#FF4757" },
        { name: "Low", value: lowCount, color: "#FF9F00" },
        { name: "Full", value: fullCount, color: "#10B981" },
        { name: "Tamper", value: tamperCount, color: "#8B5CF6" },
      ];
    } else if (selectedAlertType === "battery") {
      const { criticalBatteryCount, lowBatteryCount, batteryOffCount } =
        getBatteryAndPowerAlertCounts(realtimeStatus);

      // Calculate good battery count
      const goodBatteryCount = Math.max(
        0,
        dashboardData.totalDevices -
          criticalBatteryCount -
          lowBatteryCount -
          batteryOffCount
      );

      return [
        {
          name: "Critical Battery",
          value: criticalBatteryCount,
          color: "#FF3B30",
        },
        { name: "Low Battery", value: lowBatteryCount, color: "#FF9F00" },
        { name: "Good Battery", value: goodBatteryCount, color: "#10B981" },
        { name: "Battery Off", value: batteryOffCount, color: "#757575" },
      ];
    } else if (selectedAlertType === "power") {
      const {
        noPowerCount,
        powerOffCount,
        criticalBatteryCount,
        lowBatteryCount,
      } = getBatteryAndPowerAlertCounts(realtimeStatus);

      // Calculate good power count
      const goodPowerCount = Math.max(
        0,
        dashboardData.totalDevices -
          noPowerCount -
          powerOffCount -
          criticalBatteryCount -
          lowBatteryCount
      );

      return [
        { name: "No Power", value: noPowerCount, color: "#FF3B30" },
        { name: "Power Off", value: powerOffCount, color: "#FF9F00" },
        {
          name: "Critical Battery",
          value: criticalBatteryCount,
          color: "#FF6B00",
        },
        { name: "Good Power", value: goodPowerCount, color: "#10B981" },
      ];
    }
  }, [realtimeStatus, selectedAlertType, dashboardData.totalDevices]);

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [handleRefresh]);

  const StatCard = ({
    title,
    value,
    icon,
    color,
    trend,
    description,
    link,
  }) => {
    const IconComponent = icon;
    return (
      <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-xl ${color} bg-gradient-to-br shadow-lg`}
              >
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {value}
                </p>
                {description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {trend && (
              <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">{trend}</span>
              </div>
            )}
          </div>
          {link && (
            <Link
              to={link}
              className="absolute inset-0 flex items-center justify-end pr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          )}
        </div>
      </div>
    );
  };

  const QuickActionCard = ({ title, description, icon, color, link }) => {
    const IconComponent = icon;
    return (
      <Link
        to={link}
        className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-xl ${color} bg-gradient-to-br shadow-lg`}
              >
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
          </div>
        </div>
      </Link>
    );
  };

  const AlertCard = ({ alert }) => {
    const getAlertIcon = (type) => {
      switch (type) {
        case "error":
          return <XCircle className="h-5 w-5 text-red-500" />;
        case "warning":
          return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        case "success":
          return <CheckCircle className="h-5 w-5 text-green-500" />;
        default:
          return <AlertCircle className="h-5 w-5 text-blue-500" />;
      }
    };

    const getAlertColor = (type) => {
      switch (type) {
        case "error":
          return "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800";
        case "warning":
          return "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800";
        case "success":
          return "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800";
        default:
          return "border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800";
      }
    };

    return (
      <div
        className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${getAlertColor(
          alert.type
        )}`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {alert.device_name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {alert.message}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {alert.timestamp}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Calculate alert counts for summary cards and modals
  const alertCounts = useMemo(() => {
    // Get tissue alert counts
    const tissueAlerts = getTissueAlertCounts(realtimeStatus);

    // Get battery and power alert counts
    const batteryAlerts = getBatteryAndPowerAlertCounts(realtimeStatus);

    // Calculate good battery count (devices with battery > 20%)
    const goodBatteryCount = Array.isArray(realtimeStatus)
      ? realtimeStatus.filter((device) => {
          const batteryPercentage =
            typeof device.battery_percentage === "number"
              ? device.battery_percentage
              : null;
          return batteryPercentage !== null && batteryPercentage > 20;
        }).length
      : 0;

    return {
      // Tissue alerts
      emptyCount: tissueAlerts.emptyCount,
      lowCount: tissueAlerts.lowCount,
      fullCount: tissueAlerts.fullCount,
      tamperCount: tissueAlerts.tamperCount,
      totalTissueAlerts: tissueAlerts.totalTissueAlerts,

      // Battery alerts
      lowBatteryCount: batteryAlerts.lowBatteryCount,
      criticalBatteryCount: batteryAlerts.criticalBatteryCount,
      batteryOffCount: batteryAlerts.batteryOffCount,
      noPowerCount: batteryAlerts.noPowerCount,
      powerOffCount: batteryAlerts.powerOffCount,
      goodBatteryCount,
      powerTotalAlertsCount: batteryAlerts.powerTotalAlertsCount,
    };
  }, [realtimeStatus]);

  // Enhanced Device Card Component

  // Enhanced Device Card Component
  const DeviceCard = ({ device }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case "empty":
          return "text-red-500 bg-red-50 dark:bg-red-900/20";
        case "low":
          return "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
        case "full":
          return "text-green-500 bg-green-50 dark:bg-green-900/20";
        case "tamper":
          return "text-purple-500 bg-purple-50 dark:bg-purple-900/20";
        default:
          return "text-gray-500 bg-gray-50 dark:bg-gray-700";
      }
    };

    const getBatteryColor = (percentage) => {
      if (percentage <= 15) return "text-red-500";
      if (percentage <= 30) return "text-yellow-500";
      return "text-green-500";
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {device.device_name}
          </h4>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              device.current_status
            )}`}
          >
            {device.current_status}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Room:</span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {device.room}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Floor:</span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {device.floor}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Level:</span>
            <span className="ml-2 text-gray-900 dark:text-white">
              {device.current_level}%
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Battery:</span>
            <span
              className={`ml-2 font-medium ${getBatteryColor(
                device.battery_percentage
              )}`}
            >
              {device.battery_percentage}%
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                device.is_active ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {device.is_active ? "Online" : "Offline"}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {device.minutes_since_update}m ago
          </span>
        </div>
      </div>
    );
  };

  // Alert Toggle Component
  const AlertToggle = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-center space-x-8">
          <div className="flex items-center space-x-3">
            <Droplets
              className={`h-5 w-5 ${
                selectedAlertType === "tissue"
                  ? "text-blue-500"
                  : "text-gray-400"
              }`}
            />
            <span
              className={`font-medium ${
                selectedAlertType === "tissue"
                  ? "text-blue-500"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Tissue Alerts
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedAlertType === "battery"}
              onChange={(e) =>
                setSelectedAlertType(e.target.checked ? "battery" : "tissue")
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>

          <div className="flex items-center space-x-3">
            <Battery
              className={`h-5 w-5 ${
                selectedAlertType === "battery"
                  ? "text-yellow-500"
                  : "text-gray-400"
              }`}
            />
            <span
              className={`font-medium ${
                selectedAlertType === "battery"
                  ? "text-yellow-500"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              Battery Alerts
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowAlertDevices(!showAlertDevices)}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {showAlertDevices ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {showAlertDevices ? "Hide" : "Show"}{" "}
            {selectedAlertType === "tissue" ? "Tissue" : "Battery"} Alert
            Devices
          </button>
        </div>
      </div>
    );
  };

  // Summary Cards Component
  const SummaryCards = () => {
    const summaryData = [
      {
        title: "Empty Devices",
        value:
          alertDistributionData.find((d) => d.name === "Empty")?.value || 0,
        icon: AlertOctagon,
        color: "text-red-500 bg-red-50 dark:bg-red-900/20",
      },
      {
        title: "Low Level",
        value: alertDistributionData.find((d) => d.name === "Low")?.value || 0,
        icon: AlertTriangle,
        color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
      },
      {
        title: "Full Devices",
        value: alertDistributionData.find((d) => d.name === "Full")?.value || 0,
        icon: CheckCircle,
        color: "text-green-500 bg-green-50 dark:bg-green-900/20",
      },
      {
        title: "Tamper Alerts",
        value:
          alertDistributionData.find((d) => d.name === "Tamper")?.value || 0,
        icon: ShieldAlert,
        color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
      },
    ];

    if (selectedAlertType === "battery") {
      summaryData.splice(
        0,
        4,
        {
          title: "Critical Battery",
          value:
            alertDistributionData.find((d) => d.name === "Critical Battery")
              ?.value || 0,
          icon: Battery,
          color: "text-red-500 bg-red-50 dark:bg-red-900/20",
        },
        {
          title: "Low Battery",
          value:
            alertDistributionData.find((d) => d.name === "Low Battery")
              ?.value || 0,
          icon: Battery,
          color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
        },
        {
          title: "Medium Battery",
          value:
            alertDistributionData.find((d) => d.name === "Medium Battery")
              ?.value || 0,
          icon: Battery,
          color: "text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20",
        },
        {
          title: "Good Battery",
          value:
            alertDistributionData.find((d) => d.name === "Good Battery")
              ?.value || 0,
          icon: Battery,
          color: "text-green-500 bg-green-50 dark:bg-green-900/20",
        }
      );
    }

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {item.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${item.color}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Remove the blocking loading spinner entirely

  return (
    <div
      className="space-y-6 p-6 min-h-screen"
      style={{
        background: themeColors.background,
        color: themeColors.text,
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      {/* Device Details Modal */}
      <DeviceDetailsModal
        open={deviceModalOpen}
        onClose={() => setDeviceModalOpen(false)}
        title={deviceModalData.title}
        details={deviceModalData.details}
      />

      {/* No blocking loading spinner - background refresh only */}

      {/* Landing Page Top Component - matches mobile app */}
      <LandingPageTop
        stats={dashboardStats}
        realtimeStatus={realtimeStatusCache || realtimeStatus}
        onRefresh={handleRefresh}
        isLoading={false} // Never show loading spinner
        onDeviceCardClick={handleDeviceCardClick}
      />

      {/* Enhanced Alert Type Selector - toggle button style for Tissue and Battery Alerts */}
      <div className="flex justify-center mb-6">
        <div
          className="rounded-2xl p-4 shadow-lg border backdrop-blur-sm"
          style={{
            background: themeColors.card,
            borderColor: themeColors.border,
            transition: 'background 0.3s, border-color 0.3s',
          }}
        >
          <div className="flex items-center justify-center">
            <span
              className="font-bold text-sm mr-3"
              style={{
                color:
                  selectedAlertType === 'tissue'
                    ? themeColors.primary
                    : themeColors.muted,
              }}
            >
              Tissue
            </span>
            <button
              type="button"
              aria-label="Toggle alert type"
              className="relative w-16 h-8 rounded-full focus:outline-none focus:ring-2 transition-colors duration-300 mx-2"
              style={{
                background: themeColors.surface,
                border: `1px solid ${themeColors.border}`,
              }}
              onClick={() =>
                setSelectedAlertType(
                  selectedAlertType === 'tissue' ? 'battery' : 'tissue'
                )
              }
            >
              <span
                className="absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-md"
                style={{
                  transform:
                    selectedAlertType === 'tissue'
                      ? 'translateX(0)' : 'translateX(32px)',
                  background:
                    selectedAlertType === 'tissue'
                      ? themeColors.primary
                      : themeColors.warning,
                  color: themeColors.surface,
                }}
              >
                {selectedAlertType === 'tissue' ? (
                  <Droplets size={18} className="text-white" />
                ) : (
                  <Battery size={18} className="text-white" />
                )}
              </span>
            </button>
            <span
              className="font-bold text-sm ml-3"
              style={{
                color:
                  selectedAlertType === 'battery'
                    ? themeColors.warning
                    : themeColors.muted,
              }}
            >
              Battery
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards Component - matches mobile app */}
      <SummaryCards
        dashboardData={dashboardDataCache || dashboardData}
        realtimeStatus={realtimeStatusCache || realtimeStatus}
        selectedAlertType={selectedAlertType}
        isLoading={false}
        onAlertPress={(alertType) => {
          let title = "";
          let details = {};
          setDeviceModalData({ title, details });
          setDeviceModalOpen(true);
        }}
        themeColors={themeColors}
      />

      {/* Charts Section with Recent Alerts on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alert Distribution Chart */}
        <DeviceStatusDistribution
          realtimeStatus={realtimeStatusCache || realtimeStatus}
          selectedAlertType={selectedAlertType}
          onRefresh={handleRefresh}
          isLoading={false}
        />

        {/* Recent Alerts Section (now in right column) */}
        <div
          className="rounded-2xl p-6 shadow-lg border flex flex-col"
          style={{
            background: themeColors.card,
            borderColor: themeColors.border,
            transition: 'background 0.3s, border-color 0.3s',
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3
              className="text-lg font-bold"
              style={{ color: themeColors.heading }}
            >
              Recent Alerts
            </h3>
            <Link
              to="/admin/alerts"
              className="font-medium text-sm"
              style={{ color: themeColors.primary }}
            >
              View All
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {(dashboardDataCache || dashboardData).recentAlerts
              ?.slice(0, 5)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 rounded-lg transition-colors"
                  style={{
                    background: themeColors.surface,
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background:
                          alert.type === 'error'
                            ? themeColors.danger
                            : alert.type === 'warning'
                            ? themeColors.warning
                            : themeColors.primary,
                      }}
                    />
                    <div>
                      <div
                        className="font-medium"
                        style={{ color: themeColors.heading }}
                      >
                        {alert.device_name}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: themeColors.muted }}
                      >
                        {alert.message}
                      </div>
                    </div>
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: themeColors.muted }}
                  >
                    {alert.timestamp}
                  </div>
                </div>
              )) || (
              <div
                className="text-center py-8"
                style={{ color: themeColors.muted }}
              >
                No recent alerts
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions removed as requested */}
    </div>
  );
};

// --- Local Storage & Caching Logic ---
// This should be placed at the top level of the file, but for patching, add here and move as needed

// Helper to cache and restore dashboard data
function useDashboardCache(key, data, setData) {
  // On mount, try to load from localStorage
  useEffect(() => {
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        setData(JSON.parse(cached));
      } catch {}
    }
    // eslint-disable-next-line
  }, []);

  // On data change, update cache
  useEffect(() => {
    if (data) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, [data, key]);
}

// Usage in AdminDashboard:
// useDashboardCache("dashboardData", dashboardData, setDashboardData);
// useDashboardCache("realtimeStatus", realtimeStatus, setRealtimeStatus);

// You must call these hooks in the main AdminDashboard component body, after state is defined.

export default AdminDashboard;
