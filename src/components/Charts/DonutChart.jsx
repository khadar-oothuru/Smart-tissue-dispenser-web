import React from "react";

const DonutChart = ({ data, title, centerValue, centerLabel, size = 200 }) => {
  // Safe data validation
  const safeData = Array.isArray(data)
    ? data.filter((item) => item.value > 0)
    : [];

  if (!safeData.length) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          {title}
        </h3>
        <div className="text-gray-500 dark:text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const total = safeData.reduce((sum, item) => sum + item.value, 0);
  const radius = 80;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  let currentAngle = 0;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 text-center">
        {title}
      </h3>

      <div className="relative mb-4">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-600"
          />

          {/* Data segments */}
          {safeData.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${
              (percentage / 100) * circumference
            } ${circumference}`;
            const rotation = (currentAngle / 100) * 360;

            const segment = (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={0}
                className="transition-all duration-300"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: `${size / 2}px ${size / 2}px`,
                }}
              />
            );

            currentAngle += percentage;
            return segment;
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {centerValue || total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {centerLabel || "Total"}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
        {safeData.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
              {item.name}
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-white">
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
