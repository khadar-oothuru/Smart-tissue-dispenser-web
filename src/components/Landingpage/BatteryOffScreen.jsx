import React, { useMemo, useState } from "react";
import { IoArrowBack, IoBatteryChargingOutline } from "react-icons/io5";
import BatteryDeviceCard from "../components/AdminDash/BatteryDeviceCard";
import { useThemeContext } from "../context/ThemeContext";
import { useDeviceStore } from "../store/useDeviceStore";
import { ScreenWrapper } from "@/components/common/ScreenWrapper";
import DeviceHeader from "../components/User/DeviceHeader";
import { useNavigate } from "react-router-dom";
import { getDeviceStatusConfig } from "../utils/deviceStatusConfig";

export default function BatteryOffScreen() {
  const { themeColors, isDark } = useThemeContext();
  const navigate = useNavigate();
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
        battery_percentage:
          status.battery_percentage ?? analyticsData.battery_percentage,
        battery_off_count: analyticsData.battery_off_count || 0,
        battery_low_count: analyticsData.battery_low_count || 0,
        battery_critical_count: analyticsData.battery_critical_count || 0,
        battery_alert_count: analyticsData.battery_alert_count || 0,
        power_status: status.power_status || analyticsData.power_status,
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

  // Filter devices with battery percentage = 0
  const batteryOffDevices = useMemo(() => {
    return mergedDevices.filter((device) => {
      const batteryOff = device.battery_off === 1;
      const batteryPercentage =
        typeof device.battery_percentage === "number"
          ? device.battery_percentage
          : null;
      const currentStatus = device.current_status
        ? String(device.current_status).toLowerCase()
        : "";

      const isBatteryOff = batteryOff || batteryPercentage === 0;

      return (
        isBatteryOff ||
        currentStatus === "battery_off" ||
        device.battery_off_count > 0
      );
    });
  }, [mergedDevices]);

  // Sort devices by battery priority
  const sortedDevices = useMemo(() => {
    const getBatteryPriority = (device) => {
      const batteryPercentage = device.battery_percentage;
      const currentStatus = device.current_status
        ? String(device.current_status).toLowerCase()
        : "";

      if (batteryPercentage === 0 || currentStatus === "battery_off")
        return 100;
      if (device.battery_off_count > 0) return 80;
      return 0;
    };

    return [...batteryOffDevices].sort((a, b) => {
      const priorityDiff = getBatteryPriority(b) - getBatteryPriority(a);
      if (priorityDiff !== 0) return priorityDiff;

      const aTime = new Date(a.last_alert_time || 0).getTime();
      const bTime = new Date(b.last_alert_time || 0).getTime();
      return bTime - aTime;
    });
  }, [batteryOffDevices]);

  // Filter by search term
  const filteredDevices = useMemo(() => {
    if (!searchTerm.trim()) return sortedDevices;

    const term = searchTerm.toLowerCase();
    return sortedDevices.filter((device) => {
      const searchableText = [
        device.device_name,
        device.name,
        device.room,
        device.floor,
        `room ${device.room}`,
        `floor ${device.floor}`,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(term);
    });
  }, [sortedDevices, searchTerm]);

  const handleDevicePress = (device) => {
    navigate(`/device-detail/${device.id}`);
  };

  const renderDeviceCard = (device) => {
    const batteryPercentage = device.battery_percentage ?? 0;
    const statusConfig = getDeviceStatusConfig(device);

    return (
      <BatteryDeviceCard
        key={device.id}
        device={device}
        onPress={() => handleDevicePress(device)}
        statusConfig={statusConfig}
        batteryStatus={{
          percentage: batteryPercentage,
          status: batteryPercentage === 0 ? "Battery Off" : "Low Battery",
          isCharging: false,
          timeRemaining: batteryPercentage === 0 ? "No Power" : "Critical",
        }}
        showBatteryDetails={true}
      />
    );
  };

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
      flex: 1,
      padding: '0 16px',
      overflowY: 'auto',
    },
    emptyContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px 0',
    },
    emptyIcon: {
      marginBottom: '16px',
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: themeColors.text,
      textAlign: 'center',
      marginBottom: '8px',
    },
    emptyText: {
      fontSize: '14px',
      color: themeColors.textSecondary,
      textAlign: 'center',
      lineHeight: '20px',
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
              <h1 style={styles.title}>Battery Off Devices</h1>
            </div>
            <div style={styles.placeholder} />
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Search bar */}
        <DeviceHeader searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <div style={styles.scrollArea}>
          {filteredDevices.length === 0 ? (
            <div style={styles.emptyContainer}>
              <div style={styles.emptyIcon}>
                <IoBatteryChargingOutline
                  size={64}
                  color={themeColors.success}
                />
              </div>
              <h2 style={styles.emptyTitle}>
                All Batteries Charged! 🔋
              </h2>
              <p style={styles.emptyText}>
                {searchTerm.trim()
                  ? `No battery off devices found for "${searchTerm}"`
                  : "No devices currently have depleted batteries"}
              </p>
            </div>
          ) : (
            <>
              {/* Device List */}
              {filteredDevices.map(renderDeviceCard)}
            </>
          )}
        </div>
      </div>
    </ScreenWrapper>
  );
}