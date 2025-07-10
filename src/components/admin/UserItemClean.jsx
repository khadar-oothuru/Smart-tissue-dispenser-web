import React from "react";
import { User, Shield, Trash2, UserCog } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const UserItemClean = ({ user, onRoleChange, onDelete, onViewProfile }) => {
  const { themeColors } = useTheme();
  const [imageError, setImageError] = React.useState(false);

  // Reset image error when user changes
  React.useEffect(() => {
    setImageError(false);
  }, [user?.id]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        {/* Avatar */}
        <div className="relative mr-4">
          {user.profile_picture && !imageError ? (
            <img
              src={user.profile_picture}
              alt={user.username}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="h-7 w-7 text-gray-400 dark:text-gray-500" />
            </div>
          )}
          <div
            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
              user.is_active ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </div>

        {/* User Details */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user.username}
            </h3>
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {user.email}
          </p>
          <div className="flex items-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Joined{" "}
              {user.date_joined_formatted ||
                new Date(user.date_joined).toLocaleDateString()}
            </p>
            {user.last_login && (
              <p className="text-xs text-gray-400 dark:text-gray-500 ml-4">
                Last login: {new Date(user.last_login).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onViewProfile(user)}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
            title="View Profile"
          >
            <User className="h-4 w-4" />
          </button>
          <button
            onClick={() => onRoleChange(user)}
            className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors duration-200"
            title="Change Role"
          >
            <UserCog className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
            title="Delete User"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserItemClean;
