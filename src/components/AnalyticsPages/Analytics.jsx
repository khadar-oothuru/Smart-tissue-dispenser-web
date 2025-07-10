// Analytics.jsx
import React, { useCallback, useEffect, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Share2,
  Save,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useThemeContext";
import { useDeviceStore } from "../../store/useDeviceStore";
import { subDays, startOfDay, endOfDay } from "date-fns";
import AnalyticsHeader from "./AnalyticsHeader";
import TimeBasedTab from "./TimeBasedTab";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { CustomAlert, DownloadOptionsAlert } from "../common/CustomAlert";

const showToast = (message) => {
  // You can use a toast library like react-toastify or sonner
  console.log(message);
};

export default function Analytics() {
  const { accessToken, loading: authLoading } = useAuth();
  const { themeColors, isDark } = useTheme();
  const {
    timeBasedData,
    devices,
    analyticsLoading,
    analyticsError,
    fetchDevices,
    fetchTimeBasedAnalytics,
    downloadAnalytics,
    clearAnalyticsError,
  } = useDeviceStore();

  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [selectedDevice, setSelectedDevice] = useState("all");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadCancelled, setDownloadCancelled] = useState(false);
  const [dataUpdateCounter, setDataUpdateCounter] = useState(0);

  // Date range state
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: startOfDay(subDays(new Date(), 7)),
    endDate: endOfDay(new Date()),
    label: "Last 7 Days",
  });

  // Custom Alert States
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    type: "info",
    title: "",
    message: "",
    primaryAction: null,
    secondaryAction: null,
  });

  const [downloadAlert, setDownloadAlert] = useState({
    visible: false,
    format: "",
    onShare: null,
    onDownload: null,
  });

  // Enhanced period change handler
  const handlePeriodChange = useCallback((newPeriod) => {
    setSelectedPeriod(newPeriod);
    setDataUpdateCounter((prev) => prev + 1);
    showToast(`Period changed to ${newPeriod}`);
  }, []);

  // Enhanced device change handler
  const handleDeviceChange = useCallback(
    (newDevice) => {
      setSelectedDevice(newDevice);
      setDataUpdateCounter((prev) => prev + 1);
      const deviceName =
        newDevice === "all"
          ? "All Devices"
          : devices.find((d) => d.id === newDevice)?.name ||
            `Device ${newDevice}`;
      showToast(`Device changed to ${deviceName}`);
    },
    [devices]
  );

  // Alert functions
  const showCustomAlert = useCallback(
    (type, title, message, primaryAction = null, secondaryAction = null) => {
      setTimeout(() => {
        setCustomAlert({
          visible: true,
          type,
          title,
          message,
          primaryAction,
          secondaryAction,
        });
      }, 50);
    },
    []
  );

  const closeCustomAlert = useCallback(() => {
    if (downloading) {
      setDownloadCancelled(true);
      setDownloading(false);
      showToast("Download cancelled");
    }
    setCustomAlert((prev) => ({ ...prev, visible: false }));
  }, [downloading]);

  const showSuccessAlert = useCallback(
    (title, message, onSuccess = null) => {
      const primaryAction = onSuccess
        ? { text: "OK", onPress: onSuccess }
        : null;
      showCustomAlert("success", title, message, primaryAction);
    },
    [showCustomAlert]
  );

  const showErrorAlert = useCallback(
    (title, message, onRetry = null) => {
      const primaryAction = onRetry
        ? { text: "Retry", onPress: onRetry }
        : null;
      const secondaryAction = onRetry
        ? { text: "Cancel", onPress: () => {} }
        : null;
      showCustomAlert("error", title, message, primaryAction, secondaryAction);
    },
    [showCustomAlert]
  );

  const showWarningAlert = useCallback(
    (title, message, buttons = []) => {
      const primaryAction =
        buttons.length > 0 && buttons[0]
          ? {
              text: buttons[0].text || "Got it!",
              onPress: buttons[0].onPress || (() => {}),
            }
          : null;
      showCustomAlert("warning", title, message, primaryAction);
    },
    [showCustomAlert]
  );

  const showDownloadOptionsAlert = useCallback(
    (format, onShare, onDownload) => {
      setTimeout(() => {
        setDownloadAlert({
          visible: true,
          format,
          onShare: () => {
            setDownloadAlert((prev) => ({ ...prev, visible: false }));
            onShare();
          },
          onDownload: () => {
            setDownloadAlert((prev) => ({ ...prev, visible: false }));
            onDownload();
          },
        });
      }, 50);
    },
    []
  );

  const closeDownloadAlert = useCallback(() => {
    if (downloading) {
      setDownloadCancelled(true);
      setDownloading(false);
      showToast("Download cancelled");
    }
    setDownloadAlert((prev) => ({ ...prev, visible: false }));
  }, [downloading]);

  // Handle date range change
  const handleDateRangeChange = useCallback((dateRange) => {
    setSelectedDateRange(dateRange);
    setDataUpdateCounter((prev) => prev + 1);
    showToast(`Date range updated: ${dateRange.label}`);
  }, []);

  // Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    setDataUpdateCounter((prev) => prev + 1);
    showToast("Refreshing analytics data...");
    await loadTimeBasedData();
  }, []);

  // Data loading functions
  const loadAllData = useCallback(async () => {
    if (!accessToken) return;
    try {
      await fetchDevices(accessToken);
      if (isFirstLoad) {
        setIsFirstLoad(false);
        showToast("Analytics data loaded successfully");
      }
    } catch (_error) {
      showErrorAlert(
        "Data Loading Failed",
        "Unable to fetch analytics data. Please check your connection and try again.",
        () => loadAllData()
      );
    }
  }, [accessToken, isFirstLoad, fetchDevices, showErrorAlert]);

  const loadTimeBasedData = useCallback(async () => {
    if (!accessToken) return;

    try {
      const deviceId = selectedDevice === "all" ? null : selectedDevice;
      let startDate = null;
      let endDate = null;

      if (selectedDateRange?.startDate && selectedDateRange?.endDate) {
        startDate =
          selectedDateRange.startDate instanceof Date
            ? selectedDateRange.startDate.toISOString()
            : typeof selectedDateRange.startDate === "string"
            ? selectedDateRange.startDate
            : null;
        endDate =
          selectedDateRange.endDate instanceof Date
            ? selectedDateRange.endDate.toISOString()
            : typeof selectedDateRange.endDate === "string"
            ? selectedDateRange.endDate
            : null;
      }

      // Debug: log parameters
      console.log("[Analytics] fetchTimeBasedAnalytics params:", {
        accessToken,
        selectedPeriod,
        deviceId,
        startDate,
        endDate,
      });

      await fetchTimeBasedAnalytics(
        accessToken,
        selectedPeriod,
        deviceId,
        startDate,
        endDate
      );
    } catch (error) {
      // Debug: log error
      console.error("[Analytics] fetchTimeBasedAnalytics error:", error);
      showErrorAlert(
        "Time-based Data Error",
        "Failed to load time-based analytics. The data might be temporarily unavailable.",
        () => loadTimeBasedData()
      );
    }
  }, [
    accessToken,
    selectedPeriod,
    selectedDevice,
    selectedDateRange,
    fetchTimeBasedAnalytics,
    showErrorAlert,
  ]);

  // Effects
  useEffect(() => {
    if (!authLoading && accessToken && isFirstLoad) {
      loadAllData();
    }
  }, [authLoading, accessToken, isFirstLoad, loadAllData]);

  useEffect(() => {
    if (
      !authLoading &&
      accessToken &&
      (!isFirstLoad || (isFirstLoad && devices.length > 0))
    ) {
      loadTimeBasedData();
    }
  }, [
    selectedPeriod,
    selectedDevice,
    selectedDateRange,
    authLoading,
    accessToken,
    isFirstLoad,
    devices.length,
    loadTimeBasedData,
  ]);

  // Download handler
  const handleDownload = async (format) => {
    if (downloading) {
      showWarningAlert(
        "Download in Progress",
        "Please wait for the current download to complete before starting a new one."
      );
      return false;
    }

    setDownloadCancelled(false);

    return new Promise((resolve) => {
      showDownloadOptionsAlert(
        format,
        () => {
          processDownload(format, "share")
            .then(resolve)
            .catch(() => resolve(false));
        },
        () => {
          processDownload(format, "download")
            .then(resolve)
            .catch(() => resolve(false));
        }
      );
    });
  };

  const processDownload = async (format, action) => {
    if (downloading) return false;

    try {
      setDownloading(true);
      setDownloadCancelled(false);

      showToast(`Preparing ${format.toUpperCase()} file...`);

      const deviceId = selectedDevice === "all" ? null : selectedDevice;
      let startDate = null;
      let endDate = null;

      if (
        selectedDateRange?.label !== "Last 7 Days" &&
        selectedDateRange?.startDate &&
        selectedDateRange?.endDate
      ) {
        startDate =
          selectedDateRange.startDate instanceof Date
            ? selectedDateRange.startDate.toISOString()
            : typeof selectedDateRange.startDate === "string"
            ? selectedDateRange.startDate
            : null;
        endDate =
          selectedDateRange.endDate instanceof Date
            ? selectedDateRange.endDate.toISOString()
            : typeof selectedDateRange.endDate === "string"
            ? selectedDateRange.endDate
            : null;
      }

      const result = await downloadAnalytics(
        accessToken,
        selectedPeriod,
        format,
        deviceId,
        startDate,
        endDate
      );

      if (downloadCancelled) {
        return false;
      }

      if (!result?.data) {
        throw new Error(
          "No analytics data available for the selected period and device"
        );
      }

      // Handle download for web
      let blob;
      let mimeType;

      if (format === "csv") {
        blob = new Blob([result.data], { type: "text/csv" });
        mimeType = "text/csv";
      } else if (format === "json") {
        blob = new Blob([result.data], { type: "application/json" });
        mimeType = "application/json";
      } else if (format === "pdf") {
        // For PDF, decode base64 if needed
        const binaryString = atob(result.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: "application/pdf" });
        mimeType = "application/pdf";
      }

      const url = URL.createObjectURL(blob);
      const fileName = `analytics_${selectedPeriod}_${
        new Date().toISOString().split("T")[0]
      }.${format}`;

      if (action === "download") {
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        showSuccessAlert(
          "Download Complete",
          `Your analytics data has been downloaded as a ${format.toUpperCase()} file.`
        );
      } else if (action === "share") {
        // For web, sharing can be done via Web Share API if available
        if (navigator.share) {
          const file = new File([blob], fileName, { type: mimeType });
          await navigator.share({
            files: [file],
            title: "Analytics Report",
          });
          showSuccessAlert(
            "Share Complete",
            "Your analytics file has been shared successfully."
          );
        } else {
          // Fallback to download
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          link.click();
          URL.revokeObjectURL(url);
          showSuccessAlert(
            "Download Complete",
            "Sharing is not available on this device. The file has been downloaded instead."
          );
        }
      }

      return true;
    } catch (error) {
      let errorMessage =
        "An unexpected error occurred while processing your request.";
      if (error.message.includes("No analytics data")) {
        errorMessage =
          "No analytics data available for the selected filters. Try adjusting your selection.";
      } else if (error.message.includes("network")) {
        errorMessage =
          "Network error occurred. Please check your connection and try again.";
      }
      showErrorAlert("Operation Failed", errorMessage, () =>
        handleDownload(format)
      );
      return false;
    } finally {
      setDownloading(false);
      setTimeout(() => {
        setDownloadCancelled(false);
      }, 500);
    }
  };

  if (authLoading || (analyticsLoading && isFirstLoad)) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ backgroundColor: themeColors.background }}
      >
        <div className="text-center">
          <LoadingSpinner size="w-12 h-12" color={themeColors.primary} />
          <p
            className="mt-4 text-lg font-medium"
            style={{ color: themeColors.text }}
          >
            Loading Analytics
          </p>
          <p className="mt-2 text-sm" style={{ color: themeColors.mutedText }}>
            Fetching your latest updates...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <div
          className="h-full overflow-y-auto pt-5"
          style={{ backgroundColor: themeColors.background }}
        >
          <div className="pb-20 md:pb-16">
            <AnalyticsHeader
              onDateRangeChange={handleDateRangeChange}
              selectedDateRange={selectedDateRange}
              onRefresh={handleManualRefresh}
              isLoading={analyticsLoading}
            />

            <div className="relative z-0">
              <TimeBasedTab
                key={`${selectedPeriod}_${selectedDevice}_${selectedDateRange?.label}_${dataUpdateCounter}`}
                timeBasedData={timeBasedData || {}}
                devices={devices || []}
                selectedPeriod={selectedPeriod}
                selectedDevice={selectedDevice}
                onPeriodChange={handlePeriodChange}
                onDeviceChange={handleDeviceChange}
                onDownload={handleDownload}
                downloading={downloading}
                cancelled={downloadCancelled}
                isLoading={analyticsLoading}
              />
            </div>

            {analyticsError && (
              <ErrorMessage
                error={analyticsError}
                onDismiss={clearAnalyticsError}
              />
            )}
          </div>
        </div>
      </div>

      {/* Custom Alert Components */}
      {customAlert.visible && (
        <div className="fixed inset-0 z-[9999]">
          <CustomAlert
            visible={customAlert.visible}
            onClose={closeCustomAlert}
            title={customAlert.title}
            message={customAlert.message}
            type={customAlert.type}
            primaryAction={customAlert.primaryAction}
            secondaryAction={customAlert.secondaryAction}
            themeColors={themeColors}
            isDark={isDark}
          />
        </div>
      )}

      {downloadAlert.visible && (
        <div className="fixed inset-0 z-[9999]">
          <DownloadOptionsAlert
            visible={downloadAlert.visible}
            onClose={closeDownloadAlert}
            format={downloadAlert.format}
            onShare={downloadAlert.onShare}
            onDownload={downloadAlert.onDownload}
            themeColors={themeColors}
            isDark={isDark}
          />
        </div>
      )}
    </div>
  );
}
