import React, { useMemo } from "react";
// import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Power,
  Battery,
  Wifi,
  WifiOff,
  Zap,
  Globe,
  Users,
  Smartphone,
  AlertTriangle,
} from "lucide-react";

const LandingPageTop = ({
  stats,
  realtimeStatus = [],
  onRefresh,
  isLoading = false,
  onDeviceCardClick,
}) => {
  // const navigate = useNavigate();

  // Helper: get health color
  const getHealthColor = (health) => {
    const colorMap = {
      Excellent: "text-green-500",
      Good: "text-blue-500",
      Fair: "text-yellow-500",
      Poor: "text-orange-500",
      Critical: "text-red-500",
    };
    return colorMap[health] || "text-gray-500";
  };

  // Helper: get health icon
  const getHealthIcon = (health) => {
    if (health === "Excellent" || health === "Good") {
      return CheckCircle;
    }
    return AlertCircle;
  };

  // Enhanced device statistics calculation (unified with mobile app logic)
  const enhancedStats = useMemo(() => {
    const totalDevices = stats?.totalDevices || 0;
    const activeDevices = stats?.activeDevices || 0;
    // Calculate offline devices: total - active
    const offlineDevices = totalDevices - activeDevices;

    // Calculate no power devices from realtimeStatus (pwr_sts = "no" or power_status false/0)
    let noPowerDevices = 0;
    if (Array.isArray(realtimeStatus)) {
      noPowerDevices = realtimeStatus.filter(
        (d) =>
          d.pwr_sts === "no" ||
          d.power_status === false ||
          d.power_status === 0 ||
          d.status === "Power Off"
      ).length;
    } else {
      noPowerDevices = stats?.noPowerDevices || 0;
    }

    // Critical devices (battery_level <= 10)
    let criticalDevices = 0;
    if (Array.isArray(realtimeStatus)) {
      criticalDevices = realtimeStatus.filter(
        (d) => d.battery_level !== undefined && d.battery_level <= 10
      ).length;
    } else {
      criticalDevices = stats?.criticalDevices || 0;
    }

    // Health percentage
    const healthPercentage =
      totalDevices > 0
        ? Math.max(0, Math.min(100, (activeDevices / totalDevices) * 100))
        : 0;

    // System health logic (unified)
    const systemHealth = (() => {
      if (totalDevices === 0) return "Unknown";
      const activePercentage = (activeDevices / totalDevices) * 100;
      const criticalPercentage = (criticalDevices / totalDevices) * 100;
      if (activePercentage >= 90 && criticalPercentage < 5) return "Excellent";
      if (activePercentage >= 80 && criticalPercentage < 10) return "Good";
      if (activePercentage >= 70 && criticalPercentage < 20) return "Fair";
      if (activePercentage >= 50 && criticalPercentage < 30) return "Poor";
      return "Critical";
    })();

    return {
      totalDevices,
      activeDevices,
      offlineDevices,
      noPowerDevices,
      criticalDevices,
      healthPercentage: Math.round(healthPercentage),
      systemHealth,
      recentActivity24h: stats?.recentActivity24h || 0,
      totalEntries: stats?.totalEntries || 0,
      uptime: "99.9%", // This would come from backend
    };
  }, [stats, realtimeStatus]);

  const HealthIcon = getHealthIcon(enhancedStats.systemHealth);

  return (
    <div className="bg-gradient-to-r  rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 mb-8 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full translate-y-12 -translate-x-12" />

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
              <Activity size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                System Overview
              </h2>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="text-blue-100 text-sm font-medium">
                    Live Status
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe size={16} className="text-blue-300" />
                  <span className="text-blue-100 text-sm font-medium">
                    {enhancedStats.activeDevices}/{enhancedStats.totalDevices}{" "}
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-xs text-blue-200">Last Updated</div>
              <div className="text-sm font-medium text-white">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 disabled:opacity-50 backdrop-blur-sm border border-white/20"
            >
              <RefreshCw
                size={20}
                className={`text-white ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Main Stats Section - simplified and realigned */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Devices */}
          <div
            className="text-center group cursor-pointer"
            onClick={() =>
              window.location.assign("/admin/devices/summary/total")
            }
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1 md:p-2 mb-1 border border-white/20 hover:bg-white/30 transition-all duration-200 min-h-[90px] md:min-h-[100px] max-w-[320px] mx-auto">
              <div className="w-7 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Globe size={20} className="text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {enhancedStats.totalDevices}
              </div>
            </div>
            <div className="text-blue-100 text-sm font-medium">
              Total Devices
            </div>
          </div>

          {/* Active Devices */}
          <div
            className="text-center group cursor-pointer"
            onClick={() =>
              window.location.assign("/admin/devices/summary/active")
            }
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1 md:p-2 mb-1 border border-white/20 hover:bg-white/30 transition-all duration-200 min-h-[90px] md:min-h-[100px] max-w-[320px] mx-auto">
              <div className="w-7 h-8 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Activity size={20} className="text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {enhancedStats.activeDevices}
              </div>
            </div>
            <div className="text-blue-100 text-sm font-medium">Active</div>
          </div>

          {/* Offline Devices */}
          <div
            className="text-center group cursor-pointer"
            onClick={() =>
              window.location.assign("/admin/devices/summary/offline")
            }
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1 md:p-2 mb-1 border border-white/20 hover:bg-white/30 transition-all duration-200 min-h-[90px] md:min-h-[100px] max-w-[320px] mx-auto">
              <div className="w-7 h-8 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <WifiOff size={20} className="text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {enhancedStats.offlineDevices}
              </div>
            </div>
            <div className="text-blue-100 text-sm font-medium">Offline</div>
          </div>

          {/* No Power Devices */}
          <div
            className="text-center group cursor-pointer"
            onClick={() =>
              window.location.assign("/admin/devices/summary/no-power")
            }
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-1 md:p-2 mb-1 border border-white/20 hover:bg-white/30 transition-all duration-200 min-h-[90px] md:min-h-[100px] max-w-[320px] mx-auto">
              <div className="w-7 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Power size={20} className="text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {enhancedStats.noPowerDevices}
              </div>
            </div>
            <div className="text-blue-100 text-sm font-medium">No Power</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPageTop;
