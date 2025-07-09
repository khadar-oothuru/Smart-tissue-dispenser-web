import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../ThemeToggle";
import styles from "./AdminLayout.module.css";
import {
  Home,
  Smartphone,
  BarChart3,
  Bell,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  Users,
  ChevronRight,
  Activity,
  Sun,
  Moon,
  Monitor,
  Info,
} from "lucide-react";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  useTheme(); // Initialize theme context for CSS variables

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home,
      description: "Overview & stats",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      description: "Manage users",
    },
    {
      name: "Devices",
      href: "/admin/devices",
      icon: Smartphone,
      description: "Device management",
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      description: "Data insights",
    },
    {
      name: "Reports",
      href: "/admin/analytics",
      icon: FileText,
      description: "Generate reports",
    },
     {
      name: "Settings",
      href: "/admin/users",
      icon: Settings,
      description: "System settings",
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (href) => location.pathname === href;

  return (
    <div
      className="flex h-screen"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className={`fixed inset-0 z-50 lg:hidden ${styles.mobileOverlay}`}>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className={`fixed inset-y-0 left-0 z-50 w-80 shadow-2xl ${styles.mobileSidebar}`}
            style={{
              transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            }}
          >
            <div className="flex h-full flex-col">
              {/* Mobile Header */}
              <div className={styles.headerSection}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className={styles.headerIcon}>
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className={styles.headerTitle}>Smart Tissue</h1>
                      <p className={styles.headerSubtitle}>Admin Panel</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={styles.menuButton}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className={styles.navigationSection}>
                <p className={styles.sectionTitle}>Navigation</p>
                <div className="space-y-4">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`${styles.navItem} ${
                          active ? styles.navItemActive : ""
                        }`}
                      >
                        <div className={styles.navItemContent}>
                          <div className={styles.iconWrapper}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className={styles.navItemText}>
                            <span className={styles.navItemTitle}>
                              {item.name}
                            </span>
                            <span className={styles.navItemDescription}>
                              {item.description}
                            </span>
                          </div>
                          <ChevronRight
                            className={`h-4 w-4 ml-auto ${
                              active
                                ? styles.navItemChevronActive
                                : styles.navItemChevron
                            }`}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile User Section */}
              <div className={styles.userProfileSection}>
                <div className={styles.userSection}>
                  <div className="flex items-center gap-3 p-3">
                    <div className="relative">
                      <div className={styles.userAvatar}>
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className={styles.statusDot}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        System Administrator
                      </p>
                    </div>
                  </div>
                </div>
                <button onClick={handleLogout} className={styles.logoutButton}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex lg:w-80 lg:flex-col ${styles.sidebar}`}>
        {/* Desktop Header */}
        <div className={styles.headerSection}>
          <div className="flex items-center space-x-6">
            <div className={styles.headerIcon}>
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={styles.headerTitle}>Smart Tissue</h1>
              <p className={styles.headerSubtitle}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className={styles.navigationSection}>
          <div className="space-y-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${styles.navItem} ${
                    active ? styles.navItemActive : ""
                  }`}
                >
                  <div className={styles.navItemContent}>
                    <div className={styles.iconWrapper}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className={styles.navItemText}>
                      <span className={styles.navItemTitle}>{item.name}</span>
                      <span className={styles.navItemDescription}>
                        {item.description}
                      </span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 ml-auto ${
                        active
                          ? styles.navItemChevronActive
                          : styles.navItemChevron
                      }`}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className={styles.userProfileSection}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className={styles.topHeader}>
          <div className={styles.headerLeft}>
            {/* Hamburger only visible on mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className={`block lg:hidden ${styles.menuButton} ${styles.mobileMenuButton}`}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className={`ml-4 ${styles.headerInfo}`}>
              <h1>
                {navigation.find((item) => item.href === location.pathname)
                  ?.name || "Dashboard"}
              </h1>
              <p>
                {navigation.find((item) => item.href === location.pathname)
                  ?.description || "Welcome to your admin dashboard"}
              </p>
            </div>
          </div>

          <div className={styles.headerRight}>
            <ThemeToggle />
            <div
              className={styles.headerUser}
              style={{
                background: "none",
                boxShadow: "none",
                backdropFilter: "none",
                border: "none",
                padding: 0,
                margin: 0,
              }}
            >
              <div className="relative">
                <div className={styles.userAvatar}>
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  System Administrator
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className={styles.mainContent}>
          <div className={styles.contentWrapper}>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
