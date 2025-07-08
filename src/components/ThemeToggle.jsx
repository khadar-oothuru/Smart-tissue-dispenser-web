import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ];

  return (
    <div
      className="flex items-center rounded-lg transition-all duration-300 theme-toggle-container"
      style={{
        backgroundColor: "var(--color-inputbg)",
        border: "1px solid var(--color-border)",
        padding: "var(--spacing-2)",
        gap: "var(--spacing-3)",
        boxShadow: "var(--shadow-sm)",
        backdropFilter: "blur(8px)",
      }}
    >
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-primary theme-toggle-btn ${
              isActive ? "active" : ""
            }`}
            style={{
              backgroundColor: isActive
                ? "var(--color-primary)"
                : "transparent",
              background: isActive
                ? "linear-gradient(145deg, var(--color-primary), var(--color-primary-dark))"
                : "transparent",
              color: isActive ? "white" : "var(--color-text)",
              boxShadow: isActive ? "var(--shadow-md)" : "none",
              border: isActive
                ? "1px solid var(--color-primary)"
                : "1px solid transparent",
              transform: isActive ? "translateY(-1px)" : "translateY(0)",
              minWidth: "48px",
              margin: "0 var(--spacing-1)",
              position: "relative",
              overflow: "hidden",
            }}
            title={`Switch to ${option.label.toLowerCase()} theme`}
            aria-label={`Switch to ${option.label.toLowerCase()} theme`}
            aria-pressed={isActive}
          >
            <Icon
              size={18}
              className={`${isActive ? "animate-pulse-once" : ""}`}
            />
            <span className="hidden sm:inline ml-1">{option.label}</span>
            {isActive && (
              <span
                className="absolute inset-0 bg-white opacity-10 rounded-md"
                style={{
                  animation: "ripple 1s ease-out forwards",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

// Define CSS animation keyframes
const style = document.createElement("style");
style.textContent = `
  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 0.25;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }
  @keyframes pulse-once {
    0% { transform: scale(1); }
    50% { transform: scale(1.25); }
    100% { transform: scale(1); }
  }
  .theme-toggle-container:hover {
    box-shadow: var(--shadow-md);
  }
  .theme-toggle-btn:hover {
    transform: translateY(-2px);
  }
  .theme-toggle-btn.active {
    transform: translateY(-2px);
  }
`;
document.head.appendChild(style);

export default ThemeToggle;
