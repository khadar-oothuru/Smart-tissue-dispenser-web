// Utility functions for device status calculations and alert handling
// Web version of the mobile app's utility functions

export const getTissueAlertCounts = (realtimeStatus = []) => {
  let emptyCount = 0;
  let lowCount = 0;
  let tamperCount = 0;
  let totalTissueAlerts = 0;

  if (!Array.isArray(realtimeStatus)) {
    return { emptyCount, lowCount, tamperCount, totalTissueAlerts };
  }

  realtimeStatus.forEach((device) => {
    const status = device.current_status?.toLowerCase() || "";
    const level = parseFloat(device.current_level) || 0;
    const tamperCount_device = device.tamper_count || 0;

    // Empty status
    if (status === "empty" || level <= 10) {
      emptyCount++;
    }
    // Low status
    else if (status === "low" || (level > 10 && level <= 25)) {
      lowCount++;
    }

    // Tamper alerts
    if (tamperCount_device > 0) {
      tamperCount++;
    }

    // Total tissue alerts (empty + low)
    if (status === "empty" || status === "low" || level <= 25) {
      totalTissueAlerts++;
    }
  });

  return {
    emptyCount,
    lowCount,
    tamperCount,
    totalTissueAlerts,
  };
};

export const getBatteryAndPowerAlertCounts = (realtimeStatus = []) => {
  let lowBatteryCount = 0;
  let criticalBatteryCount = 0;
  let batteryOffCount = 0;
  let powerTotalAlertsCount = 0;

  if (!Array.isArray(realtimeStatus)) {
    return {
      lowBatteryCount,
      criticalBatteryCount,
      batteryOffCount,
      powerTotalAlertsCount,
    };
  }

  realtimeStatus.forEach((device) => {
    const battery = device.battery_percentage || 0;
    const powerStatus = device.power_status?.toLowerCase() || "";
    const powerOffCount = device.power_off_count || 0;

    // Power off status (takes priority)
    if (
      powerOffCount > 0 ||
      powerStatus === "off" ||
      powerStatus === "false" ||
      powerStatus === "no" ||
      powerStatus === "0" ||
      powerStatus === "" ||
      powerStatus === null ||
      powerStatus === undefined
    ) {
      batteryOffCount++;
    }
    // Battery percentage checks (only if power is on)
    else if (battery <= 15) {
      criticalBatteryCount++;
    } else if (battery <= 30) {
      lowBatteryCount++;
    }

    // Total power alerts (all battery and power issues)
    if (powerOffCount > 0 || powerStatus === "off" || battery <= 30) {
      powerTotalAlertsCount++;
    }
  });

  return {
    lowBatteryCount,
    criticalBatteryCount,
    batteryOffCount,
    powerTotalAlertsCount,
  };
};

export const getDeviceStatusConfig = (device, tissueOnly = false) => {
  const status = device.current_status?.toLowerCase() || "";
  const level = parseFloat(device.current_level) || 0;
  const battery = device.battery_percentage || 0;
  const powerStatus = device.power_status?.toLowerCase() || "";
  const powerOffCount = device.power_off_count || 0;
  const tamperCount = device.tamper_count || 0;
  const isActive = device.is_active || false;

  // Priority order: Power Off > Tamper > Empty > Low > Critical Battery > Low Battery > Full

  // Power off always takes priority
  if (
    powerOffCount > 0 ||
    powerStatus === "off" ||
    powerStatus === "false" ||
    powerStatus === "no" ||
    powerStatus === "0" ||
    powerStatus === "" ||
    !isActive
  ) {
    return {
      status: "Power Off",
      color: "#757575",
      bgColor: "#75757520",
      icon: "power-off",
      priority: 1,
    };
  }

  // Tamper alerts
  if (tamperCount > 0) {
    return {
      status: "Tamper Alert",
      color: "#8B5CF6",
      bgColor: "#8B5CF620",
      icon: "shield-alert",
      priority: 2,
    };
  }

  // Tissue status (if not tissue-only mode, check battery first)
  if (!tissueOnly && battery <= 15) {
    return {
      status: "Critical Battery",
      color: "#FF3B30",
      bgColor: "#FF3B3020",
      icon: "battery-low",
      priority: 3,
    };
  }

  // Empty tissue
  if (status === "empty" || level <= 10) {
    return {
      status: "Empty",
      color: "#FF4757",
      bgColor: "#FF475720",
      icon: "alert-circle",
      priority: 4,
    };
  }

  // Low tissue
  if (status === "low" || (level > 10 && level <= 25)) {
    return {
      status: "Low",
      color: "#FF9F00",
      bgColor: "#FF9F0020",
      icon: "alert-triangle",
      priority: 5,
    };
  }

  // Low battery (only if not tissue-only mode)
  if (!tissueOnly && battery <= 30) {
    return {
      status: "Low Battery",
      color: "#FF9F00",
      bgColor: "#FF9F0020",
      icon: "battery-low",
      priority: 6,
    };
  }

  // Full/Normal status
  return {
    status: "Full",
    color: "#10B981",
    bgColor: "#10B98120",
    icon: "check-circle",
    priority: 7,
  };
};

export const getBatteryStatusConfig = (device) => {
  const battery = device.battery_percentage || 0;
  const powerStatus = device.power_status?.toLowerCase() || "";
  const powerOffCount = device.power_off_count || 0;
  const isActive = device.is_active || false;

  // Power off takes priority
  if (
    powerOffCount > 0 ||
    powerStatus === "off" ||
    powerStatus === "false" ||
    powerStatus === "no" ||
    powerStatus === "0" ||
    powerStatus === "" ||
    !isActive
  ) {
    return {
      status: "Power Off",
      color: "#757575",
      bgColor: "#75757520",
      icon: "power-off",
      priority: 1,
    };
  }

  // Battery percentage checks
  if (battery <= 15) {
    return {
      status: "Critical Battery",
      color: "#FF3B30",
      bgColor: "#FF3B3020",
      icon: "battery-low",
      priority: 2,
    };
  }

  if (battery <= 30) {
    return {
      status: "Low Battery",
      color: "#FF9F00",
      bgColor: "#FF9F0020",
      icon: "battery-low",
      priority: 3,
    };
  }

  if (battery <= 60) {
    return {
      status: "Medium Battery",
      color: "#FFD600",
      bgColor: "#FFD60020",
      icon: "battery-half",
      priority: 4,
    };
  }

  return {
    status: "Good Battery",
    color: "#10B981",
    bgColor: "#10B98120",
    icon: "battery-full",
    priority: 5,
  };
};

export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Never";

  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
};

export const calculateDeviceHealth = (devices = [], realtimeStatus = []) => {
  if (!devices.length) return "No Data";

  const totalDevices = devices.length;
  const activeDevices = devices.filter((d) => d.is_active).length;
  const offlineDevices = totalDevices - activeDevices;

  const { emptyCount, lowCount, tamperCount } =
    getTissueAlertCounts(realtimeStatus);
  const { criticalBatteryCount, batteryOffCount } =
    getBatteryAndPowerAlertCounts(realtimeStatus);

  const criticalIssues =
    emptyCount + tamperCount + criticalBatteryCount + batteryOffCount;
  const warningIssues = lowCount;

  const healthScore = Math.max(
    0,
    100 - criticalIssues * 15 - warningIssues * 5 - offlineDevices * 10
  );

  if (healthScore >= 90) return "Excellent";
  if (healthScore >= 80) return "Good";
  if (healthScore >= 70) return "Fair";
  if (healthScore >= 60) return "Poor";
  return "Critical";
};

export const getLastAlertTime = (device) => {
  if (device.last_alert_time) {
    return formatTimeAgo(device.last_alert_time);
  }

  if (device.last_updated) {
    return formatTimeAgo(device.last_updated);
  }

  if (device.created_at) {
    return formatTimeAgo(device.created_at);
  }

  return "No recent activity";
};

export const sortDevicesByPriority = (devices = []) => {
  return devices.sort((a, b) => {
    const statusA = getDeviceStatusConfig(a);
    const statusB = getDeviceStatusConfig(b);

    // Sort by priority (lower number = higher priority)
    if (statusA.priority !== statusB.priority) {
      return statusA.priority - statusB.priority;
    }

    // If same priority, sort by activity status
    if (a.is_active !== b.is_active) {
      return b.is_active - a.is_active;
    }

    // If same activity, sort by device name
    return (a.name || a.device_name || "").localeCompare(
      b.name || b.device_name || ""
    );
  });
};
