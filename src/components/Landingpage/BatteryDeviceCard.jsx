import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiClock, FiChevronRight, FiPower, FiWifi } from "react-icons/fi";
import { MdBattery0Bar, MdBattery20, MdBattery30, MdBattery50, MdBattery60, MdBattery80, MdBatteryFull, MdBatteryAlert, MdPowerOff } from "react-icons/md";
import { useThemeContext } from "../../context/ThemeContext";
import {
  getDeviceStatusConfig,
  getBatteryAlertConfig,
} from "../../utils/deviceStatusConfig";
import "./BatteryDeviceCard.css";

const getBatteryIcon = (percentage, status) => {
  if (status.includes("power_off")) return MdPowerOff;
  if (status.includes("battery_off") || percentage === 0) return MdBattery0Bar;
  if (status.includes("battery_critical") || percentage <= 10) return MdBatteryAlert;
  if (percentage <= 20) return MdBattery20;
  if (percentage <= 30) return MdBattery30;
  if (percentage <= 50) return MdBattery50;
  if (percentage <= 60) return MdBattery60;
  if (percentage <= 80) return MdBattery80;
  return MdBatteryFull;
};

export default function BatteryDeviceCard({ device, index = 0 }) {
  const { themeColors, isDark } = useThemeContext();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [isAnimated, setIsAnimated] = useState(false);

  // Navigation handler
  const handleCardPress = () => {
    navigate("/device-details", {
      state: {
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

  // Animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, index * 50);

    return () => clearTimeout(timer);
  }, [index]);

  // Get battery-specific device status
  const batteryStatusList = [];
  
  if (
    device.power_off_count > 0 ||
    device.power_status === null ||
    device.power_status === undefined ||
    ["off", "no", "none", "", "0", "false"].includes(
      String(device.power_status).trim().toLowerCase()
    )
  ) {
    batteryStatusList.push("power_off");
  }
  
  if (
    device.battery_percentage !== null &&
    device.battery_percentage !== undefined
  ) {
    if (device.battery_percentage === 0) {
      batteryStatusList.push("battery_off");
    } else if (
      device.battery_percentage > 0 &&
      device.battery_percentage <= 10
    ) {
      batteryStatusList.push("battery_critical");
    } else if (
      device.battery_percentage > 10 &&
      device.battery_percentage <= 20
    ) {
      batteryStatusList.push("battery_low");
    }
  } else if (
    device.battery_critical === 1 ||
    device.battery_critical_count > 0
  ) {
    batteryStatusList.push("battery_critical");
  } else if (device.battery_low === 1 || device.battery_low_count > 0) {
    batteryStatusList.push("battery_low");
  }
  
  if (!device.is_active) {
    batteryStatusList.push("inactive");
  }
  
  if (batteryStatusList.length === 0 && device.is_active === true) {
    batteryStatusList.push("normal");
  }
  
  if (batteryStatusList.length === 0) {
    batteryStatusList.push("unknown");
  }
  
  const batteryConfig = getDeviceStatusConfig(
    batteryStatusList,
    device.is_active,
    isDark
  );

  const handleViewDetails = () => {
    try {
      navigate("/device-details", {
        state: {
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
    } catch (_error) {
      alert(
        `Battery Device Details\n\nDevice: ${
          device.device_name || device.name || `Device ${device.device_id}`
        }\nBattery: ${device.battery_percentage || "N/A"}%\nStatus: ${
          device.current_status || "Unknown"
        }\nRoom: ${device.room_number || device.room || "Unknown"}\nFloor: ${
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

  const showActivityIndicator =
    device.is_active &&
    device.minutes_since_update !== null &&
    device.minutes_since_update <= 5;

  const BatteryIcon = getBatteryIcon(device.battery_percentage, batteryStatusList);

  return (
    <div
      ref={cardRef}
      className={`battery-device-card-container ${isAnimated ? 'animated' : ''} ${isDark ? 'dark' : 'light'}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className="battery-device-card"
        onClick={handleCardPress}
        style={{
          borderColor: `${batteryConfig.color}30`,
          borderLeftColor: batteryConfig.color,
          backgroundColor: isDark ? themeColors.surface : "#FFFFFF",
        }}
      >
        {/* Status Gradient Bar */}
        <div
          className="status-gradient-bar"
          style={{
            background: `linear-gradient(90deg, ${batteryConfig.gradient[0]}, ${batteryConfig.gradient[1]})`,
          }}
        />

        {/* Header Section */}
        <div className="header">
          <div className="header-left">
            <div
              className="icon-container"
              style={{
                backgroundColor: isDark
                  ? batteryConfig.bgDark
                  : batteryConfig.bgLight,
              }}
            >
              <BatteryIcon
                size={24}
                color={batteryConfig.color}
              />
            </div>

            <div className="device-info">
              <h3 className="device-id" style={{ color: themeColors.heading }}>
                {device.device_name ||
                  device.name ||
                  `Device ${device.device_id}`}
              </h3>
              <div className="location-row">
                <FiMapPin size={12} color={themeColors.text} />
                <span className="device-location" style={{ color: themeColors.text }}>
                  Room {device.room_number || device.room || "Unknown"} •
                  Floor{" "}
                  {device.floor_number !== undefined
                    ? device.floor_number
                    : device.floor || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Battery Status Badge */}
          <div
            className="status-badge"
            style={{
              backgroundColor: isDark
                ? batteryConfig.bgDark
                : batteryConfig.bgLight,
            }}
          >
            <BatteryIcon
              size={16}
              color={batteryConfig.color}
            />
            <span className="status-text" style={{ color: batteryConfig.color }}>
              {batteryConfig.text}
            </span>
          </div>
        </div>

        {/* Battery Level Display */}
        <div
          className="battery-container"
          style={{
            backgroundColor: isDark
              ? `${batteryConfig.color}26`
              : `${batteryConfig.color}14`,
            borderColor: isDark
              ? `${batteryConfig.color}40`
              : `${batteryConfig.color}33`,
          }}
        >
          <div className="battery-info">
            <BatteryIcon
              size={20}
              color={batteryConfig.color}
            />
            <span
              className="battery-level"
              style={{ color: batteryConfig.color }}
            >
              {device.battery_percentage !== null
                ? `${device.battery_percentage}%`
                : "N/A"}
            </span>
          </div>
          {device.battery_percentage !== null && (
            <div 
              className="battery-progress"
              style={{
                backgroundColor: isDark ? themeColors.surface : "#E5E7EB",
              }}
            >
              <div
                className="battery-fill"
                style={{
                  width: `${Math.min(100, device.battery_percentage)}%`,
                  backgroundColor: batteryConfig.color,
                }}
              />
            </div>
          )}
        </div>

        {/* Enhanced Real-time Activity Indicator */}
        {showActivityIndicator && (
          <div
            className="activity-indicator"
            style={{
              backgroundColor: isDark
                ? `${batteryConfig.color}40`
                : `${batteryConfig.color}26`,
            }}
          >
            <div
              className="activity-dot"
              style={{
                backgroundColor: batteryConfig.color,
              }}
            />
            <span
              className="activity-text"
              style={{
                color: isDark ? "#FFFFFF" : batteryConfig.color,
              }}
            >
              {batteryConfig.text === "Power Off"
                ? "Power Off • "
                : batteryConfig.text === "Critical Battery"
                ? "Critical Battery • "
                : batteryConfig.text === "Low Battery"
                ? "Low Battery • "
                : "Live • "}
              Updated {device.minutes_since_update || 0}m ago
            </span>
            <div className="signal-strength">
              {batteryConfig.text === "Power Off" ? (
                <FiPower size={12} color={isDark ? "#FFFFFF" : batteryConfig.color} />
              ) : (
                <FiWifi size={12} color={isDark ? "#FFFFFF" : batteryConfig.color} />
              )}
            </div>
          </div>
        )}

        {/* Battery Alert Counts */}
        {(device.battery_low_count > 0 || device.power_off_count > 0) && (
          <div
            className="alert-container"
            style={{
              backgroundColor: isDark
                ? `${batteryConfig.color}33`
                : `${batteryConfig.color}1F`,
              borderColor: isDark
                ? `${batteryConfig.color}4D`
                : `${batteryConfig.color}33`,
            }}
          >
            <div className="alert-stats">
              {device.battery_low_count > 0 &&
                (() => {
                  const alertCfg = getBatteryAlertConfig("low", isDark);
                  return (
                    <div className="alert-item">
                      <MdBatteryAlert
                        size={14}
                        color={alertCfg.color}
                      />
                      <span className="alert-text" style={{ color: themeColors.text }}>
                        {device.battery_low_count} {alertCfg.label}
                      </span>
                    </div>
                  );
                })()}
              {device.power_off_count > 0 &&
                (() => {
                  const alertCfg = getBatteryAlertConfig("power_off", isDark);
                  return (
                    <div className="alert-item">
                      <MdPowerOff
                        size={14}
                        color={alertCfg.color}
                      />
                      <span className="alert-text" style={{ color: themeColors.text }}>
                        {device.power_off_count} {alertCfg.label}
                      </span>
                    </div>
                  );
                })()}
            </div>
          </div>
        )}

        {/* Enhanced Last Activity Section */}
        {lastAlertTime && (
          <div
            className="last-alert-container"
            style={{
              backgroundColor: isDark
                ? `${batteryConfig.color}33`
                : `${batteryConfig.color}1F`,
              borderColor: isDark
                ? `${batteryConfig.color}4D`
                : `${batteryConfig.color}33`,
            }}
          >
            <div
              className="alert-icon"
              style={{
                backgroundColor: isDark
                  ? `${batteryConfig.color}40`
                  : `${batteryConfig.color}26`,
                borderColor: isDark
                                    ? `${batteryConfig.color}59`
                  : `${batteryConfig.color}40`,
              }}
            >
              <FiClock
                size={16}
                color={isDark ? "#B0B0B0" : themeColors.text}
              />
            </div>
            <div className="alert-info">
              <span
                className="last-alert-label"
                style={{ color: isDark ? "#888888" : themeColors.text }}
              >
                Last update
              </span>
              <span
                className="last-alert-time"
                style={{ color: isDark ? "#FFFFFF" : themeColors.heading }}
              >
                {lastAlertTime}
              </span>
            </div>
            <button
              className="view-analytics-button"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
            >
              <span
                className="view-analytics-text"
                style={{ color: isDark ? "#FFFFFF" : batteryConfig.color }}
              >
                View Details
              </span>
              <FiChevronRight
                size={16}
                color={isDark ? "#FFFFFF" : batteryConfig.color}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}