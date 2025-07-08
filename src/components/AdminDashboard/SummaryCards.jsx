import React from "react";
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
} from "lucide-react";

const SummaryCards = ({
  dashboardData,
  selectedAlertType = "tissue",
  onAlertPress,
}) => {
  // Card definitions based on alert type (2x2 grid layout like mobile)
  let cards = [];

  if (selectedAlertType === "tissue") {
    cards = [
      {
        title: "Need to refill",
        value: dashboardData.emptyDevices || 0,
        icon: "empty",
        onPress: () => onAlertPress?.("empty"),
        fullWidth: false,
      },
      {
        title: "Low Alerts",
        value: dashboardData.lowDevices || 0,
        icon: "low",
        onPress: () => onAlertPress?.("low"),
        fullWidth: false,
      },
      {
        title: "Tamper Alerts",
        value: dashboardData.tamperDevices || 0,
        icon: "tamper",
        onPress: () => onAlertPress?.("tamper"),
        fullWidth: false,
      },
      {
        title: "Total Alerts",
        value: dashboardData.totalTissueAlerts || 0,
        icon: "total",
        onPress: () => onAlertPress?.("alerts"),
        fullWidth: false,
      },
    ];
  } else if (selectedAlertType === "battery") {
    cards = [
      {
        title: "Battery Off",
        value: dashboardData.powerOffDevices || 0,
        icon: "battery-off",
        onPress: () => onAlertPress?.("battery_off"),
        fullWidth: false,
      },
      {
        title: "Need charge",
        value: dashboardData.criticalDevices || 0,
        icon: "critical",
        onPress: () => onAlertPress?.("critical"),
        fullWidth: false,
      },
      {
        title: "Low Battery",
        value: dashboardData.lowBatteryDevices || 0,
        icon: "battery",
        onPress: () => onAlertPress?.("battery"),
        fullWidth: false,
      },
      {
        title: "Total Alerts",
        value: dashboardData.powerTotalAlertsCount || 0,
        icon: "total",
        onPress: () => onAlertPress?.("all_battery"),
        fullWidth: false,
      },
    ];
  }

  return (
    <div className="px-6 mb-8">
      {/* Two rows of two cards each */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {cards.slice(0, 2).map((card, index) => (
          <SummaryCard key={index} card={card} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {cards.slice(2, 4).map((card, index) => (
          <SummaryCard key={index + 2} card={card} />
        ))}
      </div>
    </div>
  );
};

const SummaryCard = ({ card }) => {
  const Icon = getCardIcon(card.icon);
  const cardColor = getCardColor(card.icon);
  const bgColor = getBgColor(card.icon);

  return (
    <div
      className={`${bgColor} rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 transform group relative overflow-hidden`}
      onClick={card.onPress}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
            {formatNumber(card.value)}
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
    empty: Archive,
    low: AlertTriangle,
    full: CheckCircle,
    tamper: ShieldAlert,
    critical: BatteryLow,
    battery: Battery,
    power: Power,
    total: AlertCircle,
    "battery-off": Power,
  };
  return iconMap[type] || AlertCircle;
};

const getCardColor = (type) => {
  const colorMap = {
    empty: "text-red-500",
    low: "text-yellow-500",
    full: "text-green-500",
    tamper: "text-purple-500",
    critical: "text-red-600",
    battery: "text-yellow-500",
    power: "text-gray-500",
    total: "text-red-500",
    "battery-off": "text-purple-500",
  };
  return colorMap[type] || "text-gray-500";
};

const getBgColor = (type) => {
  const bgMap = {
    empty: "bg-red-50 dark:bg-red-900/20",
    low: "bg-yellow-50 dark:bg-yellow-900/20",
    full: "bg-green-50 dark:bg-green-900/20",
    tamper: "bg-purple-50 dark:bg-purple-900/20",
    critical: "bg-red-50 dark:bg-red-900/20",
    battery: "bg-yellow-50 dark:bg-yellow-900/20",
    power: "bg-gray-50 dark:bg-gray-900/20",
    total: "bg-red-50 dark:bg-red-900/20",
    "battery-off": "bg-purple-50 dark:bg-purple-900/20",
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
