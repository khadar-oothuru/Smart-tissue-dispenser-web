import React, { useMemo, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import DeviceCard from "../components/AdminDash/DeviceCard";
import { useThemeContext } from "../context/ThemeContext";
import { useDeviceStore } from "../store/useDeviceStore";
import { ScreenWrapper } from "@/components/common/ScreenWrapper";
import DeviceHeader from "../components/User/DeviceHeader";
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
    
    const analyticsMap = new Map(
      analytics.map((a) => [a.device_id || a.id, a])
    );
    const statusMap = new Map(realtimeStatus.map((s) => [s.device_id, s]));
    
    return devices.map((device) => {
      const analyticsData = analyticsMap.get(device.id) || {};
      const status = statusMap.get(device.id) || {};
      return {
        ...device,
        ...analyticsData,
        is_active:
          status.is_active !== undefined
            ? status.is_active
            : analyticsData.is_active !== undefined
            ? analyticsData.is_active
            : false,
        current_status:
          status.current_status || analyticsData.current_status || "unknown",
        minutes_since_update:
          status.minutes_since_update ??
          analyticsData.minutes_since_update ??
          null,
        status_priority:
          status.status_priority ?? analyticsData.status_priority ?? -1,
        device_name:
          device.name || analyticsData.device_name || `Device ${device.id}`,
        name: device.name || analyticsData.device_name || `Device ${device.id}`,
        room: device.room || analyticsData.room || "",
        floor: device.floor || analyticsData.floor || "",
        low_alert_count: analyticsData.low_alert_count || 0,
        tamper_count: analyticsData.tamper_count || 0,
        total_entries: analyticsData.total_entries || 0,
        last_alert_time: analyticsData.last_alert_time,
        current_alert: status.current_alert,
        current_tamper: status.current_tamper || false,
        current_count: status.current_count || 0,
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
    let devices = [];
    
    if (alertType === "empty") {
      devices = sortedDevices.filter(
        (device) => (device.current_status || "").toLowerCase() === "empty"
      );
    } else if (alertType === "tamper") {
      devices = sortedDevices.filter(
        (device) => device.current_tamper === true
      );
    } else if (alertType === "low") {
      devices = sortedDevices.filter(
        (device) => (device.current_status || "").toLowerCase() === "low"
      );
    } else if (alertType === "full") {
      devices = sortedDevices.filter(
        (device) => (device.current_status || "").toLowerCase() === "full"
      );
    } else if (alertType === "active") {
      devices = sortedDevices.filter((device) => {
        const status = (device.current_status || "").toLowerCase();
        const isActiveFlag = device.is_active === true;
        const hasActiveStatus = [
          "normal",
          "active",
          "online",
          "tamper",
          "empty",
          "low",
          "full",
        ].includes(status);
        const hasRecentActivity =
          device.minutes_since_update !== null &&
          device.minutes_since_update <= 30;
        const hasPositivePriority = device.status_priority > 0;
        const isOffline = [
          "offline",
          "disconnected",
          "inactive",
          "power off",
          "power_off",
        ].includes(status);
        return (
          (isActiveFlag ||
            hasActiveStatus ||
            hasRecentActivity ||
            hasPositivePriority) &&
          !isOffline
        );
      });
    } else if (alertType === "offline" || alertType === "Offline") {
      const isPowerOff = (powerStatus) => {
        if (powerStatus === null || powerStatus === undefined) return true;
        const status = String(powerStatus).trim().toLowerCase();
        return ["off", "no", "none", "", "0", "false"].includes(status);
      };

      devices = sortedDevices.filter((device) => {
        const status = (device.current_status || "").toLowerCase();
        const deviceIsPowerOff = isPowerOff(device.power_status);
        const isOfflineStatus = [
          "offline",
          "disconnected",
          "inactive",
          "power off",
          "power_off",
        ].includes(status);
        const hasNoRecentUpdates =
          device.minutes_since_update === null ||
          device.minutes_since_update > 30;

        return isOfflineStatus || deviceIsPowerOff || hasNoRecentUpdates;
      });
    } else if (alertType === "alerts") {
      devices = sortedDevices.filter(
        (device) =>
          isTissueAlert(device) &&
          (device.current_status || "").toLowerCase() !== "full"
      );
    } else if (alertType === "all") {
      devices = sortedDevices.filter(
        (device) => isTissueAlert(device) || !isBatteryAlert(device)
      );
    }
    
    if (!searchTerm.trim()) return devices;
    
    const term = searchTerm.toLowerCase().trim();
    return devices.filter((device) => {
      const name = (device.name || device.device_name || "").toLowerCase();
      const id = (device.device_id || "").toString().toLowerCase();
      const room = (device.room || "").toLowerCase();
      const status = (device.current_status || "").toLowerCase();
      return (
        name.includes(term) ||
        id.includes(term) ||
        room.includes(term) ||
        status.includes(term)
      );
    });
  }, [sortedDevices, searchTerm, alertType]);

  const { title, noData } = ALERT_TYPE_MAP[alertType] || ALERT_TYPE_MAP.all;

  // Styles
  const styles = {
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
      minHeight: '100vh',
    },
    header: {
      background: isDark 
        ? `linear-gradient(to bottom, ${themeColors.surface}, ${themeColors.background})`
        : `linear-gradient(to bottom, #ffffff, ${themeColors.background})`,
      paddingTop: '20px',
    },
    headerContent: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px 12px 16px',
    },
    backButton: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark
        ? `${themeColors.primary}30`
        : `${themeColors.primary}15`,
      border: isDark ? `1px solid ${themeColors.primary}50` : 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    titleContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 16px',
    },
    title: {
      fontSize: '26px',
      fontWeight: '700',
      color: themeColors.heading,
      letterSpacing: '0.5px',
    },
    placeholder: {
      width: '40px',
      height: '40px',
    },
    divider: {
      height: '2px',
      backgroundColor: themeColors.surface,
      width: '100%',
      marginBottom: '4px',
    },
    scrollArea: {
      overflowY: 'auto',
      flex: 1,
      padding: '0 16px',
    },
    noDataText: {
      color: `${themeColors.text}99`,
      textAlign: 'center',
      marginTop: '24px',
    },
  };

  return (
    <ScreenWrapper>
      <div style={styles.container}>
        {/* Header with gradient */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <button
              onClick={() => navigate(-1)}
              style={styles.backButton}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            >
              <IoArrowBack size={24} color={themeColors.primary} />
            </button>
            <div style={styles.titleContainer}>
              <h1 style={styles.title}>{title}</h1>
            </div>
            <div style={styles.placeholder} />
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Search bar */}
        <DeviceHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        
        {/* Device list */}
        <div style={styles.scrollArea}>
          {filteredDevices.length === 0 ? (
            <p style={styles.noDataText}>{noData}</p>
          ) : (
            filteredDevices.map((device, idx) => (
              <DeviceCard
                key={device.device_id || device.id || idx}
                device={device}
                index={idx}
                tissueOnly
              />
            ))
          )}
        </div>
      </div>
    </ScreenWrapper>
  );
}