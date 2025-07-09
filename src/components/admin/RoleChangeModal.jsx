import React from 'react';
import { Shield, User, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const RoleChangeModal = ({ visible, user, onRoleUpdate, onClose }) => {
  const { themeColors } = useTheme();

  if (!visible || !user) return null;

  const handleRoleChange = (newRole) => {
    if (user.role !== newRole) {
      onRoleUpdate(newRole);
      // Don't close here - let parent handle closing after successful API call
    } else {
      onClose(); // Close if same role selected
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Change User Role
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Change role for {user.first_name} {user.last_name}
        </p>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Current role: <span className="font-semibold">{user.role?.toUpperCase()}</span>
        </p>

        <div className="space-y-3 mb-6">
          {/* User Role Option */}
          <button
            className={`w-full flex items-center p-4 rounded-lg border ${user.role === 'user' 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            onClick={() => handleRoleChange('user')}
          >
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900 dark:text-white">User</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Standard user with basic permissions
              </p>
            </div>
            {user.role === 'user' && (
              <div className="h-5 w-5 text-blue-600 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>

          {/* Admin Role Option */}
          <button
            className={`w-full flex items-center p-4 rounded-lg border ${user.role === 'admin' 
              ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' 
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            onClick={() => handleRoleChange('admin')}
          >
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900 dark:text-white">Admin</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Full access to system management
              </p>
            </div>
            {user.role === 'admin' && (
              <div className="h-5 w-5 text-purple-600 dark:text-purple-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>

          {/* Manager Role Option */}
          <button
            className={`w-full flex items-center p-4 rounded-lg border ${user.role === 'manager' 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            onClick={() => handleRoleChange('manager')}
          >
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900 dark:text-white">Manager</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage users and view reports
              </p>
            </div>
            {user.role === 'manager' && (
              <div className="h-5 w-5 text-blue-600 dark:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleChangeModal;