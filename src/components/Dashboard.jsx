import { useState } from "react";
import {
  Smartphone,
  Battery,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Calendar,
  RefreshCw,
} from "lucide-react";
import DeviceStatusDistribution from "./DeviceStatusDistribution";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = () => {
  const [stats] = useState({
    totalDevices: 12,
    activeDevices: 10,
    criticalAlerts: 3,
    lowBattery: 2,
    offlineDevices: 2,
    dailyUsage: 1247,
    monthlyUsage: 35621,
    uptime: 98.7,
  });
  
  const [selectedAlertType, setSelectedAlertType] = useState("tissue");
  const [isLoading, setIsLoading] = useState(false);

  const [recentActivity] = useState([
    {
      id: 1,
      device: "Dispenser-A1",
      event: "Low tissue alert",
      time: "2 min ago",
      type: "warning",
    },
    {
      id: 2,
      device: "Dispenser-B2",
      event: "Refilled",
      time: "15 min ago",
      type: "success",
    },
    {
      id: 3,
      device: "Dispenser-C3",
      event: "Battery low (8%)",
      time: "1 hour ago",
      type: "critical",
    },
    {
      id: 4,
      device: "Dispenser-D4",
      event: "Maintenance completed",
      time: "2 hours ago",
      type: "info",
    },
    {
      id: 5,
      device: "Dispenser-E5",
      event: "Offline",
      time: "3 hours ago",
      type: "error",
    },
  ]);

  const usageData = [
    { name: "Mon", usage: 45, alerts: 2 },
    { name: "Tue", usage: 52, alerts: 1 },
    { name: "Wed", usage: 48, alerts: 3 },
    { name: "Thu", usage: 61, alerts: 0 },
    { name: "Fri", usage: 55, alerts: 2 },
    { name: "Sat", usage: 38, alerts: 1 },
    { name: "Sun", usage: 42, alerts: 4 },
  ];

  // Sample realtime status data for the DeviceStatusDistribution component
  const [realtimeStatus] = useState([
    { device_id: "1", current_status: "full", battery_percentage: 85, power_status: "on" },
    { device_id: "2", current_status: "full", battery_percentage: 92, power_status: "on" },
    { device_id: "3", current_status: "low", battery_percentage: 23, power_status: "on" },
    { device_id: "4", current_status: "full", battery_percentage: 78, power_status: "on" },
    { device_id: "5", current_status: "empty", battery_percentage: 15, power_status: "off" },
    { device_id: "6", current_status: "tamper", battery_percentage: 45, power_status: "on" },
    { device_id: "7", current_status: "full", battery_percentage: 65, power_status: "on" },
    { device_id: "8", current_status: "low", battery_percentage: 12, power_status: "on" },
    { device_id: "9", current_status: "full", battery_percentage: 0, power_status: "off" },
    { device_id: "10", current_status: "full", battery_percentage: 55, power_status: "on" },
    { device_id: "11", current_status: "empty", battery_percentage: 8, power_status: "on" },
    { device_id: "12", current_status: "full", battery_percentage: 72, power_status: "on" },
  ]);

  const deviceStatus = [
    {
      name: "Dispenser-A1",
      room: "Room 101",
      floor: 1,
      status: "active",
      battery: 85,
      usage: 45,
    },
    {
      name: "Dispenser-B2",
      room: "Room 102",
      floor: 1,
      status: "active",
      battery: 92,
      usage: 38,
    },
    {
      name: "Dispenser-C3",
      room: "Room 201",
      floor: 2,
      status: "warning",
      battery: 23,
      usage: 52,
    },
    {
      name: "Dispenser-D4",
      room: "Room 202",
      floor: 2,
      status: "active",
      battery: 78,
      usage: 41,
    },
    {
      name: "Dispenser-E5",
      room: "Room 301",
      floor: 3,
      status: "offline",
      battery: 15,
      usage: 0,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "offline":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your Smart Tissue Dispenser network
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Smartphone className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalDevices}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Active Devices
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeDevices}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Critical Alerts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.criticalAlerts}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Battery className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Battery</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.lowBattery}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Weekly Usage Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="usage" fill="#3B82F6" name="Usage Count" />
              <Bar dataKey="alerts" fill="#EF4444" name="Alerts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device Status Distribution */}
        <DeviceStatusDistribution 
          realtimeStatus={realtimeStatus}
          selectedAlertType={selectedAlertType}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
        
        {/* Alert Type Toggle */}
        <div className="card p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Alert Type
          </h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedAlertType("tissue")}
              className={`px-4 py-2 rounded-md ${selectedAlertType === "tissue" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              Tissue Alerts
            </button>
            <button
              onClick={() => setSelectedAlertType("battery")}
              className={`px-4 py-2 rounded-md ${selectedAlertType === "battery" 
                ? "bg-yellow-500 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              Battery Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Status */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Device Status
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Battery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deviceStatus.map((device) => (
                  <tr key={device.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {device.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {device.room} - Floor {device.floor}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          device.status
                        )}`}
                      >
                        {getStatusIcon(device.status)}
                        <span className="ml-1 capitalize">{device.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="flex-1 mr-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                device.battery > 50
                                  ? "bg-green-500"
                                  : device.battery > 20
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${device.battery}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-sm">{device.battery}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {device.usage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivity.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== recentActivity.length - 1 && (
                      <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              {activity.device}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {activity.event}
                          </p>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* System Performance */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          System Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.uptime}%
            </div>
            <div className="text-sm text-gray-500">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.dailyUsage.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Daily Usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.monthlyUsage.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Monthly Usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.activeDevices}/{stats.totalDevices}
            </div>
            <div className="text-sm text-gray-500">Active Devices</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
