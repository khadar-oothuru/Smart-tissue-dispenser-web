import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  IoArrowBack,
  IoDownloadOutline,
  IoDownload,
  IoLocation,
  IoBatteryCharging,
  IoWifi,
  IoSettings,
  IoChevronDown,
  IoChevronUp,
  IoTimeOutline,
  IoCalendarOutline,
  IoHardwareChipOutline,
  IoCellularOutline,
  IoSpeedometerOutline,
  IoAnalyticsOutline,
  IoDocumentTextOutline,
  IoSettingsOutline,
  IoCalendar,
} from "react-icons/io5";
import {
  MdSettings,
  MdCheckCircle,
  MdWifiOff,
  MdArchive,
  MdCancel,
  MdShield,
} from "react-icons/md";
import { FiDownload } from "react-icons/fi";
import { useThemeContext } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { DonutChart } from "../components/Analytics/ChartComponents/DonutChart";
import { AreaLineChart } from "../components/Analytics/ChartComponents/AreaLineChart";
import LoadingScreen from "../components/common/LoadingScreen";
import {
  CustomAlert,
  DownloadOptionsAlert,
} from "../components/common/CustomAlert";
import { getDeviceStatusConfig } from "../utils/deviceStatusConfig";
import {
  getDeviceDetails,
  fetchDeviceAnalytics,
  fetchTimeBasedAnalytics,
  fetchDeviceStatusDistribution,
  fetchDeviceRealtimeStatus,
  downloadAnalytics,
} from "../utils/api";

export default function DeviceDetails() {
  const { themeColors, isDark } = useThemeContext();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [device, setDevice] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [timeBasedData, setTimeBasedData] = useState(null);
  const [statusDistribution, setStatusDistribution] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [alertTrendsLoading, setAlertTrendsLoading] = useState(false);

  // Custom Alert States
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "warning",
    primaryAction: null,
    secondaryAction: null,
  });
  const [downloadOptionsAlert, setDownloadOptionsAlert] = useState({
    visible: false,
    format: "",
    onShare: null,
    onDownload: null,
    onCancel: null,
  });

  // Extract device info from params
  const deviceId = searchParams.get("deviceId");
  const deviceName = searchParams.get("deviceName") || "Device";
  const paramDeviceStatus = searchParams.get("deviceStatus") || "unknown";
  const paramIsActive = searchParams.get("isActive") === "true";
  const room = searchParams.get("room") || "Unknown";
  const floor = searchParams.get("floor") || "N/A";

  // Determine actual device status from device data or fallback to params
  const deviceStatus =
    device?.status || realtimeStatus?.status || paramDeviceStatus;
  const isActive =
    device?.is_active !== undefined
      ? device.is_active
      : realtimeStatus?.is_active !== undefined
      ? realtimeStatus.is_active
      : paramIsActive;

  // Helper function to get total usage count
  const getTotalUsage = () => {
    const totalUsage =
      realtimeStatus?.total_usage ||
      device?.total_usage ||
      analytics?.total_usage ||
      realtimeStatus?.current_count ||
      analytics?.total_entries;

    return totalUsage && totalUsage > 0 ? totalUsage : 0;
  };

  const initializeData = useCallback(async () => {
    if (!accessToken) {
      showCustomAlert(
        "Authentication Error",
        "Authentication token not found. Please login again.",
        "error",
        {
          text: "Go to Login",
          onPress: () => navigate("/login"),
        }
      );
      return;
    }

    try {
      setLoading(true);

      const [deviceDetails, analyticsData, timeData, statusData, realtimeData] =
        await Promise.allSettled([
          getDeviceDetails(accessToken, deviceId),
          fetchDeviceAnalytics(accessToken),
          fetchTimeBasedAnalytics(accessToken, selectedPeriod, deviceId),
          fetchDeviceStatusDistribution(accessToken),
          fetchDeviceRealtimeStatus(accessToken, deviceId),
        ]);

      if (deviceDetails.status === "fulfilled") {
        setDevice(deviceDetails.value);
      }

      if (analyticsData.status === "fulfilled") {
        setAnalytics(analyticsData.value);
      }

      if (timeData.status === "fulfilled") {
        setTimeBasedData(timeData.value);
      }

      if (statusData.status === "fulfilled") {
        setStatusDistribution(statusData.value);
      }

      if (realtimeData.status === "fulfilled" && realtimeData.value) {
        const deviceRealtimeData = Array.isArray(realtimeData.value)
          ? realtimeData.value.find(
              (device) => device.device_id === parseInt(deviceId)
            )
          : realtimeData.value;
        setRealtimeStatus(deviceRealtimeData);
      }
    } catch (error) {
      console.error("Data loading error:", error);
      showCustomAlert(
        "Data Loading Failed",
        "Failed to load device data. Please check your connection and try again.",
        "error",
        {
          text: "Retry",
          onPress: () => initializeData(),
        }
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, navigate, deviceId, selectedPeriod]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Handler for period toggle
  const handlePeriodChange = async (newPeriod) => {
    if (newPeriod === selectedPeriod || !accessToken) return;

    try {
      setAlertTrendsLoading(true);
      setSelectedPeriod(newPeriod);

      const timeData = await fetchTimeBasedAnalytics(
        accessToken,
        newPeriod,
        deviceId
      );
      setTimeBasedData(timeData);
    } catch (error) {
      console.error("Failed to fetch period data:", error);
      showCustomAlert(
        "Update Failed",
        "Failed to update alert trends data. Please try again.",
        "error"
      );
    } finally {
      setAlertTrendsLoading(false);
    }
  };

  // Custom Alert Helper Functions
  const showCustomAlert = (
    title,
    message,
    type = "warning",
    primaryAction = null,
    secondaryAction = null
  ) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      type,
      primaryAction,
      secondaryAction,
    });
  };

  const showDownloadOptions = (
    format,
    onShare,
    onDownload,
    onCancel = null
  ) => {
    setDownloadOptionsAlert({
      visible: true,
      format,
      onShare,
      onDownload,
      onCancel,
    });
  };

  const showToast = (message) => {
    // For web, you can use a toast library or create a simple notification
    console.log(message);
  };

  const handleDownload = async (format) => {
    if (downloading) {
      showCustomAlert(
        "Download in Progress",
        "Please wait for the current download to complete before starting a new one.",
        "warning"
      );
      return false;
    }

    return new Promise((resolve) => {
      showDownloadOptions(
        format,
        () => {
          processDownload(format, "share")
            .then(resolve)
            .catch(() => resolve(false));
        },
        () => {
          processDownload(format, "download")
            .then(resolve)
            .catch(() => resolve(false));
        },
        () => {
          resolve(false);
        }
      );
    });
  };

  const processDownload = async (format, action) => {
    if (downloading) return false;

    try {
      setDownloading(true);
      showToast(`Preparing ${format.toUpperCase()} file...`);

      let result;
      const periodsToTry = ["weekly", "daily", "monthly"];
      let lastError = null;

      for (const period of periodsToTry) {
        try {
          result = await downloadAnalytics(
            accessToken,
            period,
            format,
            deviceId
          );

          if (result && (result.data || result)) {
            break;
          }
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      if (!result) {
        throw lastError || new Error("No data available for this device");
      }

      let fileData = result.data || result;

      if (!fileData || fileData === "" || fileData === "null") {
        if (format === "json") {
          fileData = JSON.stringify(
            {
              device_id: deviceId,
              message: "No analytics data available for this device",
              generated_at: new Date().toISOString(),
            },
            null,
            2
          );
        } else if (format === "csv") {
          fileData = `Device ID,Message,Generated At\n${deviceId},"No analytics data available",${new Date().toISOString()}`;
        } else if (format === "pdf") {
          throw new Error("No PDF data available for this device");
        }
      }

      // Web download handling
      let blob;
      if (format === "csv") {
        blob = new Blob([fileData], { type: "text/csv" });
      } else if (format === "json") {
        blob = new Blob([fileData], { type: "application/json" });
      } else if (format === "pdf") {
        blob = new Blob([fileData], { type: "application/pdf" });
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `device_${deviceId}_analytics_complete_${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      link.click();
      URL.revokeObjectURL(url);

      showCustomAlert(
        "Download Complete",
        `Your complete device analytics data has been downloaded as a ${format.toUpperCase()} file.`,
        "success"
      );
      return true;
    } catch (error) {
      console.error("Download/Share failed:", error);
      showCustomAlert(
        "Operation Failed",
        error.message,
        "error",
        {
          text: "Retry",
          onPress: () => handleDownload(format),
        }
      );
      return false;
    } finally {
      setDownloading(false);
    }
  };

  const toggleExportOptions = () => {
    setShowExportOptions(!showExportOptions);
  };

    const getAlertTrendsData = () => {
    if (!timeBasedData?.data || !Array.isArray(timeBasedData.data)) return null;

    const deviceData =
      timeBasedData.data.find(
        (device) => device.device_id === parseInt(deviceId)
      ) || timeBasedData.data[0];

    if (!deviceData?.periods || !Array.isArray(deviceData.periods)) return null;

    const periods = deviceData.periods;
    if (periods.length === 0) return null;

    const labels = periods.map((period) => {
      if (period.period_name) {
        const parts = period.period_name.split(" ");
        if (parts.length > 1) {
          return parts[1];
        }
      }
      return period.period ? period.period.substring(0, 10) : "N/A";
    });

    const lowAlerts = periods.map((period) => period.low_alerts || 0);
    const emptyAlerts = periods.map((period) => period.empty_alerts || 0);
    const fullAlerts = periods.map((period) => period.full_alerts || 0);
    const tamperAlerts = periods.map((period) => period.tamper_alerts || 0);

    const totalLowAlerts = lowAlerts.reduce((a, b) => a + b, 0);
    const totalEmptyAlerts = emptyAlerts.reduce((a, b) => a + b, 0);
    const totalFullAlerts = fullAlerts.reduce((a, b) => a + b, 0);
    const totalTamperAlerts = tamperAlerts.reduce((a, b) => a + b, 0);

    const tamperConfig = getDeviceStatusConfig("tamper", null, isDark);
    const lowConfig = getDeviceStatusConfig("low", null, isDark);
    const emptyConfig = getDeviceStatusConfig("empty", null, isDark);
    const fullConfig = getDeviceStatusConfig("full", null, isDark);

    return {
      labels,
      alertDatasets: {
        full_alerts: fullAlerts,
        empty_alerts: emptyAlerts,
        low_alerts: lowAlerts,
        tamper_alerts: tamperAlerts,
      },
      macros: [
        {
          name: "Low",
          value: totalLowAlerts,
          color: lowConfig.color,
          unit: "",
        },
        {
          name: "Empty",
          value: totalEmptyAlerts,
          color: emptyConfig.color,
          unit: "",
        },
        {
          name: "Full",
          value: totalFullAlerts,
          color: fullConfig.color,
          unit: "",
        },
        {
          name: "Tamper",
          value: totalTamperAlerts,
          color: tamperConfig.color,
          unit: "",
        },
      ],
    };
  };

  const getCurrentDevice = () => {
    return statusDistribution?.devices?.find(
      (device) => device.device_id === parseInt(deviceId)
    );
  };

  const getStatusChartData = () => {
    if (!statusDistribution?.devices) return [];

    const currentDevice = getCurrentDevice();
    if (!currentDevice?.status_counts) return [];

    const statusCounts = currentDevice.status_counts;
    const allowedStatuses = ["tamper", "empty", "low", "full"];

    const chartData = Object.entries(statusCounts)
      .filter(
        ([status, count]) =>
          count > 0 && allowedStatuses.includes(status.toLowerCase())
      )
      .map(([status, count]) => {
        const statusConfig = getDeviceStatusConfig(status, null, isDark);
        return {
          name: status.charAt(0).toUpperCase() + status.slice(1),
          population: count,
          value: count,
          color: statusConfig.color,
          legendFontColor: themeColors.text,
          legendFontSize: 14,
        };
      });

    return chartData;
  };

  const getStatusGradient = (status) => {
    const statusConfig = getDeviceStatusConfig(status, isActive, isDark);
    return statusConfig.gradient;
  };

  const getBatteryLevel = () => {
    const batteryPercentage = realtimeStatus?.battery_percentage;
    if (batteryPercentage && batteryPercentage > 0) {
      return Math.round(batteryPercentage);
    }

    const directBatteryLevel =
      realtimeStatus?.battery_level ||
      device?.battery_level ||
      analytics?.battery_level;

    if (directBatteryLevel && directBatteryLevel > 0) {
      return Math.round(directBatteryLevel);
    }

    return null;
  };

  const getSignalStrength = () => {
    const signalStrength =
      realtimeStatus?.signal_strength ||
      device?.signal_strength ||
      analytics?.signal_strength;

    return signalStrength && signalStrength > 0
      ? Math.round(signalStrength)
      : null;
  };

  if (loading) {
    return (
      <LoadingScreen
        message="Loading Device Details"
        submessage="Fetching analytics and real-time data..."
        variant="fullscreen"
        iconName="device-analytics"
        customIcon={
          <MdSettings className="text-5xl text-primary animate-pulse" />
        }
        iconSize={60}
      />
    );
  }

  const statusChartData = getStatusChartData();
  const batteryLevel = getBatteryLevel();
  const signalStrength = getSignalStrength();
  const statusConfig = getDeviceStatusConfig(deviceStatus, isActive, isDark);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="w-full">
        {/* Modern Header with Gradient */}
        <div className={`${isDark ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-white to-gray-50'} px-4 py-6 shadow-sm`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark 
                    ? 'bg-primary/20 hover:bg-primary/30 border border-primary/50' 
                    : 'bg-primary/10 hover:bg-primary/20'
                }`}
              >
                <IoArrowBack className="w-6 h-6 text-primary" />
              </button>

              <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Device Details
              </h1>

              <button
                onClick={toggleExportOptions}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  showExportOptions
                    ? isDark 
                      ? 'bg-primary/30 border border-primary' 
                      : 'bg-primary/20'
                    : isDark 
                      ? 'bg-primary/20 border border-primary/50' 
                      : 'bg-primary/10'
                }`}
              >
                {showExportOptions ? (
                  <IoDownload className="w-6 h-6 text-primary" />
                ) : (
                  <IoDownloadOutline className="w-6 h-6 text-primary" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className={`h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

        <div className="max-w-7xl mx-auto p-4 space-y-6">
          {/* Hero Card */}
          <div 
            className="relative overflow-hidden rounded-2xl shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${getStatusGradient(deviceStatus)[0]}, ${getStatusGradient(deviceStatus)[1]})`,
            }}
          >
            <div className="p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  {statusConfig?.icon === "check-circle" ? (
                    <MdCheckCircle className="w-8 h-8 text-white" />
                  ) : statusConfig?.icon === "wifi-off" ? (
                    <MdWifiOff className="w-8 h-8 text-white" />
                  ) : (
                    <MdSettings className="w-8 h-8 text-white" />
                  )}
                </div>
                <div className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
                  <IoLocation className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {room} • Floor {floor}
                  </span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-1">{deviceName}</h2>
              <p className="text-white/80 mb-4">ID: {deviceId}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <p className="text-2xl font-bold">{deviceStatus.toUpperCase()}</p>
                  <p className="text-sm text-white/80">Status</p>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <p className="text-2xl font-bold">{getTotalUsage() || "0"}</p>
                  <p className="text-sm text-white/80">Total Usage</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: getDeviceStatusConfig("normal", true, isDark).color }}>
                  <IoBatteryCharging className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Battery Level
                  </p>
                  <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {batteryLevel !== null ? `${batteryLevel}%` : "N/A"}
                  </p>
                  {batteryLevel !== null && (
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${batteryLevel}%`,
                          backgroundColor:
                            batteryLevel > 20
                              ? getDeviceStatusConfig("normal", true, isDark).color
                              : getDeviceStatusConfig("empty", null, isDark).color,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: getDeviceStatusConfig("full", null, isDark).color }}>
                  <IoWifi className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Signal Strength
                  </p>
                  <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {signalStrength !== null ? `${signalStrength}%` : "N/A"}
                  </p>
                  {signalStrength !== null && (
                    <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${signalStrength}%`,
                          backgroundColor: getDeviceStatusConfig("full", null, isDark).color,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <MdSettings className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Technical Details
              </h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailRow
                icon={<IoHardwareChipOutline />}
                iconColor={getDeviceStatusConfig("low", null, isDark).color}
                label="Device ID"
                value={deviceId}
                isDark={isDark}
              />
              <DetailRow
                icon={<IoCalendarOutline />}
                iconColor={getDeviceStatusConfig("full", null, isDark).color}
                label="Device Added"
                value={
                  getCurrentDevice()?.timestamps?.device_added
                    ? new Date(
                        getCurrentDevice().timestamps.device_added
                      ).toLocaleDateString()
                    : "N/A"
                }
                isDark={isDark}
              />
              <DetailRow
                icon={<IoLocation />}
                iconColor={getDeviceStatusConfig("normal", true, isDark).color}
                label="Location"
                value={`${room}, Floor ${floor}`}
                isDark={isDark}
              />
              <DetailRow
                icon={<IoTimeOutline />}
                iconColor={getDeviceStatusConfig("tamper", null, isDark).color}
                label="Last Updated"
                value={
                  realtimeStatus?.last_updated
                    ? new Date(realtimeStatus.last_updated).toLocaleString()
                    : "N/A"
                }
                isDark={isDark}
              />
              <DetailRow
                icon={<IoCellularOutline />}
                iconColor={getDeviceStatusConfig("empty", null, isDark).color}
                label="Current Alert"
                value={realtimeStatus?.current_alert || "None"}
                isDark={isDark}
              />
              <DetailRow
                icon={<IoSpeedometerOutline />}
                iconColor={getDeviceStatusConfig("low", null, isDark).color}
                label="Battery Percentage"
                value={
                  realtimeStatus?.battery_percentage
                    ? `${Math.round(realtimeStatus.battery_percentage)}%`
                    : "N/A"
                }
                isDark={isDark}
              />
              <DetailRow
                icon={<IoCalendar />}
                iconColor={getDeviceStatusConfig("normal", true, isDark).color}
                label="Device Status"
                value={(
                  realtimeStatus?.current_status || deviceStatus
                ).toUpperCase()}
                isDark={isDark}
              />
              <DetailRow
                icon={<IoAnalyticsOutline />}
                iconColor={getDeviceStatusConfig("full", null, isDark).color}
                label="Total Usage Count"
                value={getTotalUsage().toString()}
                isDark={isDark}
              />
              <DetailRow
                icon={<IoDocumentTextOutline />}
                iconColor={getDeviceStatusConfig("full", null, isDark).color}
                label="Tissue Type"
                value={
                  device?.tissue_type === "hand_towel"
                    ? "Hand Towel"
                    : device?.tissue_type === "toilet_paper"
                    ? "Toilet Paper"
                    : "N/A"
                }
                isDark={isDark}
              />
              <DetailRow
                icon={<IoAnalyticsOutline />}
                iconColor={getDeviceStatusConfig("low", null, isDark).color}
                label="Meter Capacity"
                value={device?.meter_capacity || "N/A"}
                isDark={isDark}
              />
              <DetailRow
                icon={<IoSettingsOutline />}
                iconColor={getDeviceStatusConfig("tamper", null, isDark).color}
                label="Reference Value"
                value={device?.refer_value || device?.meter_capacity || "N/A"}
                isDark={isDark}
              />
            </div>
          </div>

          {/* Alert Trends Chart */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Alert Trends
                  </h3>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Daily
                  </span>
                  <button
                    onClick={() =>
                      handlePeriodChange(
                        selectedPeriod === "daily" ? "weekly" : "daily"
                      )
                    }
                    disabled={alertTrendsLoading}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      selectedPeriod === "weekly"
                        ? 'bg-primary'
                        : isDark ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                        selectedPeriod === "weekly" ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </button>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Weekly
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4">
              {getAlertTrendsData() ? (
                <>
                  {alertTrendsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingScreen
                        message="Updating Trends"
                        submessage={`Loading ${selectedPeriod} data...`}
                        variant="minimal"
                        iconName="chart-line"
                        iconSize={24}
                      />
                    </div>
                  ) : (
                    <>
                      {/* Alert Summary Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {getAlertTrendsData().macros.map((macro, index) => (
                          <div
                            key={index}
                            className="relative overflow-hidden rounded-lg p-3 border-l-4"
                            style={{
                              backgroundColor: `${macro.color}15`,
                              borderLeftColor: macro.color,
                            }}
                          >
                            <div className="flex items-start space-x-2">
                              <div
                                className="p-1.5 rounded"
                                style={{ backgroundColor: macro.color }}
                              >
                                {macro.name === "Low" ? (
                                  <MdArchive className="w-4 h-4 text-white" />
                                ) : macro.name === "Empty" ? (
                                  <MdCancel className="w-4 h-4 text-white" />
                                ) : macro.name === "Full" ? (
                                  <MdArchive className="w-4 h-4 text-white" />
                                ) : (
                                  <MdShield className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <div>
                                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {macro.value}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {macro.name}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <AreaLineChart
                        data={getAlertTrendsData()}
                        title=""
                        subtitle={`${
                          selectedPeriod.charAt(0).toUpperCase() +
                          selectedPeriod.slice(1)
                        } alert patterns`}
                        showMacros={false}
                        scrollable={true}
                      />
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    No alert data available
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                    Alert trends will appear here when data is available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Export Data Section */}
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <FiDownload className="w-5 h-5 text-primary" />
                </div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Export Complete Device Data
                </h3>
              </div>

              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Download comprehensive analytics for this device including all
                available data and trends.
              </p>

              {showExportOptions ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleDownload("csv")}
                      disabled={downloading}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                        downloading
                          ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                          : 'bg-primary/10 border-primary hover:bg-primary/20'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className={downloading ? 'text-gray-500' : 'text-primary'}>
                        {downloading ? "..." : "CSV"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleDownload("json")}
                      disabled={downloading}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                        downloading
                          ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                          : 'bg-primary/10 border-primary hover:bg-primary/20'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <span className={downloading ? 'text-gray-500' : 'text-primary'}>
                        {downloading ? "..." : "JSON"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleDownload("pdf")}
                      disabled={downloading}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                        downloading
                          ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                          : 'bg-primary/10 border-primary hover:bg-primary/20'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className={downloading ? 'text-gray-500' : 'text-primary'}>
                        {downloading ? "..." : "PDF"}
                      </span>
                    </button>
                  </div>

                  {downloading && (
                    <div className="flex items-center space-x-2 text-sm text-primary">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Downloading... Please wait</span>
                    </div>
                  )}

                  <button
                    onClick={toggleExportOptions}
                    className={`flex items-center justify-center space-x-2 w-full py-2 rounded-lg transition-all duration-200 ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <IoChevronUp className="w-5 h-5" />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Hide Options
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={toggleExportOptions}
                  className="flex items-center justify-center space-x-2 w-full py-2 px-4 rounded-lg border border-primary bg-primary/10 hover:bg-primary/20 transition-all duration-200"
                >
                  <IoChevronDown className="w-5 h-5 text-primary" />
                  <span className="text-primary">Show Export Options</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Padding */}
          <div className="h-8" />
        </div>
      </div>

      {/* Custom Alert Modals */}
      <CustomAlert
        visible={customAlert.visible}
        onClose={() => setCustomAlert((prev) => ({ ...prev, visible: false }))}
        title={customAlert.title}
        message={customAlert.message}
        type={customAlert.type}
        primaryAction={customAlert.primaryAction}
        secondaryAction={customAlert.secondaryAction}
        themeColors={themeColors}
        isDark={isDark}
      />

      <DownloadOptionsAlert
        visible={downloadOptionsAlert.visible}
        onClose={() => {
          if (downloadOptionsAlert.onCancel) {
            downloadOptionsAlert.onCancel();
          }
          setDownloadOptionsAlert((prev) => ({ ...prev, visible: false }));
        }}
        format={downloadOptionsAlert.format}
        onShare={downloadOptionsAlert.onShare}
        onDownload={downloadOptionsAlert.onDownload}
        themeColors={themeColors}
        isDark={isDark}
      />
    </div>
  );
}

// Detail Row Component
const DetailRow = ({ icon, iconColor, label, value, isDark }) => (
  <div className="flex items-start space-x-3">
    <div 
      className="p-2 rounded-lg flex-shrink-0"
      style={{ backgroundColor: `${iconColor}20` }}
    >
      <div className="w-4 h-4" style={{ color: iconColor }}>
        {icon}
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </p>
      <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'} break-words`}>
        {value}
      </p>
    </div>
  </div>
);

// Custom Alert Component (Web Version)
export const CustomAlert = ({ 
  visible, 
  onClose, 
  title, 
  message, 
  type = "warning", 
  primaryAction, 
  secondaryAction,
  themeColors,
  isDark 
}) => {
  if (!visible) return null;

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return { icon: '✓', color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/20' };
      case 'error':
        return { icon: '✕', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' };
      case 'info':
        return { icon: 'ℹ', color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' };
      default:
        return { icon: '⚠', color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' };
    }
  };

  const alertStyle = getAlertStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full overflow-hidden`}>
        <div className={`p-4 ${alertStyle.bgColor}`}>
          <div className="flex items-start">
            <span className={`text-2xl ${alertStyle.color} mr-3`}>{alertStyle.icon}</span>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h3>
              <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 flex justify-end space-x-3">
          {secondaryAction && (
            <button
              onClick={() => {
                secondaryAction.onPress();
                onClose();
              }}
              className={`px-4 py-2 rounded-lg ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } transition-colors duration-200`}
            >
              {secondaryAction.text}
            </button>
          )}
          <button
            onClick={() => {
              if (primaryAction) primaryAction.onPress();
              onClose();
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            {primaryAction?.text || 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Download Options Alert Component (Web Version)
export const DownloadOptionsAlert = ({
  visible,
  onClose,
  format,
  onShare,
  onDownload,
  themeColors,
  isDark
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-sm w-full`}>
        <div className="p-6">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Export {format.toUpperCase()} File
          </h3>
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Choose how you want to save the file:
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                onDownload();
                onClose();
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              <IoDownload className="w-5 h-5" />
              <span>Download to Device</span>
            </button>
            
            <button
              onClick={() => {
                onShare();
                onClose();
              }}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border transition-colors duration-200 ${
                isDark 
                  ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                  : 'border-gray-300 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9 9 0 10-13.432 0m13.432 0A9 9 0 0112 21a9 9 0 01-5.716-2.026m13.432 0c1.157-1.157 2.03-2.578 2.492-4.182M3.792 14.792c.462 1.604 1.335 3.025 2.492 4.182" />
              </svg>
              <span>Share File</span>
            </button>
            
            <button
              onClick={onClose}
              className={`w-full px-4 py-3 rounded-lg ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } transition-colors duration-200`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DetailRow };