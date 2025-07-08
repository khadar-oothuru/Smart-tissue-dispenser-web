import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import useDeviceStore from "../../store/useDeviceStore";
import {
  getTissueAlertCounts,
  getBatteryAndPowerAlertCounts,
  calculateDeviceHealth,
  getDeviceStatusConfig,
  formatTimeAgo,
} from "../../utils/deviceUtils";
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
import LandingPageTop from "../AdminDashboard/LandingPageTop";
import DonutChart from "../Charts/DonutChart";

const AdminDashboard = ({ setDeviceModalData }) => {
  const { accessToken } = useAuth();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [selectedAlertType, setSelectedAlertType] = useState("tissue"); // "battery" or "tissue"
  const [showAlertDevices, setShowAlertDevices] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  // Load cached data on mount for instant UI
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

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!accessToken) return;

    try {
      setRefreshing(true);

      // Fetch devices and analytics data
      await Promise.all([
        fetchDevices(accessToken),
        fetchAllAnalyticsData(accessToken),
      ]);

      console.log("AdminDashboard: Data fetched successfully");
    } catch (error) {
      console.error("AdminDashboard: Error fetching data:", error);
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

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!accessToken || isFirstLoad) return;

    const interval = setInterval(async () => {
      try {
        await fetchAllAnalyticsData(accessToken);
      } catch (error) {
        console.error("AdminDashboard: Auto-refresh error:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [accessToken, isFirstLoad, fetchAllAnalyticsData]);

  // Define handleRefresh
  const handleRefresh = useCallback(async () => {
    if (!accessToken) return;

    try {
      setRefreshing(true);
      await refreshAllData(accessToken);
      console.log("AdminDashboard: Manual refresh completed");
    } catch (error) {
      console.error("AdminDashboard: Refresh error:", error);
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
    } else {
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
        { name: "Power Off", value: batteryOffCount, color: "#757575" },
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
      <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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

  // Enhanced Donut Chart Component
  const DonutChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      );
    }

    let cumulativePercentage = 0;
    const radius = 80;
    const strokeWidth = 20;
    const center = 100;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>
        )}
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width={200} height={200} className="transform -rotate-90">
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-gray-200 dark:text-gray-600"
              />
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const strokeDasharray = `${percentage * 5.024} 502.4`;
                const strokeDashoffset = -cumulativePercentage * 5.024;
                cumulativePercentage += percentage;

                return (
                  <circle
                    key={index}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {total}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 dark:text-gray-300">
              Loading dashboard data...
            </span>
          </div>
        </div>
      )}

      {/* Landing Page Top Component - matches mobile app */}
      <LandingPageTop
        stats={dashboardStats}
        onRefresh={handleRefresh}
        isLoading={refreshing}
        onDeviceCardClick={setDeviceModalData}
      />

      {/* Enhanced Alert Type Selector - matches mobile app */}
      <div className="flex justify-center mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  selectedAlertType === "tissue"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                <Droplets size={20} />
              </div>
              <span
                className={`font-bold text-sm ${
                  selectedAlertType === "tissue"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Tissue Alerts
              </span>
            </div>

            <div className="flex items-center">
              <button
                onClick={() =>
                  setSelectedAlertType(
                    selectedAlertType === "tissue" ? "battery" : "tissue"
                  )
                }
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-200 ${
                  selectedAlertType === "battery"
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                    selectedAlertType === "battery"
                      ? "translate-x-9"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  selectedAlertType === "battery"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                <Battery size={20} />
              </div>
              <span
                className={`font-bold text-sm ${
                  selectedAlertType === "battery"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Battery Alerts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards Component - matches mobile app */}
      <SummaryCards
        dashboardData={dashboardData}
        selectedAlertType={selectedAlertType}
        onAlertPress={(alertType) =>
          console.log("Navigate to alert:", alertType)
        }
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alert Distribution Chart */}
        <DonutChart
          data={alertDistributionData}
          title={`${
            selectedAlertType === "tissue" ? "Tissue" : "Battery"
          } Status Distribution`}
          centerValue={dashboardData.totalDevices}
          centerLabel="Total Devices"
        />

        {/* Recent Activity Chart or additional stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                24h Entries
              </span>
              <span className="font-bold text-gray-800 dark:text-white">
                {dashboardData.recentActivity24h}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Total Entries
              </span>
              <span className="font-bold text-gray-800 dark:text-white">
                {dashboardData.totalEntries?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                System Uptime
              </span>
              <span className="font-bold text-green-600">
                {dashboardData.uptime}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Today's Usage
              </span>
              <span className="font-bold text-blue-600">
                {dashboardData.todayUsage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Recent Alerts
          </h3>
          <Link
            to="/admin/alerts"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {dashboardData.recentAlerts?.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    alert.type === "error"
                      ? "bg-red-500"
                      : alert.type === "warning"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                />
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    {alert.device_name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {alert.message}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {alert.timestamp}
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No recent alerts
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/devices"
          className="block p-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <Smartphone className="h-8 w-8" />
            <div>
              <div className="text-xl font-bold">Manage Devices</div>
              <div className="text-blue-100">
                Add, edit, and monitor devices
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/analytics"
          className="block p-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8" />
            <div>
              <div className="text-xl font-bold">View Analytics</div>
              <div className="text-green-100">Detailed usage reports</div>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="block p-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8" />
            <div>
              <div className="text-xl font-bold">User Management</div>
              <div className="text-purple-100">Manage user accounts</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
