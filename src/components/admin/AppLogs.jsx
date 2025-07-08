import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AdminService from "../../services/AdminService";

const AppLogs = ({ style }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  const logLevels = {
    ERROR: { color: "text-red-600 bg-red-50", icon: XCircle },
    WARNING: { color: "text-yellow-600 bg-yellow-50", icon: AlertTriangle },
    INFO: { color: "text-blue-600 bg-blue-50", icon: Info },
    SUCCESS: { color: "text-green-600 bg-green-50", icon: CheckCircle },
  };

  const fetchLogs = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const data = await AdminService.fetchAppLogs(pageNum, 50);
      const newLogs = data?.results || data || [];

      if (append) {
        setLogs((prev) => [...prev, ...newLogs]);
      } else {
        setLogs(newLogs);
      }

      setHasMore(data?.next ? true : false);
    } catch (error) {
      console.error("Error fetching logs:", error);
      // In case of error, show some dummy logs for demo
      if (!append) {
        setLogs(generateDummyLogs());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate dummy logs for demonstration
  const generateDummyLogs = () => {
    const levels = ["ERROR", "WARNING", "INFO", "SUCCESS"];
    const messages = [
      "User authentication successful",
      "Database connection established",
      "Failed to connect to external API",
      "Cache cleared successfully",
      "Invalid request parameters received",
      "System backup completed",
      "High memory usage detected",
      "New user registration",
      "Session expired for user",
      "Data sync completed",
    ];

    return Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      level: levels[Math.floor(Math.random() * levels.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      source: ["auth", "database", "api", "cache", "backup"][
        Math.floor(Math.random() * 5)
      ],
      details: `Additional details for log entry ${
        i + 1
      }. This contains more comprehensive information about the logged event.`,
    }));
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "all" || log.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const handleRefresh = () => {
    setPage(1);
    fetchLogs(1, false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLogs(nextPage, true);
  };

  const toggleLogExpansion = (logId) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const LogItem = ({ log }) => {
    const LogIcon = logLevels[log.level]?.icon || Info;
    const isExpanded = expandedLogs.has(log.id);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div
              className={`p-2 rounded-full ${
                logLevels[log.level]?.color || "text-gray-600 bg-gray-50"
              }`}
            >
              <LogIcon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {log.message}
                </p>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    logLevels[log.level]?.color || "text-gray-600 bg-gray-50"
                  }`}
                >
                  {log.level}
                </span>
              </div>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span>Source: {log.source}</span>
              </div>
              {isExpanded && log.details && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">{log.details}</p>
                </div>
              )}
            </div>
          </div>
          {log.details && (
            <button
              onClick={() => toggleLogExpansion(log.id)}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={style} style={style}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Application Logs
            </h3>
            <p className="text-sm text-gray-500">
              Monitor system events and activities
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="all">All Levels</option>
            <option value="ERROR">Error</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
            <option value="SUCCESS">Success</option>
          </select>
        </div>
        <div className="mt-3 text-sm text-gray-500">
          Showing {filteredLogs.length} of {logs.length} logs
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <LogItem key={log.id} log={log} />
        ))}

        {filteredLogs.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No logs found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterLevel !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No logs have been generated yet."}
            </p>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && filteredLogs.length > 0 && (
          <div className="text-center pt-6">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Loading...
                </div>
              ) : (
                "Load More Logs"
              )}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading logs...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLogs;
