import React from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Settings,
  Activity,
  X,
  Maximize,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const UserProfileModal = ({ visible, user, onClose }) => {
  const { themeColors } = useTheme();
  const [showFullImage, setShowFullImage] = React.useState(false);

  if (!visible || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const InfoItem = ({
    icon: Icon,
    label,
    value,
    color = "text-gray-700 dark:text-gray-300",
  }) => (
    <div className="flex items-center mb-4">
      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
        <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className={`text-sm font-medium ${color}`}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            User Profile {user.username ? `- ${user.username}` : ""}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">
          {/* Profile Picture and Basic Info */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              {user.profile_picture ? (
                <div className="relative">
                  <img
                    src={user.profile_picture}
                    alt={user.username}
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                  <button
                    onClick={() => setShowFullImage(true)}
                    className="absolute top-0 right-0 bg-gray-800 bg-opacity-60 rounded-full p-1"
                  >
                    <Maximize className="h-3 w-3 text-white" />
                  </button>
                  <div
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                      user.is_active ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  <div
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                      user.is_active ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </div>
              )}
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user.username}
            </h4>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              @{user.username}
            </p>

            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === "admin"
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              }`}
            >
              {user.role === "admin" ? (
                <Shield className="h-3 w-3 mr-1" />
              ) : (
                <User className="h-3 w-3 mr-1" />
              )}
              {user.role.toUpperCase()}
            </span>
          </div>

          {/* User Information */}
          <div className="mb-6">
            <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              User Information
            </h5>

            <InfoItem
              icon={Mail}
              label="Email"
              value={user.email || "Not provided"}
            />

            {/* Remove first/last name, just show username */}
            <InfoItem
              icon={User}
              label="Username"
              value={user.username || "Not provided"}
            />

            <InfoItem
              icon={Calendar}
              label="Date Joined"
              value={formatDate(user.date_joined)}
            />

            <InfoItem
              icon={Clock}
              label="Last Login"
              value={formatDate(user.last_login) || "Never"}
            />

            <InfoItem
              icon={CheckCircle}
              label="Account Status"
              value={user.is_active ? "Active" : "Inactive"}
              color={
                user.is_active
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }
            />

            {user.is_staff !== undefined && (
              <InfoItem
                icon={Shield}
                label="Staff Status"
                value={user.is_staff ? "Yes" : "No"}
                color={
                  user.is_staff
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400"
                }
              />
            )}

            {user.is_superuser !== undefined && (
              <InfoItem
                icon={Settings}
                label="Superuser"
                value={user.is_superuser ? "Yes" : "No"}
                color={
                  user.is_superuser
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
                }
              />
            )}
          </div>

          {/* Additional Stats if available */}
          {(user.device_count || user.last_activity) && (
            <div>
              <h5 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Activity
              </h5>

              {user.device_count && (
                <InfoItem
                  icon={Activity}
                  label="Devices"
                  value={`${user.device_count} connected`}
                />
              )}

              {user.last_activity && (
                <InfoItem
                  icon={Activity}
                  label="Last Activity"
                  value={formatDate(user.last_activity)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {showFullImage && user.profile_picture && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setShowFullImage(false)}
        >
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 text-white"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={user.profile_picture}
            alt={user.username}
            className="max-w-[90%] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default UserProfileModal;
