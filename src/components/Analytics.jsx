import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import useDeviceStore from "../store/useDeviceStore";
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  RefreshCw,
  FileText,
  PieChart,
  LineChart,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Battery,
  Wifi,
  Droplets,
  Shield,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Search,
  Settings,
  DownloadCloud,
  Share2,
  Printer,
  FileSpreadsheet,
  FilePieChart,
} from "lucide-react";
import DonutChart from "./Charts/DonutChart";

const Analytics = () => {
  const { accessToken } = useAuth();
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [selectedDevice, setSelectedDevice] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    label: "Last 7 Days",
  });
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadCancelled, setDownloadCancelled] = useState(false);
  const [dataUpdateCounter, setDataUpdateCounter] = useState(0);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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

  // Merge devices with analytics and real-time data
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

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!accessToken) return;

    try {
      // Fetch devices and analytics data
      await Promise.all([
        fetchDevices(accessToken),
        fetchAllAnalyticsData(accessToken),
      ]);

      console.log("Analytics: Data fetched successfully");
    } catch (err) {
      console.error("Analytics: Error fetching data:", err);
    }
  }, [accessToken, fetchDevices, fetchAllAnalyticsData]);

  // Load data on mount and when accessToken changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Enhanced period change handler
  const handlePeriodChange = useCallback((newPeriod) => {
    setSelectedPeriod(newPeriod);
    setDataUpdateCounter((prev) => prev + 1);
  }, []);

  // Enhanced device change handler
  const handleDeviceChange = useCallback((newDevice) => {
    setSelectedDevice(newDevice);
    setDataUpdateCounter((prev) => prev + 1);
  }, []);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const filteredDevices =
      selectedDevice === "all"
        ? mergedDevices
        : mergedDevices.filter((d) => d.id === selectedDevice);

    // Device status distribution
    const statusDistribution = {
      active: filteredDevices.filter(
        (d) => d.is_active && d.power_status !== "off"
      ).length,
      offline: filteredDevices.filter(
        (d) => !d.is_active || d.power_status === "off"
      ).length,
      lowBattery: filteredDevices.filter((d) => d.battery_low === 1).length,
      criticalBattery: filteredDevices.filter((d) => d.battery_critical === 1)
        .length,
      empty: filteredDevices.filter((d) => d.current_status === "empty").length,
      low: filteredDevices.filter((d) => d.current_status === "low").length,
      tamper: filteredDevices.filter((d) => d.current_status === "tamper")
        .length,
    };

    // Usage statistics
    const totalUsage = filteredDevices.reduce(
      (sum, d) => sum + (d.total_usage || 0),
      0
    );
    const averageUsage =
      filteredDevices.length > 0 ? totalUsage / filteredDevices.length : 0;
    const todayUsage = filteredDevices.reduce(
      (sum, d) => sum + (d.usage_percentage_today || 0),
      0
    );

    // Battery statistics
    const batteryStats = {
      average:
        filteredDevices.reduce(
          (sum, d) => sum + (d.battery_percentage || 0),
          0
        ) / Math.max(filteredDevices.length, 1),
      low: statusDistribution.lowBattery,
      critical: statusDistribution.criticalBattery,
      good: filteredDevices.filter((d) => (d.battery_percentage || 0) > 50)
        .length,
    };

    // Alert statistics
    const alertStats = {
      total:
        statusDistribution.empty +
        statusDistribution.low +
        statusDistribution.tamper +
        statusDistribution.lowBattery +
        statusDistribution.criticalBattery,
      tissue:
        statusDistribution.empty +
        statusDistribution.low +
        statusDistribution.tamper,
      battery:
        statusDistribution.lowBattery + statusDistribution.criticalBattery,
    };

    return {
      statusDistribution,
      usage: {
        total: totalUsage,
        average: Math.round(averageUsage),
        today: Math.round(todayUsage),
      },
      battery: batteryStats,
      alerts: alertStats,
      devices: filteredDevices,
    };
  }, [mergedDevices, selectedDevice]);

  // Chart data for donut charts
  const statusChartData = useMemo(
    () => [
      {
        name: "Active",
        value: analyticsData.statusDistribution.active,
        color: "#10B981",
      },
      {
        name: "Offline",
        value: analyticsData.statusDistribution.offline,
        color: "#6B7280",
      },
      {
        name: "Low Battery",
        value: analyticsData.statusDistribution.lowBattery,
        color: "#F59E0B",
      },
      {
        name: "Critical",
        value: analyticsData.statusDistribution.criticalBattery,
        color: "#EF4444",
      },
    ],
    [analyticsData.statusDistribution]
  );

  const alertChartData = useMemo(
    () => [
      {
        name: "Tissue Alerts",
        value: analyticsData.alerts.tissue,
        color: "#F59E0B",
      },
      {
        name: "Battery Alerts",
        value: analyticsData.alerts.battery,
        color: "#EF4444",
      },
      {
        name: "No Alerts",
        value: Math.max(
          0,
          analyticsData.devices.length - analyticsData.alerts.total
        ),
        color: "#10B981",
      },
    ],
    [analyticsData.alerts, analyticsData.devices.length]
  );

  // Handle download
  const handleDownload = async (format) => {
    try {
      setDownloading(true);
      setDownloadCancelled(false);

      // Simulate download process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (downloadCancelled) return;

      // Create download link
      const data = {
        period: selectedPeriod,
        device: selectedDevice,
        analytics: analyticsData,
        timestamp: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${selectedPeriod}-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowDownloadOptions(false);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloading(false);
    }
  };

  // Stats cards
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
    description,
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          {trend > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span
            className={`ml-2 text-sm ${
              trend > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {Math.abs(trend)}% from last period
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
            Analytics
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comprehensive insights and data visualization
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            onClick={() => setShowDownloadOptions(true)}
            disabled={downloading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloading ? "Downloading..." : "Export Data"}
          </button>
          <button
            onClick={fetchData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="daily">Last 24 Hours</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
              <option value="quarterly">Last 3 Months</option>
              <option value="yearly">Last Year</option>
            </select>
          </div>

          {/* Device Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Device
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Devices</option>
              {mergedDevices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.device_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={selectedDateRange.startDate.toISOString().split("T")[0]}
                onChange={(e) =>
                  setSelectedDateRange((prev) => ({
                    ...prev,
                    startDate: new Date(e.target.value),
                  }))
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="date"
                value={selectedDateRange.endDate.toISOString().split("T")[0]}
                onChange={(e) =>
                  setSelectedDateRange((prev) => ({
                    ...prev,
                    endDate: new Date(e.target.value),
                  }))
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: "overview", label: "Overview", icon: BarChart3 },
              { key: "usage", label: "Usage Analytics", icon: Activity },
              { key: "devices", label: "Device Status", icon: Smartphone },
              { key: "alerts", label: "Alerts & Issues", icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Devices"
                  value={analyticsData.devices.length}
                  icon={Smartphone}
                  color="bg-blue-100 text-blue-600"
                  trend={5}
                />
                <StatCard
                  title="Total Usage"
                  value={analyticsData.usage.total.toLocaleString()}
                  icon={Activity}
                  color="bg-green-100 text-green-600"
                  trend={12}
                />
                <StatCard
                  title="Active Alerts"
                  value={analyticsData.alerts.total}
                  icon={AlertTriangle}
                  color="bg-orange-100 text-orange-600"
                  trend={-3}
                />
                <StatCard
                  title="Avg Battery"
                  value={`${Math.round(analyticsData.battery.average)}%`}
                  icon={Battery}
                  color="bg-purple-100 text-purple-600"
                  trend={2}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Device Status Distribution
                  </h3>
                  <DonutChart data={statusChartData} />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Alert Distribution
                  </h3>
                  <DonutChart data={alertChartData} />
                </div>
              </div>
            </div>
          )}

          {/* Usage Analytics Tab */}
          {activeTab === "usage" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Usage"
                  value={analyticsData.usage.total.toLocaleString()}
                  icon={Activity}
                  color="bg-green-100 text-green-600"
                  description="All time usage"
                />
                <StatCard
                  title="Average Usage"
                  value={analyticsData.usage.average.toLocaleString()}
                  icon={TrendingUp}
                  color="bg-blue-100 text-blue-600"
                  description="Per device average"
                />
                <StatCard
                  title="Today's Usage"
                  value={analyticsData.usage.today.toLocaleString()}
                  icon={Clock}
                  color="bg-purple-100 text-purple-600"
                  description="Usage in last 24h"
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Usage Trends
                </h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <p>Usage trend chart will be implemented here</p>
                </div>
              </div>
            </div>
          )}

          {/* Device Status Tab */}
          {activeTab === "devices" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                  title="Active Devices"
                  value={analyticsData.statusDistribution.active}
                  icon={CheckCircle}
                  color="bg-green-100 text-green-600"
                />
                <StatCard
                  title="Offline Devices"
                  value={analyticsData.statusDistribution.offline}
                  icon={XCircle}
                  color="bg-gray-100 text-gray-600"
                />
                <StatCard
                  title="Low Battery"
                  value={analyticsData.statusDistribution.lowBattery}
                  icon={Battery}
                  color="bg-yellow-100 text-yellow-600"
                />
                <StatCard
                  title="Critical Battery"
                  value={analyticsData.statusDistribution.criticalBattery}
                  icon={AlertTriangle}
                  color="bg-red-100 text-red-600"
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Device Status Overview
                </h3>
                <DonutChart data={statusChartData} />
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === "alerts" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Alerts"
                  value={analyticsData.alerts.total}
                  icon={AlertTriangle}
                  color="bg-orange-100 text-orange-600"
                />
                <StatCard
                  title="Tissue Alerts"
                  value={analyticsData.alerts.tissue}
                  icon={Droplets}
                  color="bg-yellow-100 text-yellow-600"
                />
                <StatCard
                  title="Battery Alerts"
                  value={analyticsData.alerts.battery}
                  icon={Battery}
                  color="bg-red-100 text-red-600"
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Alert Distribution
                </h3>
                <DonutChart data={alertChartData} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Download Options Modal */}
      {showDownloadOptions && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Export Analytics Data
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleDownload("json")}
                  disabled={downloading}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {downloading ? "Downloading..." : "Export as JSON"}
                </button>
                <button
                  onClick={() => handleDownload("csv")}
                  disabled={downloading}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {downloading ? "Downloading..." : "Export as CSV"}
                </button>
                <button
                  onClick={() => handleDownload("pdf")}
                  disabled={downloading}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  <FilePieChart className="h-4 w-4 mr-2" />
                  {downloading ? "Downloading..." : "Export as PDF"}
                </button>
                <button
                  onClick={() => setShowDownloadOptions(false)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
