// NotificationCard.jsx
import React from "react";
import { 
  Bell, 
  Shield, 
  Archive, 
  Wrench, 
  X, 
  Smartphone,
  Clock,
  CheckCircle,
  Trash2
} from "lucide-react";

// Icon component that renders the appropriate icon
const NotificationIcon = ({ name, color, size = 24 }) => {
  const iconProps = { size, color, className: "flex-shrink-0" };
  
  const iconMap = {
    bell: <Bell {...iconProps} />,
    "shield-alert": <Shield {...iconProps} />,
    archive: <Archive {...iconProps} />,
    wrench: <Wrench {...iconProps} />,
  };

  return iconMap[name] || <Bell {...iconProps} />;
};

// Enhanced notification card component
export const NotificationCard = ({
  notification,
  onPress,
  onDismiss,
  className = "",
}) => {
  const { title, body, data = {}, timestamp } = notification;
  const {
    iconName = "bell",
    iconColor = "#3AB0FF",
    type = "default",
  } = data;

  // Get notification type styling
  const getTypeStyle = (type) => {
    const styles = {
      tamper: "bg-purple-50 border-l-4 border-purple-600",
      empty: "bg-red-50 border-l-4 border-red-600",
      low: "bg-orange-50 border-l-4 border-orange-500",
      full: "bg-green-50 border-l-4 border-green-500",
      maintenance: "bg-blue-50 border-l-4 border-blue-500",
      default: "bg-gray-50 border-l-4 border-sky-500",
    };
    return styles[type] || styles.default;
  };

  const getTitleColor = (type) => {
    const colors = {
      tamper: "text-purple-700",
      empty: "text-red-700",
      low: "text-orange-700",
      full: "text-green-700",
      maintenance: "text-blue-700",
      default: "text-blue-700",
    };
    return colors[type] || colors.default;
  };

  const typeStyle = getTypeStyle(type);
  const titleColor = getTitleColor(type);

  return (
    <div
      className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden ${typeStyle} ${className}`}
      onClick={onPress}
    >
      <div className="p-4">
        <div className="flex items-start mb-2">
          <div className="mr-3 mt-1">
            <div className="w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center">
              <NotificationIcon name={iconName} color={iconColor} size={28} />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className={`font-semibold text-base leading-tight ${titleColor}`}>
              {title}
            </h3>
            {timestamp && (
              <span className="text-xs text-gray-500 mt-1">
                {new Date(timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
          
          {onDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="p-1 hover:bg-gray-200 rounded-md transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          )}
        </div>

        <p className="text-gray-700 text-sm leading-relaxed ml-13 line-clamp-3">
          {body}
        </p>

        {data.device_name && (
          <div className="flex items-center mt-3 ml-13 text-xs text-gray-600">
            <Smartphone size={14} className="mr-1" />
            <span>
              {data.device_name}
              {data.room && data.floor && ` • Room ${data.room}, Floor ${data.floor}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Notification list component
export const NotificationList = ({
  notifications,
  onNotificationPress,
  onNotificationDismiss,
}) => {
  return (
    <div className="space-y-3 p-4">
      {notifications.map((notification, index) => (
        <NotificationCard
          key={`${notification.id || index}-${notification.timestamp}`}
          notification={notification}
          onPress={() => onNotificationPress?.(notification)}
          onDismiss={() => onNotificationDismiss?.(notification)}
        />
      ))}
    </div>
  );
};

// Simple notification icon for use in headers, badges, etc.
export const SimpleNotificationIcon = ({ type, size = 20 }) => {
  const iconConfig = {
    tamper: { name: "shield-alert", color: "#8B5CF6" },
    empty: { name: "archive", color: "#DC2626" },
    low: { name: "archive", color: "#FF9800" },
    full: { name: "archive", color: "#4CAF50" },
    maintenance: { name: "wrench", color: "#2196F3" },
    default: { name: "bell", color: "#3AB0FF" },
  }[type] || { name: "bell", color: "#3AB0FF" };

  return <NotificationIcon {...iconConfig} size={size} />;
};

export default NotificationCard;