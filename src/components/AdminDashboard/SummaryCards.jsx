import React, { useMemo } from "react";
import useTheme from "../../hooks/useThemeContext";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  ShieldAlert,
  Battery,
  BatteryLow,
  Power,
  Zap,
  Archive,
  TrendingUp,
  Loader,
  PowerOff,
  BatteryMedium,
  BatteryFull,
  BatteryWarning,
  DropletOff,
  Droplet,
  AlertTriangle as DropletAlert,
} from "lucide-react";

// Import utility functions from LandingPageTop
import {
  getBatteryAndPowerAlertCounts,
  getTissueAlertCounts,
} from "./LandingPageTop";

const SummaryCards = ({
  dashboardData,
  realtimeStatus = [],
  selectedAlertType = "tissue",
  isLoading = false,
  onAlertPress,
}) => {
  // Calculate alert counts using utility functions
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

  // Card definitions based on alert type (2x2 grid layout like mobile)
  let cards = [];

  if (selectedAlertType === "tissue") {
    cards = [
      {
        title: "Need to refill",
        value: alertCounts.emptyCount || dashboardData?.emptyDevices || 0,
        icon: "empty",
        onPress: () => onAlertPress?.("empty"),
        fullWidth: false,
      },
      {
        title: "Low Alerts",
        value: alertCounts.lowCount || dashboardData?.lowDevices || 0,
        icon: "low",
        onPress: () => onAlertPress?.("low"),
        fullWidth: false,
      },
      {
        title: "Tamper Alerts",
        value: alertCounts.tamperCount || dashboardData?.tamperDevices || 0,
        icon: "tamper",
        onPress: () => onAlertPress?.("tamper"),
        fullWidth: false,
      },
      {
        title: "Full Alerts",
        value: alertCounts.fullCount || dashboardData?.fullDevices || 0,
        icon: "full",
        onPress: () => onAlertPress?.("full"),
        fullWidth: false,
      },
    ];
  } else if (selectedAlertType === "battery") {
    cards = [
      {
        title: "Battery Off",
        value:
          alertCounts.batteryOffCount || dashboardData?.batteryOffDevices || 0,
        icon: "battery-off",
        onPress: () => onAlertPress?.("battery-off"),
        fullWidth: false,
      },
      {
        title: "Critical Battery",
        value:
          alertCounts.criticalBatteryCount ||
          dashboardData?.criticalDevices ||
          0,
        icon: "critical",
        onPress: () => onAlertPress?.("critical-battery"),
        fullWidth: false,
      },
      {
        title: "Low Battery",
        value:
          alertCounts.lowBatteryCount || dashboardData?.lowBatteryDevices || 0,
        icon: "battery",
        onPress: () => onAlertPress?.("low-battery"),
        fullWidth: false,
      },
      {
        title: "Good Battery",
        value:
          alertCounts.goodBatteryCount ||
          dashboardData?.goodBatteryDevices ||
          0,
        icon: "good-battery",
        onPress: () => onAlertPress?.("good-battery"),
        fullWidth: false,
      },
    ];
  } else if (selectedAlertType === "power") {
    cards = [
      {
        title: "No Power",
        value: alertCounts.noPowerCount || dashboardData?.noPowerDevices || 0,
        icon: "no-power",
        onPress: () => onAlertPress?.("no-power"),
        fullWidth: false,
      },
      {
        title: "Power Off",
        value: alertCounts.powerOffCount || dashboardData?.powerOffDevices || 0,
        icon: "power-off",
        onPress: () => onAlertPress?.("power-off"),
        fullWidth: false,
      },
      {
        title: "Critical Battery",
        value:
          alertCounts.criticalBatteryCount ||
          dashboardData?.criticalDevices ||
          0,
        icon: "critical",
        onPress: () => onAlertPress?.("critical-battery"),
        fullWidth: false,
      },
      {
        title: "Good Power",
        value: Math.max(
          0,
          (dashboardData?.totalDevices || 0) -
            (alertCounts.noPowerCount || 0) -
            (alertCounts.powerOffCount || 0) -
            (alertCounts.criticalBatteryCount || 0) -
            (alertCounts.lowBatteryCount || 0)
        ),
        icon: "good-power",
        onPress: () => onAlertPress?.("good-power"),
        fullWidth: false,
      },
    ];
  }

  return (
    <div className="px-6 mb-8">
      {/* Two rows of two cards each */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {cards.slice(0, 2).map((card, index) => (
          <SummaryCard key={index} card={card} isLoading={isLoading} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {cards.slice(2, 4).map((card, index) => (
          <SummaryCard key={index + 2} card={card} isLoading={isLoading} />
        ))}
      </div>
    </div>
  );
};

const SummaryCard = ({ card, isLoading }) => {
  const Icon = getCardIcon(card.icon);
  const cardColor = getCardColor(card.icon);
  const bgColor = getBgColor(card.icon);
  const { isDark, themeColors } = useTheme();

  // Gradient backgrounds for light mode (can use themeColors if desired)
  const gradientMap = {
    empty: `linear-gradient(135deg, #ffe5e5 0%, ${themeColors.background} 100%)`,
    low: `linear-gradient(135deg, #fffbe5 0%, ${themeColors.background} 100%)`,
    full: `linear-gradient(135deg, #e5f7ff 0%, ${themeColors.background} 100%)`,
    tamper: `linear-gradient(135deg, #f3e5ff 0%, ${themeColors.background} 100%)`,
    critical: `linear-gradient(135deg, #ffe5e5 0%, ${themeColors.background} 100%)`,
    battery: `linear-gradient(135deg, #fffbe5 0%, ${themeColors.background} 100%)`,
    "good-battery": `linear-gradient(135deg, #e5ffe5 0%, ${themeColors.background} 100%)`,
    "no-power": `linear-gradient(135deg, #ffe5e5 0%, ${themeColors.background} 100%)`,
    "power-off": `linear-gradient(135deg, #fffbe5 0%, ${themeColors.background} 100%)`,
    "good-power": `linear-gradient(135deg, #e5ffe5 0%, ${themeColors.background} 100%)`,
    total: `linear-gradient(135deg, #ffe5e5 0%, ${themeColors.background} 100%)`,
    "battery-off": `linear-gradient(135deg, #f0f0f0 0%, ${themeColors.background} 100%)`,
  };

  // Use gradient in light mode, fallback to dark bg in dark mode
  const cardBgStyle = !isDark
    ? {
        background:
          gradientMap[card.icon] ||
          `linear-gradient(135deg, ${themeColors.background} 0%, #fff 100%)`,
        border: `1px solid ${themeColors.border}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
        transition: "background 0.3s, box-shadow 0.3s",
      }
    : {};

  return (
    <div
      className={`${bgColor} rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 transform group relative overflow-hidden`}
      onClick={card.onPress}
      style={cardBgStyle}
    >
      {/* Background gradient effect for hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-xl ${cardColor} bg-white dark:bg-gray-800 shadow-md`}
          >
            <Icon size={24} className="text-current" />
          </div>
          {/* Trend indicator */}
          <div className="opacity-60 group-hover:opacity-100 transition-opacity">
            <TrendingUp size={16} className={cardColor} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-800 dark:text-white">
            {isLoading ? (
              <Loader className="animate-spin" />
            ) : (
              formatNumber(card.value)
            )}
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {card.title}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getCardIcon = (type) => {
  const iconMap = {
    empty: DropletOff,
    low: DropletAlert,
    full: Droplet,
    tamper: ShieldAlert,
    critical: BatteryWarning,
    battery: BatteryMedium,
    "good-battery": BatteryFull,
    "no-power": Power,
    "power-off": PowerOff,
    "good-power": Zap,
    total: AlertCircle,
    "battery-off": PowerOff,
  };
  return iconMap[type] || AlertCircle;
};

const getCardColor = (type) => {
  const colorMap = {
    empty: "text-red-500",
    low: "text-yellow-500",
    full: "text-blue-500",
    tamper: "text-purple-500",
    critical: "text-red-600",
    battery: "text-yellow-500",
    "good-battery": "text-green-500",
    "no-power": "text-red-600",
    "power-off": "text-yellow-500",
    "good-power": "text-green-500",
    total: "text-red-500",
    "battery-off": "text-gray-500",
  };
  return colorMap[type] || "text-gray-500";
};

const getBgColor = (type) => {
  const bgMap = {
    empty: "bg-red-50 dark:bg-red-900/20",
    low: "bg-yellow-50 dark:bg-yellow-900/20",
    full: "bg-blue-50 dark:bg-blue-900/20",
    tamper: "bg-purple-50 dark:bg-purple-900/20",
    critical: "bg-red-50 dark:bg-red-900/20",
    battery: "bg-yellow-50 dark:bg-yellow-900/20",
    "good-battery": "bg-green-50 dark:bg-green-900/20",
    "no-power": "bg-red-50 dark:bg-red-900/20",
    "power-off": "bg-yellow-50 dark:bg-yellow-900/20",
    "good-power": "bg-green-50 dark:bg-green-900/20",
    total: "bg-red-50 dark:bg-red-900/20",
    "battery-off": "bg-gray-50 dark:bg-gray-800/40",
  };
  return bgMap[type] || "bg-gray-50 dark:bg-gray-900/20";
};

// Helper function to format large numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

export default SummaryCards;
