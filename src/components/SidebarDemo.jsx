import React, { useState } from "react";
import {
  Home,
  Users,
  Settings,
  Bell,
  BarChart3,
  Calendar,
  Mail,
  FileText,
  Search,
  Menu,
  X,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import "../styles/theme.css";

const SidebarDemo = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");

  const navigation = [
    {
      name: "Dashboard",
      href: "dashboard",
      icon: Home,
      description: "Overview & stats",
    },
    {
      name: "Users",
      href: "users",
      icon: Users,
      description: "Manage users",
    },
    {
      name: "Analytics",
      href: "analytics",
      icon: BarChart3,
      description: "Data insights",
    },
    {
      name: "Settings",
      href: "settings",
      icon: Settings,
      description: "System settings",
    },
  ];

  const handleItemClick = (href) => {
    setActiveItem(href);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Demo Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Enhanced Sidebar Demo
          </h1>
          <div className="w-10 lg:hidden"></div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Enhanced Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out mobile-sidebar-enter">
              <div className="flex h-full flex-col overflow-y-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-2xl sidebar-scroll">
                {/* Enhanced Mobile Header */}
                <div className="relative flex h-20 items-center justify-between px-6 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm"></div>
                  <div className="relative flex items-center">
                    <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm ring-1 ring-white/30">
                      <Shield className="h-6 w-6 text-white drop-shadow-sm" />
                    </div>
                    <div className="ml-4">
                      <span className="text-xl font-bold text-white tracking-wide drop-shadow-sm">
                        Demo Panel
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse sidebar-float"></div>
                        <span className="text-xs text-white/80 font-medium">
                          Mobile
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="relative rounded-xl p-2 text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm ring-1 ring-white/20"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Status Bar */}
                <div className="px-6 py-3 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Touch navigation
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Mobile Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-3 sidebar-scroll">
                  {navigation.map((item, index) => {
                    const Icon = item.icon;
                    const active = activeItem === item.href;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleItemClick(item.href)}
                        className={`group relative flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 ease-in-out sidebar-item sidebar-active-glow w-full ${
                          active
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20 transform scale-[1.02] ring-2 ring-purple-200 dark:ring-purple-800/50 sidebar-glow"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 hover:scale-[1.01] hover:shadow-md"
                        }`}
                        style={{
                          animationDelay: `${index * 100}ms`,
                        }}
                      >
                        {/* Background gradient overlay for active state */}
                        {active && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-2xl blur-sm -z-10"></div>
                        )}

                        {/* Icon with enhanced styling */}
                        <div
                          className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 sidebar-icon-hover ${
                            active
                              ? "bg-white/20 backdrop-blur-sm ring-1 ring-white/30 glass-effect"
                              : "bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 transition-all duration-300 ${
                              active
                                ? "text-white drop-shadow-sm"
                                : "text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                            }`}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 text-left">
                          <div
                            className={`font-semibold transition-all duration-300 ${
                              active
                                ? "text-white"
                                : "text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            {item.name}
                          </div>
                          <div
                            className={`text-xs transition-all duration-300 ${
                              active
                                ? "text-white/80"
                                : "text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                            }`}
                          >
                            {item.description}
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        {active && (
                          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/20 backdrop-blur-sm">
                            <ChevronRight className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Enhanced Mobile User Section */}
                <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-5 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
                  {/* User Profile Card */}
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 mb-4 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center ring-2 ring-white/50 dark:ring-gray-800/50">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          Demo User
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Administrator
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 text-xs font-medium hover:scale-[1.02] hover:shadow-md"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-border)",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <button
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 text-xs font-medium hover:scale-[1.02] hover:shadow-md"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-border)",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <Bell className="h-4 w-4" />
                      Alerts
                    </button>
                  </div>

                  {/* Logout Button */}
                  <button
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                    style={{
                      backgroundColor: "var(--color-danger)",
                      color: "white",
                      border: "1px solid var(--color-danger)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-80 flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-2xl border-r border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl sidebar-enter">
          {/* Enhanced Desktop Header */}
          <div className="relative flex h-20 items-center px-6 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm"></div>
            <div className="relative flex items-center">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm ring-1 ring-white/30">
                <Shield className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
              <div className="ml-4">
                <span className="text-xl font-bold text-white tracking-wide drop-shadow-sm">
                  Demo Panel
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse sidebar-float"></div>
                  <span className="text-xs text-white/80 font-medium">
                    System Online
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="px-6 py-3 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600 dark:text-gray-400">
                  Real-time monitoring
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Desktop Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto sidebar-scroll">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const active = activeItem === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => handleItemClick(item.href)}
                  className={`group relative flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-medium transition-all duration-300 ease-in-out sidebar-item sidebar-active-glow w-full ${
                    active
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20 transform scale-[1.02] ring-2 ring-purple-200 dark:ring-purple-800/50 sidebar-glow"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 hover:scale-[1.01] hover:shadow-md"
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Background gradient overlay for active state */}
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-2xl blur-sm -z-10"></div>
                  )}

                  {/* Icon with enhanced styling */}
                  <div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 sidebar-icon-hover ${
                      active
                        ? "bg-white/20 backdrop-blur-sm ring-1 ring-white/30 glass-effect"
                        : "bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-all duration-300 ${
                        active
                          ? "text-white drop-shadow-sm"
                          : "text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div
                      className={`font-semibold transition-all duration-300 ${
                        active
                          ? "text-white"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {item.name}
                    </div>
                    <div
                      className={`text-xs transition-all duration-300 ${
                        active
                          ? "text-white/80"
                          : "text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  {active && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/20 backdrop-blur-sm">
                      <ChevronRight className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Enhanced Desktop User Section */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-5 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
            {/* User Profile Card */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 mb-4 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center ring-2 ring-white/50 dark:ring-gray-800/50">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    Demo User
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Administrator
                  </p>
                </div>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 text-xs font-medium hover:scale-[1.02] hover:shadow-md"
                style={{
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 text-xs font-medium hover:scale-[1.02] hover:shadow-md"
                style={{
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <Bell className="h-4 w-4" />
                Alerts
              </button>
            </div>

            {/* Logout Button */}
            <button
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
              style={{
                backgroundColor: "var(--color-danger)",
                color: "white",
                border: "1px solid var(--color-danger)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Enhanced Sidebar UI
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  This demonstrates the enhanced sidebar with modern design
                  elements including:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      ✨ Visual Enhancements
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• Gradient backgrounds and glassmorphism effects</li>
                      <li>• Enhanced hover and active states</li>
                      <li>• Improved icons with animations</li>
                      <li>• Status indicators and badges</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      🎬 Smooth Animations
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• Slide-in animations for sidebar</li>
                      <li>• Staggered item animations</li>
                      <li>• Floating status indicators</li>
                      <li>• Hover and click feedback</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      📱 Responsive Design
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• Mobile-first approach</li>
                      <li>• Touch-friendly interactions</li>
                      <li>• Adaptive layout for all screens</li>
                      <li>• Custom scrollbars</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      🎨 Modern UI Elements
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm">
                      <li>• Enhanced user profile section</li>
                      <li>• Quick action buttons</li>
                      <li>• Real-time status monitoring</li>
                      <li>• Dark mode support</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  🔄 Try the Interactive Demo
                </h3>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                  Click on the sidebar items to see the enhanced active states
                  and animations. On mobile, use the menu button to open the
                  sidebar and experience the touch-optimized design.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarDemo;
