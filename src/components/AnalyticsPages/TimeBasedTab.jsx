import React, { useState, useEffect } from "react";
import { HiOutlineDownload, HiChevronDown, HiChevronUp } from "react-icons/hi";
import { IoWater, IoBatteryChargingOutline } from "react-icons/io5";
import EmptyState from "../common/EmptyState";
import AnalyticsFilters from "./AnalyticsFilters";
import DeviceTimeChart from "./DeviceTimeChart";
import DownloadButtons from "./DownloadButtons";
import { useDeviceStore } from "../../store/useDeviceStore";
import { useTheme } from "../../hooks/useThemeContext";

const TimeBasedTab = ({
  timeBasedData,
  devices,
  selectedPeriod,
  selectedDevice,
  onPeriodChange,
  onDeviceChange,
  onDownload,
  downloading,
  cancelled,
}) => {
  const { analyticsLoading } = useDeviceStore();
  const { themeColors, isDark } = useTheme();
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [alertType, setAlertType] = useState("tissue");

  useEffect(() => {
    // Data updated: tracking timeBasedData changes
  }, [
    timeBasedData,
    analyticsLoading,
    selectedPeriod,
    selectedDevice,
    alertType,
  ]);

  const handleToggleExport = () => {
    setShowExportOptions(!showExportOptions);
  };

  // Custom glassmorphic toggle switch component
  const ToggleSwitch = ({ checked, onChange }) => {
    return (
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-9 w-20 items-center rounded-full shadow-lg border border-white/30
          transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
          backdrop-blur-md
        `}
        style={{
          background: checked
            ? `linear-gradient(90deg, ${themeColors.primary}33 0%, ${themeColors.primary}99 100%)`
            : `linear-gradient(90deg, #f3f4f680 0%, #e5e7eb80 100%)`,
          borderColor: checked ? `${themeColors.primary}55` : "#e5e7eb33",
        }}
      >
        <span
          className={`
            inline-block h-7 w-7 transform rounded-full shadow-md bg-white/90 border border-white/60
            transition-transform duration-300
            ${checked ? "translate-x-11" : "translate-x-1"}
          `}
          style={{
            boxShadow: checked
              ? `0 2px 8px ${themeColors.primary}33`
              : "0 2px 8px #e5e7eb33",
          }}
        />
      </button>
    );
  };

  return (
    <div>
      <AnalyticsFilters
        selectedPeriod={selectedPeriod}
        selectedDevice={selectedDevice}
        devices={devices}
        onPeriodChange={onPeriodChange}
        onDeviceChange={onDeviceChange}
      />

      {/* Modern Glass-Style Toggle */}
      <div className="px-4 mb-4">
        <div
          className={`relative rounded-2xl overflow-hidden shadow-xl border border-white/20 backdrop-blur-md`}
          style={{
            background: isDark
              ? "linear-gradient(135deg, #23272f 0%, #181a20 100%)"
              : `linear-gradient(135deg, #fff8 0%, #f3f4f6cc 100%)`,
            borderColor: isDark ? "#23272f" : "#e5e7eb33",
          }}
        >
          <div className="relative flex items-center justify-between px-5 py-5">
            {/* Tissue Alerts Option */}
            <div className="flex items-center justify-center flex-1">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center mr-3 transition-all duration-200 shadow-md border border-white/30 backdrop-blur-sm`}
                style={{
                  background:
                    alertType === "tissue"
                      ? `linear-gradient(135deg, ${themeColors.primary}22 0%, #fff4 100%)`
                      : "transparent",
                  borderColor:
                    alertType === "tissue"
                      ? `${themeColors.primary}55`
                      : "#e5e7eb33",
                }}
              >
                <IoWater
                  size={26}
                  color={
                    alertType === "tissue"
                      ? themeColors.primary
                      : `${themeColors.text}66`
                  }
                />
              </div>
              <span
                className={`text-base tracking-tight text-center ${
                  alertType === "tissue" ? "font-extrabold" : "font-semibold"
                }`}
                style={{
                  color:
                    alertType === "tissue"
                      ? themeColors.primary
                      : `${themeColors.text}99`,
                }}
              >
                Tissue Alerts
              </span>
            </div>

            {/* Toggle Switch */}
            <div className="px-5 flex items-center justify-center">
              <ToggleSwitch
                checked={alertType === "battery"}
                onChange={(val) => setAlertType(val ? "battery" : "tissue")}
              />
            </div>

            {/* Battery Alerts Option */}
            <div className="flex items-center justify-center flex-1">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center mr-3 transition-all duration-200 shadow-md border border-white/30 backdrop-blur-sm`}
                style={{
                  background:
                    alertType === "battery"
                      ? `linear-gradient(135deg, ${themeColors.primary}22 0%, #fff4 100%)`
                      : "transparent",
                  borderColor:
                    alertType === "battery"
                      ? `${themeColors.primary}55`
                      : "#e5e7eb33",
                }}
              >
                <IoBatteryChargingOutline
                  size={24}
                  color={
                    alertType === "battery"
                      ? themeColors.primary
                      : `${themeColors.text}66`
                  }
                />
              </div>
              <span
                className={`text-base tracking-tight text-center ${
                  alertType === "battery" ? "font-extrabold" : "font-semibold"
                }`}
                style={{
                  color:
                    alertType === "battery"
                      ? themeColors.primary
                      : `${themeColors.text}99`,
                }}
              >
                Battery Alerts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Glass-Style Export Button */}
      <div className="px-4 mb-3">
        <button
          className={`relative w-full rounded-2xl overflow-hidden shadow-xl border border-white/20 backdrop-blur-md transition-all duration-300 hover:shadow-2xl`}
          style={{
            background: isDark
              ? "linear-gradient(135deg, #23272f 0%, #181a20 100%)"
              : `linear-gradient(135deg, ${themeColors.primary}11 0%, #fff8 100%)`,
            borderColor: isDark ? "#23272f" : `${themeColors.primary}33`,
          }}
          onClick={handleToggleExport}
        >
          <div className="relative flex items-center justify-center px-5 py-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mr-4 shadow-md border border-white/30 backdrop-blur-sm"
              style={{ background: `${themeColors.primary}18` }}
            >
              <HiOutlineDownload size={28} color={themeColors.primary} />
            </div>
            <div className="flex-1 text-center">
              <h3
                className="text-lg font-extrabold tracking-tight mb-0.5"
                style={{ color: themeColors.heading }}
              >
                {showExportOptions ? "Hide Export Options" : "Export Data"}
              </h3>
              <p
                className="text-xs font-medium opacity-80"
                style={{ color: `${themeColors.text}99` }}
              >
                Download analytics in various formats
              </p>
            </div>
            {showExportOptions ? (
              <HiChevronUp size={22} color={themeColors.primary} />
            ) : (
              <HiChevronDown size={22} color={themeColors.primary} />
            )}
          </div>
        </button>
      </div>

      {/* Show Download Buttons only when export is toggled */}
      {showExportOptions && (
        <DownloadButtons
          onDownload={onDownload}
          isLoading={analyticsLoading}
          downloading={downloading}
          cancelled={cancelled}
        />
      )}

      {/* Chart Data Section */}
      {analyticsLoading ? (
        <div className="flex items-center justify-center py-10 px-5 min-h-[200px]">
          <p
            className="text-base font-medium opacity-70"
            style={{ color: themeColors.text }}
          >
            Loading analytics data...
          </p>
        </div>
      ) : timeBasedData && timeBasedData.data?.length > 0 ? (
        <div className="mb-4">
          {timeBasedData.data.map((deviceData, index) => (
            <DeviceTimeChart
              key={`${deviceData.device_id}_${index}_${selectedPeriod}_${alertType}`}
              deviceData={deviceData}
              alertType={alertType}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="chart-line"
          message="No data available for the selected period"
          description={`Try selecting a different time period${
            selectedDevice !== "all" ? " or device" : ""
          }`}
        />
      )}
    </div>
  );
};

export default TimeBasedTab;
