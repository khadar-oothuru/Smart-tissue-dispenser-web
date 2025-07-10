// AlertDevicesScreen.jsx
import React, { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import DeviceCard from "../components/AdminDash/DeviceCard";
import { useThemeContext } from "../context/ThemeContext";
import { useDeviceStore } from "../store/useDeviceStore";
import DeviceHeader from "../components/DeviceHeader"; // Fix the import path
import { useNavigate, useParams } from "react-router-dom";
import {
  getDeviceStatusConfig,
  isTissueAlert,
  isBatteryAlert,
} from "../utils/deviceStatusConfig";

const ALERT_TYPE_MAP = {
  empty: {
    title: "Empty Dispensers",
    noData: "No empty devices found.",
  },
  tamper: {
    title: "Tamper Alerts",
    noData: "No tamper alert devices found.",
  },
  low: {
    title: "Low Alerts",
    noData: "No low alert devices found.",
  },
  alerts: {
    title: "Device Alerts",
    noData: "No alert devices found.",
  },
  all: {
    title: "Total Dispensers",
    noData: "No dispensers found.",
  },
  active: {
    title: "Active Devices",
    noData: "No active devices found.",
  },
  offline: {
    title: "Offline Devices",
    noData: "No offline devices found.",
  },
  full: {
    title: "Full Devices",
    noData: "No full devices found.",
  },
};

export default function AlertDevicesScreen() {
  const { themeColors, isDark } = useThemeContext();
  const navigate = useNavigate();
  const { alertType = "all" } = useParams();
  const deviceStore = useDeviceStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Merge analytics, real-time status, and device info
  const mergedDevices = useMemo(() => {
    const devices = Array.isArray(deviceStore.devices)
      ? deviceStore.devices
      : [];
    const analytics = Array.isArray(deviceStore.analytics)
      ? deviceStore.analytics
      : [];
    const realtimeStatus = Array.isArray(deviceStore.realtimeStatus)
      ? deviceStore.realtimeStatus
      : [];
    
    // Create maps for efficient lookup
    const analyticsMap = new Map(
      analytics.map((a) => [a.device_id || a.id, a])
    );
    const statusMap = new Map(realtimeStatus.map((s) => [s.device_id, s]));
    
    return devices.map((device) => {
      const analyticsData = analyticsMap.get(device.id) || {};
      const status = statusMap.get(device.id) || {};
      
      // Ensure we have all necessary fields for DeviceCard
      return {
        ...device,
        ...analyticsData,
        ...status,
        // Essential fields for DeviceCard
        id: device.id,
        device_id: device.id || device.device_id,
        name: device.name || analyticsData.device_name || status.device_name || `Device ${device.id}`,
        device_name: device.name || analyticsData.device_name || status.device_name || `Device ${device.id}`,
        room: device.room || analyticsData.room || status.room || "",
        floor: device.floor || analyticsData.floor || status.floor || "",
        
        // Status information
        is_active: status.is_active ?? analyticsData.is_active ?? device.is_active ?? true,
        current_status: status.current_status || analyticsData.current_status || device.current_status || "unknown",
        status_priority: status.status_priority ?? analyticsData.status_priority ?? device.status_priority ?? 0,
        
        // Alert counts
        low_alert_count: analyticsData.low_alert_count || status.low_alert_count || 0,
        tamper_count: analyticsData.tamper_count || status.tamper_count || 0,
        total_entries: analyticsData.total_entries || status.total_entries || 0,
        
        // Timing information
        minutes_since_update: status.minutes_since_update ?? analyticsData.minutes_since_update ?? null,
        last_alert_time: status.last_alert_time || analyticsData.last_alert_time || device.last_alert_time,
        last_update: status.last_update || analyticsData.last_update || device.last_update,
        
        // Current alerts
        current_alert: status.current_alert || false,
        current_tamper: status.current_tamper || false,
        current_count: status.current_count || device.current_count || 0,
        
        // Power status
        power_status: device.power_status ?? status.power_status ?? analyticsData.power_status ?? "on",
      };
    });
  }, [deviceStore.devices, deviceStore.analytics, deviceStore.realtimeStatus]);

  // Sort devices by priority
  const sortedDevices = useMemo(() => {
    const getDevicePriority = (device) => {
      const statusConfig = getDeviceStatusConfig(
        device.current_status,
        device.is_active,
        isDark
      );
      return statusConfig.priority;
    };
    
    return [...mergedDevices].sort((a, b) => {
      const aPriority = getDevicePriority(a);
      const bPriority = getDevicePriority(b);
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      const aTime = a.minutes_since_update || 0;
      const bTime = b.minutes_since_update || 0;
      if (aTime !== bTime) return aTime - bTime;
      
      const totalAlertsA = (a.low_alert_count || 0) + (a.tamper_count || 0);
      const totalAlertsB = (b.low_alert_count || 0) + (b.tamper_count || 0);
      return totalAlertsB - totalAlertsA;
    });
  }, [mergedDevices, isDark]);

  // Main filteredDevices logic
  const filteredDevices = useMemo(() => {
    if (!sortedDevices || sortedDevices.length === 0) return [];
    let devices = [...sortedDevices];
    
    switch (alertType) {
      case "empty":
        devices = devices.filter(
          (device) => (device.current_status || "").toLowerCase() === "empty"
        );
        break;
        
      case "tamper":
        devices = devices.filter(
          (device) => device.current_tamper === true
        );
        break;
        
      case "low":
        devices = devices.filter(
          (device) => (device.current_status || "").toLowerCase() === "low"
        );
        break;
        
      case "full":
        devices = devices.filter(
          (device) => (device.current_status || "").toLowerCase() === "full"
        );
        break;
        
      case "active":
        devices = devices.filter((device) => {
          const status = (device.current_status || "").toLowerCase();
          const isActiveFlag = device.is_active === true;
          const hasActiveStatus = [
            "normal", "active", "online", "tamper", "empty", "low", "full"
          ].includes(status);
          const hasRecentActivity = 
            device.minutes_since_update !== null && 
            device.minutes_since_update <= 30;
          const isOffline = [
            "offline", "disconnected", "inactive", "power off", "power_off"
          ].includes(status);
          
          return (isActiveFlag || hasActiveStatus || hasRecentActivity) && !isOffline;
        });
        break;
        
      case "offline":
      case "Offline": {
        const isPowerOff = (powerStatus) => {
          if (powerStatus === null || powerStatus === undefined) return true;
          const status = String(powerStatus).trim().toLowerCase();
          return ["off", "no", "none", "", "0", "false"].includes(status);
        };

        devices = devices.filter((device) => {
          const status = (device.current_status || "").toLowerCase();
          const deviceIsPowerOff = isPowerOff(device.power_status);
          const isOfflineStatus = [
            "offline", "disconnected", "inactive", "power off", "power_off"
          ].includes(status);
          const hasNoRecentUpdates = 
            device.minutes_since_update === null || 
            device.minutes_since_update > 30;

          return isOfflineStatus || deviceIsPowerOff || hasNoRecentUpdates;
        });
        break;
      }
        
      case "alerts":
        devices = devices.filter(
          (device) =>
            isTissueAlert(device) &&
            (device.current_status || "").toLowerCase() !== "full"
        );
        break;
        
      case "all":
      default:
        // Show all tissue devices
        devices = devices.filter(
          (device) => isTissueAlert(device) || !isBatteryAlert(device)
        );
        break;
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      devices = devices.filter((device) => {
        const name = (device.name || device.device_name || "").toLowerCase();
        const id = (device.device_id || device.id || "").toString().toLowerCase();
        const room = (device.room || "").toLowerCase();
        const status = (device.current_status || "").toLowerCase();
        
        return (
          name.includes(term) ||
          id.includes(term) ||
          room.includes(term) ||
          status.includes(term)
        );
      });
    }
    
    return devices;
  }, [sortedDevices, searchTerm, alertType]);

  const { title, noData } = ALERT_TYPE_MAP[alertType] || ALERT_TYPE_MAP.all;

  return (
    <div 
      className="flex flex-col h-screen"
      style={{ backgroundColor: themeColors.background }}
    >
      {/* Modern Header with back button and styled title */}
      <div 
        className={`bg-gradient-to-b pt-11 ${
          isDark 
            ? 'from-gray-800 to-gray-900' 
            : 'from-white to-gray-50'
        }`}
        style={{
          backgroundImage: isDark 
            ? `linear-gradient(to bottom, ${themeColors.surface}, ${themeColors.background})`
            : `linear-gradient(to bottom, #ffffff, ${themeColors.background})`
        }}
      >
        <div className="flex items-center justify-between px-4 pb-3">
          <button
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 ${
              isDark 
                ? 'bg-primary/20 border border-primary/30' 
                : 'bg-primary/10'
            }`}
            style={{
              backgroundColor: isDark 
                ? `${themeColors.primary}30` 
                : `${themeColors.primary}15`,
              borderColor: isDark 
                ? `${themeColors.primary}50` 
                : 'transparent'
            }}
          >
            <ArrowLeft 
              size={24} 
              style={{ color: themeColors.primary }}
            />
          </button>
          
          <div className="flex-1 flex items-center justify-center mx-4">
            <h1 
              className="text-2xl font-bold tracking-wide"
              style={{ color: themeColors.heading }}
            >
              {title}
            </h1>
          </div>
          
          {/* Placeholder for right side */}
          <div className="w-10 h-10" />
        </div>
      </div>

      {/* Horizontal line */}
      <div 
        className="h-0.5 w-full mb-1"
        style={{ backgroundColor: themeColors.surface }}
      />

      {/* Search bar */}
      <DeviceHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      
      {/* Scrollable content with single column layout */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {filteredDevices.length === 0 ? (
          <p 
            className="text-center mt-6 opacity-60"
            style={{ color: themeColors.text }}
          >
            {noData}
          </p>
        ) : (
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            {filteredDevices.map((device, idx) => (
              <DeviceCard
                key={device.device_id || device.id || idx}
                device={device}
                index={idx}
                tissueOnly={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}