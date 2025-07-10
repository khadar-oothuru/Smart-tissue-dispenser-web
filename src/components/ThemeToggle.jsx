import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../hooks/useThemeContext";

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
      <div
        className="relative flex w-full items-center justify-center"
        style={{ minWidth: "120px", minHeight: "44px" }}
      >
        {/* Toggle Track */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-11 rounded-full theme-toggle-track"
          style={{
            background: "var(--color-surface)",
            border: "2px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
            zIndex: 0,
            transition: "background 0.3s, border 0.3s",
          }}
        />
        {/* Toggle Thumb (animated, with single icon and label) */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 theme-toggle-thumb flex items-center justify-center`}
          style={{
            width: "calc(50% - 6px)",
            height: "38px",
            borderRadius: "9999px",
            background:
              theme === "dark"
                ? "linear-gradient(145deg, var(--color-primary), var(--color-background))"
                : "linear-gradient(145deg, var(--color-primary), var(--color-accent))",
            boxShadow: "0 2px 8px 0 rgb(0 0 0 / 0.10)",
            border: `2.5px solid var(--color-primary)`,
            transition: "left 0.3s, right 0.3s, background 0.3s",
            left: theme === "light" ? "4px" : "calc(50% + 2px)",
            right: "unset",
            zIndex: 2,
            color: "var(--color-surface)",
            justifyContent: "center",
            alignItems: "center",
            padding: 0,
          }}
        >
          {theme === "dark" ? (
            <Moon size={22} color="var(--color-surface)" />
          ) : (
            <Sun size={22} color="var(--color-surface)" />
          )}
        </div>
        {/* Toggle Buttons */}
        {themeOptions.map((option, idx) => {
          const Icon = option.icon;
          const isActive = theme === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-base font-semibold transition-all duration-300 theme-toggle-btn ${
                isActive ? "active" : ""
              }`}
              style={{
                background: "transparent",
                color: isActive ? "var(--color-primary)" : "var(--color-text)",
                fontWeight: isActive ? 700 : 500,
                border: "none",
                minWidth: "56px",
                margin: idx === 0 ? "0 0 0 2px" : "0 2px 0 0",
                position: "relative",
                outline: "none",
                boxShadow: "none",
                cursor: isActive ? "default" : "pointer",
                transition: "color 0.2s",
                zIndex: 3,
              }}
              title={`Switch to ${option.label.toLowerCase()} theme`}
              aria-label={`Switch to ${option.label.toLowerCase()} theme`}
              aria-pressed={isActive}
              disabled={isActive}
            >
              {/* Only show icon if not active, so thumb shows the active icon */}
              {!isActive && <Icon size={20} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Define CSS for toggle animation and style
const style = document.createElement("style");
style.textContent = `
  .theme-toggle-container:hover {
    box-shadow: var(--shadow-md);
  }
  .theme-toggle-btn.active {
    color: var(--color-primary);
    font-weight: 700;
  }
  .theme-toggle-thumb {
    box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.10);
    transition: left 0.3s, right 0.3s, background 0.3s;
  }
  .theme-toggle-track {
    transition: background 0.3s, border 0.3s;
  }
`;
document.head.appendChild(style);

export default ThemeToggle;
