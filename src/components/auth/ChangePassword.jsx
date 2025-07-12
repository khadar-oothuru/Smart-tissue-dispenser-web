import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, Check, X, Shield, Lock } from "lucide-react";
import OTPModal from "../Profile/OtpModal";
import { CustomAlert } from "../../components/common/CustomAlert";
import { useTheme } from "../../hooks/useThemeContext";
import { useAuth } from "../../hooks/useAuth";
import {
  changePasswordWithOTP,
  sendPasswordChangeOTP,
  verifyPasswordChangeOTP,
} from "../../services/api";

import resetimg from "../../assets/images/Reset password-amico.png";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { themeColors, isDark } = useTheme();
  const auth = useAuth();
  const { user } = auth;
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const [customAlert, setCustomAlert] = useState({
    visible: false,
    type: "error",
    title: "",
    message: "",
    primaryAction: null,
    secondaryAction: null,
  });

  useEffect(() => {
    let interval;
    if (timer > 0 && showOtpModal) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, showOtpModal]);

  // CustomAlert Functions
  const showCustomAlert = (title, message, type = "error", action = null) => {
    setCustomAlert({
      visible: true,
      type,
      title,
      message,
      primaryAction: action
        ? {
            text: "OK",
            onPress: () => {
              setCustomAlert((prev) => ({ ...prev, visible: false }));
              action();
            },
          }
        : {
            text: "OK",
            onPress: () =>
              setCustomAlert((prev) => ({ ...prev, visible: false })),
          },
      secondaryAction: null,
    });
  };

  const validatePasswords = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showCustomAlert("Error", "Please fill all fields");
      return false;
    }
    if (newPassword.length < 8) {
      showCustomAlert("Error", "New password must be at least 8 characters");
      return false;
    }
    if (newPassword !== confirmPassword) {
      showCustomAlert("Error", "New passwords do not match");
      return false;
    }
    if (oldPassword === newPassword) {
      showCustomAlert(
        "Error",
        "New password must be different from old password"
      );
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      await sendPasswordChangeOTP(token);
      setShowOtpModal(true);
      setTimer(600); // 10 minutes
    } catch (error) {
      showCustomAlert("Error", error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      await sendPasswordChangeOTP(token);
      showCustomAlert("Success", "New OTP sent to your email", "success");
      setTimer(600);
    } catch (error) {
      showCustomAlert("Error", error.message || "Failed to resend OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (enteredOtp) => {
    setOtpLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("User not authenticated");

      await verifyPasswordChangeOTP(token, enteredOtp);
      await changePasswordWithOTP(token, oldPassword, newPassword, enteredOtp);

      showCustomAlert(
        "Success",
        "Password changed successfully",
        "success",
        () => {
          setShowOtpModal(false);
          navigate(-1);
        }
      );
    } catch (error) {
      showCustomAlert(
        "Error",
        error.message || "Failed to verify OTP or change password"
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const requirementsMet = {
    length: newPassword.length >= 8,
    different: newPassword !== oldPassword && newPassword.length > 0,
    match: newPassword === confirmPassword && newPassword.length > 0,
  };

  return (
    <div className="min-h-screen" style={{ background: themeColors.bg }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 shadow-lg"
        style={{ background: themeColors.headerBg || themeColors.cardBg }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-3 rounded-xl transition-all duration-200"
              style={{
                background: themeColors.primaryBg,
                ":hover": {
                  background:
                    themeColors.primaryBgHover || themeColors.primaryBg,
                },
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  themeColors.primaryBgHover || themeColors.primaryBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = themeColors.primaryBg;
              }}
            >
              <ArrowLeft
                className="w-6 h-6"
                style={{ color: themeColors.primary }}
              />
            </button>
            <h1
              className="text-2xl font-bold tracking-wide"
              style={{ color: themeColors.text }}
            >
              Change Password
            </h1>
            <div className="w-12" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-[950px] mx-auto">
          <div
            className="rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden border"
            style={{
              background: isDark
                ? "rgba(30, 30, 30, 0.65)"
                : "rgba(255, 255, 255, 0.65)",
              minHeight: "600px",
              width: "100%",
              maxWidth: "950px",
              backdropFilter: "blur(16px) saturate(180%)",
              WebkitBackdropFilter: "blur(16px) saturate(180%)",
              borderColor: themeColors.border || themeColors.cardBorder,
              borderWidth: "1.5px",
              boxShadow: isDark
                ? "0 8px 32px 0 rgba(0,0,0,0.37)"
                : "0 8px 32px 0 rgba(31, 38, 135, 0.10)",
            }}
          >
            {/* Image Section */}
            <div className="relative w-full lg:w-[44%] min-h-[400px] lg:min-h-[600px] flex-shrink-0">
              <img
                src={resetimg}
                alt="Security"
                className="w-full h-full object-cover"
                style={{
                  minHeight: "400px",
                  height: "100%",
                  maxHeight: "600px",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div>
                  <div className="flex items-center gap-3 mb-4"></div>
                </div>
              </div>
              {/* Decorative elements */}
              <div
                className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20 blur-xl"
                style={{ background: themeColors.primary }}
              ></div>
              <div
                className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full opacity-20 blur-xl"
                style={{
                  background: themeColors.secondary || themeColors.primary,
                }}
              ></div>
            </div>

            {/* Form Section */}
            <div
              className="flex-1 flex flex-col justify-center items-center p-6 lg:p-10"
              style={{ minHeight: "400px", maxHeight: "600px", width: "100%" }}
            >
              <div className="flex items-center gap-3 mb-8 w-full max-w-md">
                <div
                  className="p-3 rounded-xl"
                  style={{ background: themeColors.primaryBg }}
                >
                  <Lock
                    className="w-6 h-6"
                    style={{ color: themeColors.primary }}
                  />
                </div>
                <div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: themeColors.text }}
                  >
                    Update Password
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: themeColors.textSecondary }}
                  >
                    Keep your account secure
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="space-y-6 w-full max-w-md"
              >
                {/* Current Password */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-3"
                    style={{ color: themeColors.text }}
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      disabled={loading}
                      className="w-full px-5 py-2 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4"
                      style={{
                        background: themeColors.inputBg,
                        borderColor: themeColors.cardBorder,
                        color: themeColors.text,
                        "::placeholder": { color: themeColors.textSecondary },
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = themeColors.primary;
                        e.currentTarget.style.boxShadow = `0 0 0 4px ${themeColors.primaryBg}40`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          themeColors.cardBorder;
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors"
                      style={{ color: themeColors.textSecondary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = themeColors.text;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = themeColors.textSecondary;
                      }}
                    >
                      {showOldPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-3"
                    style={{ color: themeColors.text }}
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      disabled={loading}
                      className="w-full px-5 py-2 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4"
                      style={{
                        background: themeColors.inputBg,
                        borderColor: themeColors.cardBorder,
                        color: themeColors.text,
                        "::placeholder": { color: themeColors.textSecondary },
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = themeColors.primary;
                        e.currentTarget.style.boxShadow = `0 0 0 4px ${themeColors.primaryBg}40`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          themeColors.cardBorder;
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors"
                      style={{ color: themeColors.textSecondary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = themeColors.text;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = themeColors.textSecondary;
                      }}
                    >
                      {showNewPassword ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-3"
                    style={{ color: themeColors.text }}
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={loading}
                      className="w-full px-5 py-2 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4"
                      style={{
                        background: themeColors.inputBg,
                        borderColor: themeColors.cardBorder,
                        color: themeColors.text,
                        "::placeholder": { color: themeColors.textSecondary },
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = themeColors.primary;
                        e.currentTarget.style.boxShadow = `0 0 0 4px ${themeColors.primaryBg}40`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          themeColors.cardBorder;
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors"
                      style={{ color: themeColors.textSecondary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = themeColors.text;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = themeColors.textSecondary;
                      }}
                    >
                      {showConfirmPassword ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Requirements */}
                <div
                  className="rounded-lg p-3 border"
                  style={{
                    background: isDark
                      ? `${themeColors.cardBg}80`
                      : `${themeColors.primaryBg}40`,
                    borderColor: isDark
                      ? themeColors.cardBorder
                      : themeColors.primary,
                  }}
                >
                  <h3
                    className="font-semibold mb-2 text-xs"
                    style={{ color: themeColors.text }}
                  >
                    Password requirements:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center transition-all"
                        style={{
                          background: requirementsMet.length
                            ? themeColors.success
                            : isDark
                            ? themeColors.cardBorder
                            : "#e5e7eb",
                        }}
                      >
                        {requirementsMet.length ? (
                          <Check className="w-2.5 h-2.5 text-white" />
                        ) : (
                          <X className="w-2.5 h-2.5 text-white" />
                        )}
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: requirementsMet.length
                            ? themeColors.success
                            : themeColors.textSecondary,
                        }}
                      >
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center transition-all"
                        style={{
                          background: requirementsMet.different
                            ? themeColors.success
                            : isDark
                            ? themeColors.cardBorder
                            : "#e5e7eb",
                        }}
                      >
                        {requirementsMet.different ? (
                          <Check className="w-2.5 h-2.5 text-white" />
                        ) : (
                          <X className="w-2.5 h-2.5 text-white" />
                        )}
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: requirementsMet.different
                            ? themeColors.success
                            : themeColors.textSecondary,
                        }}
                      >
                        Different from current password
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center transition-all"
                        style={{
                          background: requirementsMet.match
                            ? themeColors.success
                            : isDark
                            ? themeColors.cardBorder
                            : "#e5e7eb",
                        }}
                      >
                        {requirementsMet.match ? (
                          <Check className="w-2.5 h-2.5 text-white" />
                        ) : (
                          <X className="w-2.5 h-2.5 text-white" />
                        )}
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: requirementsMet.match
                            ? themeColors.success
                            : themeColors.textSecondary,
                        }}
                      >
                        Passwords match
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  style={{
                    background: loading
                      ? themeColors.disabledBg || "#6b7280"
                      : themeColors.primary,
                    color: loading
                      ? themeColors.disabledText || "#d1d5db"
                      : themeColors.onPrimary,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div
                        className="w-5 h-5 border-3 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: themeColors.onPrimary }}
                      ></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Mobile Image Section */}
          <div className="lg:hidden mt-12">
            <div
              className="rounded-2xl overflow-hidden shadow-lg"
              style={{ background: themeColors.cardBg }}
            >
              <img
                src={resetimg}
                alt="Security"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Shield
                    className="w-8 h-8"
                    style={{ color: themeColors.primary }}
                  />
                  <h3
                    className="text-lg font-bold"
                    style={{ color: themeColors.text }}
                  >
                    Keep Your Account Secure
                  </h3>
                </div>
                <p
                  className="text-sm"
                  style={{ color: themeColors.textSecondary }}
                >
                  Regular password updates help protect your account from
                  unauthorized access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal - Pass theme colors */}
      <OTPModal
        visible={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOTP}
        loading={otpLoading}
        timer={timer}
        title="Verify Password Change"
        subtitle="Enter the OTP sent to your email to change your password"
        themeColors={themeColors}
        isDark={isDark}
      />

      {/* CustomAlert - Pass theme colors */}
      <CustomAlert
        visible={customAlert.visible}
        onClose={() => setCustomAlert((prev) => ({ ...prev, visible: false }))}
        title={customAlert.title}
        message={customAlert.message}
        type={customAlert.type}
        primaryAction={customAlert.primaryAction}
        secondaryAction={customAlert.secondaryAction}
        themeColors={themeColors}
        isDark={isDark}
      />
    </div>
  );
}
