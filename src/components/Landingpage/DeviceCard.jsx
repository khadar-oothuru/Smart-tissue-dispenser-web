import React, { useEffect, useRef, useState } from "react";
import { 
  Wifi, 
  MapPin, 
  Clock, 
  ChevronRight, 
  AlertTriangle,
  Activity,
  Signal,
  CheckCircle,
  XCircle,
  Zap,
  AlertCircle
} from "lucide-react";

// Mock theme context (replace with your actual theme context)
const useThemeContext = () => {
  const [isDark, setIsDark] = useState(false);
  
  const themeColors = {
    surface: isDark ? "#1a1a1a" : "#ffffff",
    heading: isDark ? "#ffffff" : "#000000",
    text: isDark ? "#e0e0e0" : "#333333",
    border: isDark ? "#333333" : "#e0e0e0",
    primary: "#007AFF",
    background: isDark ? "#0a0a0a" : "#f5f5f5",
    inputbg: isDark ? "#2a2a2a" : "#f8f9fa",
  };
  
  return { themeColors, isDark, setIsDark };
};

// Mock router (replace with your actual router)
const useRouter = () => {
  return {
    push: ({ pathname, params }) => {
      console.log("Navigation:", pathname, params);
      alert(`Navigating to ${pathname} with device ID: ${params.deviceId}`);
    }
  };
};

// Device status configuration utility
const getDeviceStatusConfig = (status, isActive, isDark) => {
  const normalizedStatus = (status || "").toLowerCase();
  
  const configs = {
    tamper: {
      color: "#FF3B30",
      text: "Tamper",
      icon: "alert-triangle",
      bgLight: "#FDF2F2",
      bgDark: "#FF3B3020",
      gradient: ["#FF3B30", "#FF6B6B"]
    },
    empty: {
      color: "#FF9500",
      text: "Empty",
      icon: "alert-circle",
      bgLight: "#FFF4E6",
      bgDark: "#FF950020",
      gradient: ["#FF9500", "#FFB84D"]
    },
    low: {
      color: "#FFCC00",
      text: "Low",
      icon: "alert-triangle",
      bgLight: "#FFFBF0",
      bgDark: "#FFCC0020",
      gradient: ["#FFCC00", "#FFD700"]
    },
    full: {
      color: "#34C759",
      text: "Full",
      icon: "check-circle",
      bgLight: "#E8F5E8",
      bgDark: "#34C75920",
      gradient: ["#34C759", "#5ED760"]
    },
    offline: {
      color: "#8E8E93",
      text: "Offline",
      icon: "x-circle",
      bgLight: "#F2F2F7",
      bgDark: "#8E8E9320",
      gradient: ["#8E8E93", "#AEAEB2"]
    },
    active: {
      color: "#007AFF",
      text: "Active",
      icon: "check-circle",
      bgLight: "#E8F4FD",
      bgDark: "#007AFF20",
      gradient: ["#007AFF", "#5AC8FA"]
    },
    unknown: {
      color: "#8E8E93",
      text: "Unknown",
      icon: "alert-circle",
      bgLight: "#F2F2F7",
      bgDark: "#8E8E9320",
      gradient: ["#8E8E93", "#AEAEB2"]
    }
  };

  // Status mapping logic
  if (normalizedStatus === "tamper") return configs.tamper;
  if (normalizedStatus === "empty") return configs.empty;
  if (normalizedStatus === "low") return configs.low;
  if (normalizedStatus === "full") return configs.full;
  if (["offline", "disconnected", "inactive"].includes(normalizedStatus)) return configs.offline;
  if (["normal", "active", "online"].includes(normalizedStatus)) return configs.active;
  
  return configs.unknown;
};

// Icon component mapping
const getStatusIcon = (iconName, size = 16, color = "#000") => {
  const iconMap = {
    "alert-triangle": AlertTriangle,
    "alert-circle": AlertCircle,
    "check-circle": CheckCircle,
    "x-circle": XCircle,
  };
  
  const IconComponent = iconMap[iconName] || AlertCircle;
  return <IconComponent size={size} color={color} />;
};

const DeviceCard = ({ device, index = 0, tissueOnly = false }) => {
  const { themeColors, isDark } = useThemeContext();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 50);

    return () => clearTimeout(timer);
  }, [index]);

  // Navigation handler
  const handleCardPress = () => {
    router.push({
      pathname: "/device-details",
      params: {
        deviceId: device.device_id || device.id,
        deviceName:
          device.device_name ||
          device.name ||
          `Device ${device.device_id || device.id}`,
        deviceStatus: device.current_status || "unknown",
        isActive: device.is_active?.toString() || "false",
        room: device.room_number || device.room || "Unknown",
        floor:
          device.floor_number !== undefined
            ? device.floor_number.toString()
            : device.floor || "N/A",
      },
    });
  };

  // Get status configuration
  let statusConfig;
  if (tissueOnly) {
    const status = (device.current_status || "").toLowerCase();
    if (device.current_tamper === true) {
      statusConfig = getDeviceStatusConfig("tamper", device.is_active, isDark);
    } else if (status === "empty") {
      statusConfig = getDeviceStatusConfig("empty", device.is_active, isDark);
    } else if (status === "low") {
      statusConfig = getDeviceStatusConfig("low", device.is_active, isDark);
    } else if (status === "full") {
      statusConfig = getDeviceStatusConfig("full", device.is_active, isDark);
    } else if (["offline", "disconnected", "inactive"].includes(status)) {
      statusConfig = getDeviceStatusConfig("offline", device.is_active, isDark);
    } else if (["normal", "active", "online"].includes(status)) {
      statusConfig = getDeviceStatusConfig("active", device.is_active, isDark);
    } else {
      statusConfig = getDeviceStatusConfig("unknown", device.is_active, isDark);
    }
  } else {
    statusConfig = getDeviceStatusConfig(
      device.current_status,
      device.is_active,
      isDark
    );
  }

  // Navigation function for admin device details
  const handleViewDetails = () => {
    try {
      router.push({
        pathname: "/device-details",
        params: {
          deviceId: device.device_id,
          deviceName:
            device.device_name || device.name || `Device ${device.device_id}`,
          deviceStatus: device.current_status || "unknown",
          isActive: String(device.is_active),
          room: device.room_number || device.room || "Unknown",
          floor:
            device.floor_number !== undefined
              ? device.floor_number.toString()
              : device.floor || "N/A",
        },
      });
    } catch (error) {
      // Fallback: show alert with device info
      alert(
        `Admin Device Details\n\nDevice: ${
          device.device_name || device.name || `Device ${device.device_id}`
        }\nStatus: ${device.current_status || "Unknown"}\nRoom: ${
          device.room_number || device.room || "Unknown"
        }\nFloor: ${
          device.floor_number !== undefined
            ? device.floor_number
            : device.floor || "N/A"
        }`
      );
    }
  };

  const lastAlertTime = device.last_alert_time
    ? new Date(device.last_alert_time).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Show real-time activity indicator
  const showActivityIndicator =
    device.is_active &&
    device.minutes_since_update !== null &&
    device.minutes_since_update <= 5;

  return (
    <div
      ref={cardRef}
      className={`
        mx-4 mb-4 transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
        ${isHovered ? 'scale-105' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          rounded-3xl overflow-hidden cursor-pointer transition-all duration-300
          ${isDark ? 'shadow-xl shadow-black/30' : 'shadow-lg shadow-black/8'}
          border border-opacity-30 border-l-4
          ${isHovered ? 'shadow-2xl' : ''}
        `}
        style={{
          backgroundColor: themeColors.surface,
          borderColor: statusConfig.color + "30",
          borderLeftColor: statusConfig.color,
        }}
        onClick={handleCardPress}
      >
        {/* Status Gradient Bar */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(to right, ${statusConfig.gradient[0]}, ${statusConfig.gradient[1]})`
          }}
        />

        {/* Header Section */}
        <div className="flex justify-between items-center p-4 pb-3">
          <div className="flex items-center flex-1">
            {/* Icon Container */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mr-3 relative"
              style={{
                backgroundColor: isDark
                  ? statusConfig.bgDark
                  : statusConfig.bgLight,
              }}
            >
              <Wifi size={24} color={statusConfig.color} />
            </div>

            {/* Device Info */}
            <div className="flex-1">
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: themeColors.heading }}
              >
                {device.device_name ||
                  device.name ||
                  `Device ${device.device_id}`}
              </h3>
              <div className="flex items-center">
                <MapPin size={12} color={themeColors.text} />
                <span
                  className="text-sm ml-1"
                  style={{ color: themeColors.text }}
                >
                  Room {device.room_number || device.room || "Unknown"} •
                  Floor {device.floor_number !== undefined
                    ? device.floor_number
                    : device.floor || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className="flex items-center px-3 py-1.5 rounded-full gap-1"
            style={{
              backgroundColor: isDark
                ? statusConfig.bgDark
                : statusConfig.bgLight,
            }}
          >
            {getStatusIcon(statusConfig.icon, 16, statusConfig.color)}
            <span
              className="text-sm font-semibold"
              style={{ color: statusConfig.color }}
            >
              {statusConfig.text}
            </span>
          </div>
        </div>

        {/* Enhanced Real-time Activity Indicator */}
        {showActivityIndicator && (
          <div
            className="flex items-center mx-4 mb-2 px-3 py-2 rounded-xl gap-2"
            style={{
              backgroundColor: isDark
                ? statusConfig.color + "25"
                : statusConfig.color + "15",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: statusConfig.color }}
            />
            <span
              className="text-xs font-semibold flex-1"
              style={{
                color: isDark ? "#FFFFFF" : statusConfig.color,
              }}
            >
              {device.current_status === "tamper"
                ? "Tamper Alert • "
                : device.current_status === "empty"
                ? "Empty Alert • "
                : device.current_status === "low"
                ? "Low Level Alert • "
                : device.current_status === "full"
                ? "Full Level • "
                : "Live • "}
              Updated {device.minutes_since_update || 0}m ago
            </span>
            <div className="flex items-center justify-center">
              {["tamper", "empty"].includes(device.current_status) ? (
                <AlertTriangle size={12} color={isDark ? "#FFFFFF" : statusConfig.color} />
              ) : (
                <Signal size={12} color={isDark ? "#FFFFFF" : statusConfig.color} />
              )}
            </div>
          </div>
        )}

        {/* Enhanced Last Activity Section */}
        {lastAlertTime && (
          <div
            className="flex items-center mx-4 mb-4 p-3 rounded-xl border"
            style={{
              backgroundColor: isDark
                ? statusConfig.color + "20"
                : statusConfig.color + "12",
              borderColor: isDark
                ? statusConfig.color + "30"
                : statusConfig.color + "20",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 border"
              style={{
                backgroundColor: isDark
                  ? statusConfig.color + "25"
                  : statusConfig.color + "15",
                borderColor: isDark
                  ? statusConfig.color + "35"
                  : statusConfig.color + "25",
              }}
            >
              <Clock size={16} color={isDark ? "#B0B0B0" : themeColors.text} />
            </div>
            <div className="flex-1">
              <p
                className="text-xs uppercase tracking-wide mb-0.5"
                style={{ color: isDark ? "#888888" : themeColors.text }}
              >
                Last Update
              </p>
              <p
                className="text-sm font-medium"
                style={{ color: isDark ? "#FFFFFF" : themeColors.heading }}
              >
                {lastAlertTime}
              </p>
            </div>
            <button
              className="flex items-center gap-1 hover:scale-105 transition-transform duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: isDark ? "#FFFFFF" : statusConfig.color }}
              >
                View Details
              </span>
              <ChevronRight size={16} color={isDark ? "#FFFFFF" : statusConfig.color} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Demo component to showcase the DeviceCard
const DeviceCardDemo = () => {
  const { isDark, setIsDark } = useThemeContext();
  
  // Sample device data
  const sampleDevices = [
    {
      device_id: "DEV001",
      device_name: "Tissue Dispenser A1",
      current_status: "active",
      is_active: true,
      room_number: "101",
      floor_number: 1,
      last_alert_time: "2024-01-15T10:30:00Z",
      minutes_since_update: 2,
      current_tamper: false,
    },
    {
      device_id: "DEV002",
      device_name: "Tissue Dispenser B2",
      current_status: "low",
      is_active: true,
      room_number: "205",
      floor_number: 2,
      last_alert_time: "2024-01-15T09:15:00Z",
      minutes_since_update: 3,
      current_tamper: false,
    },
    {
      device_id: "DEV003",
      device_name: "Tissue Dispenser C3",
      current_status: "empty",
      is_active: true,
      room_number: "312",
      floor_number: 3,
      last_alert_time: "2024-01-15T08:45:00Z",
      minutes_since_update: 1,
      current_tamper: false,
    },
    {
      device_id: "DEV004",
      device_name: "Tissue Dispenser D4",
      current_status: "tamper",
      is_active: true,
      room_number: "404",
      floor_number: 4,
      last_alert_time: "2024-01-15T11:00:00Z",
      minutes_since_update: 4,
      current_tamper: true,
    },
    {
      device_id: "DEV005",
      device_name: "Tissue Dispenser E5",
      current_status: "offline",
      is_active: false,
      room_number: "501",
      floor_number: 5,
      last_alert_time: "2024-01-14T16:20:00Z",
      minutes_since_update: 120,
      current_tamper: false,
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8 text-center">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Device Card Component
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            React.js + Tailwind CSS version with real-time status indicators
          </p>
        </div>

        {/* Theme Toggle */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              isDark 
                ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        {/* Device Cards */}
        <div className="space-y-0">
          {sampleDevices.map((device, index) => (
            <DeviceCard
              key={device.device_id}
              device={device}
              index={index}
              tissueOnly={false}
            />
          ))}
        </div>

        {/* Features List */}
        <div className={`mt-12 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🎯 Real-time Status
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Live activity indicators and status badges
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ✨ Smooth Animations
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Staggered entrance animations and hover effects
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🎨 Theme Support
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Dark/light mode with dynamic color schemes
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                📱 Responsive Design
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Works perfectly on all screen sizes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceCardDemo;