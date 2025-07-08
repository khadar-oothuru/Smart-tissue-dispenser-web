import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import ThemeToggle from "../ThemeToggle";
import { useAuth } from "../../hooks/useAuth";
import fitnessImg from "../../assets/images/notdark.png"; // Use your own image or replace with a real one
import { useTheme } from "../../context/ThemeContext";

// Google Sign-In
const GOOGLE_CLIENT_ID =
  "70657860851-4gh622q01j5uirrc2erd9mha36vnaija.apps.googleusercontent.com";

// Custom Alert Component for Web
const CustomAlert = ({ visible, type, title, message, onClose }) => {
  if (!visible) return null;

  const alertStyles = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className={`p-4 rounded-lg border ${alertStyles[type]} mb-4`}>
          <h3 className="font-semibold mb-2">{title}</h3>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
};

// Custom Input Component for Web
const CustomInputWithIcon = ({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  showPassword,
  onTogglePassword,
  isFocused,
  onFocus,
  onBlur,
  autoCapitalize,
}) => {
  const IconComponent = icon === "mail" ? Mail : Lock;
  return (
    <div className="mb-6 flex flex-col items-center w-full">
      <div className="relative w-full flex justify-center">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none"
          style={{ minWidth: 22 }}
        >
          <IconComponent
            className="h-5 w-5 text-gray-400"
            style={{ display: "block" }}
          />
        </span>
        <input
          type={type === "password" && !showPassword ? "password" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize={autoCapitalize}
          className={`peer rounded-md border border-[#e0e0e0] bg-[#181e29] text-white placeholder-transparent focus:ring-2 focus:ring-purple-400 focus:border-purple-400 py-3 px-10 text-base outline-none transition w-[340px] max-w-full`}
          id={placeholder}
        />
        <label
          htmlFor={placeholder}
          className={`absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-all duration-200 bg-transparent px-1
            peer-focus:-top-2 peer-focus:text-xs peer-focus:text-purple-400
            ${value ? "-top-2 text-xs text-purple-400" : ""}
          `}
          style={{ background: "#181e29" }}
        >
          {placeholder}
        </label>
        {type === "password" && (
          <button
            type="button"
            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-5"
            onClick={onTogglePassword}
            tabIndex={-1}
            style={{ height: "100%" }}
          >
            {showPassword ? (
              <EyeOff
                className="h-5 w-5 text-gray-400"
                style={{ display: "block" }}
              />
            ) : (
              <Eye
                className="h-5 w-5 text-gray-400"
                style={{ display: "block" }}
              />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Google Sign-In Button Component
const GoogleSignInButton = ({ onPress, loading }) => (
  <button
    type="button"
    onClick={onPress}
    disabled={loading}
    className="w-full flex items-center justify-center px-4 py-3 rounded-md shadow bg-[#232b3b] border border-[#3a4256] text-white font-medium text-base focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
    style={{ minHeight: 48 }}
  >
    {loading ? (
      <Loader2 className="animate-spin h-5 w-5 mr-2" />
    ) : (
      <FcGoogle className="h-6 w-6 mr-2" />
    )}
    {loading ? "Signing in..." : "Continue with Google"}
  </button>
);

const Login = () => {
  const navigate = useNavigate();

  // Use AuthContext
  const { user, login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailFocused, setEmailFocused] = useState(false);
  const [isPasswordFocused, setPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Custom Alert states
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: "error",
    title: "",
    message: "",
    primaryAction: null,
    secondaryAction: null,
  });

  // Custom alert functions
  const showAlert = useCallback((config) => {
    setAlertConfig({
      visible: true,
      ...config,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig({
      visible: false,
      type: "error",
      title: "",
      message: "",
      primaryAction: null,
      secondaryAction: null,
    });
  }, []);

  // Load Google Sign-In script
  useEffect(() => {
    const loadGoogleScript = () => {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    };
    loadGoogleScript();
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    }
  }, [user, navigate]);

  const handleGoogleToken = useCallback(
    async (idToken) => {
      setIsLoading(true);
      try {
        const result = await loginWithGoogle(idToken);

        if (result.success) {
          const { user } = result;
          navigate(user.role === "admin" ? "/admin" : "/dashboard", {
            replace: true,
          });
        } else {
          showAlert({
            type: "error",
            title: "Authentication Failed",
            message:
              result.error ||
              "Failed to authenticate with Google. Please try again.",
          });
        }
      } catch (err) {
        console.error("Google token validation error:", err);
        showAlert({
          type: "error",
          title: "Authentication Failed",
          message: "Failed to authenticate with Google. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [loginWithGoogle, navigate, showAlert]
  );

  const handleGoogleSignIn = useCallback(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          handleGoogleToken(response.credential);
        },
      });

      window.google.accounts.id.prompt();
    } else {
      showAlert({
        type: "error",
        title: "Google Sign In Failed",
        message: "Google sign in failed. Please try again.",
      });
    }
  }, [handleGoogleToken, showAlert]);

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({
        type: "warning",
        title: "Missing Fields",
        message: "Please enter both email and password.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ email, password });

      if (result.success) {
        const { user } = result;
        console.log("Login Debug - User data received:", user);
        console.log("Login Debug - User role:", user.role);

        navigate(user.role === "admin" ? "/admin" : "/dashboard", {
          replace: true,
        });
      } else {
        showAlert({
          type: "error",
          title: "Login Failed",
          message: result.error || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      console.error(err);

      let errorTitle = "Login Failed";
      let errorMessage = "Something went wrong. Please try again.";

      if (err.response?.status === 401) {
        errorTitle = "Invalid Credentials";
        errorMessage =
          "The email or password you entered is incorrect. Please try again.";
      } else if (err.response?.status === 404) {
        errorTitle = "Account Not Found";
        errorMessage =
          "No account found with this email address. Please check your email or sign up.";
      } else if (err.response?.status === 403) {
        errorTitle = "Account Disabled";
        errorMessage =
          "Your account has been disabled. Please contact support.";
      } else if (err.response?.data?.message || err.response?.data?.error) {
        errorMessage = err.response.data.message || err.response.data.error;
      } else if (err.code === "NETWORK_ERROR" || !err.response) {
        errorTitle = "Connection Error";
        errorMessage =
          "Unable to connect to server. Please check your internet connection and try again.";
      }

      showAlert({
        type: "error",
        title: errorTitle,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const { themeColors } = useTheme();
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center"
      style={{ background: themeColors.background }}
    >
      <div className="flex w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
        {/* Left: Form */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12 md:px-16 lg:px-20 xl:px-24">
          <div
            className="w-full max-w-md mx-auto pb-8"
            style={{ marginLeft: 24 }}
          >
            <h2
              className="text-4xl font-extrabold text-center mb-2 tracking-tight"
              style={{ color: themeColors.primary, letterSpacing: 1 }}
            >
              Log In
            </h2>
            <p
              className="text-center mb-8 text-base"
              style={{ color: themeColors.text, opacity: 0.7 }}
            >
              Welcome back! Please enter your details
            </p>
            <div className="flex flex-col gap-4">
              <GoogleSignInButton
                onPress={handleGoogleSignIn}
                loading={isLoading}
              />
              <div className="flex items-center gap-2">
                <div className="flex-grow h-px bg-[#3a4256]" />
                <span className="text-sm text-[#a1a1aa]">Or</span>
                <div className="flex-grow h-px bg-[#3a4256]" />
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="flex flex-col gap-0 mt-4 items-center"
            >
              <CustomInputWithIcon
                icon="mail"
                placeholder="Email"
                value={email}
                onChange={setEmail}
                type="email"
                isFocused={isEmailFocused}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCapitalize="none"
              />
              <CustomInputWithIcon
                icon="lock-closed"
                placeholder="Password"
                value={password}
                onChange={setPassword}
                type="password"
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                isFocused={isPasswordFocused}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <div className="flex justify-end w-[340px] max-w-full text-sm mb-4 ">
                <Link
                  to="/forgot-password"
                  className="font-medium text-[#a259ff] hover:underline pr-1"
                  style={{ letterSpacing: 0.2 }}
                >
                  forgot password ?
                </Link>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-[340px] max-w-full p-3 px-4 font-bold rounded-md shadow transition-colors bg-[#a259ff] hover:bg-[#7c3aed] text-white text-lg mt-2 mb-6 ${
                  isLoading ? "animate-pulse" : ""
                }`}
                style={{
                  boxShadow: "0 2px 8px 0 rgba(124,58,237,0.10)",
                  letterSpacing: 0.5,
                }}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  "Log in"
                )}
              </button>
            </form>
            <div className="flex items-center gap-2 my-6">
              <div className="flex-grow h-px bg-[#3a4256]" />
              <span className="text-sm text-[#a1a1aa]">Or Continue With</span>
              <div className="flex-grow h-px bg-[#3a4256]" />
            </div>
            <div className="text-center">
              <span className="text-sm" style={{ color: themeColors.text }}>
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[#ff6b35] hover:underline"
                >
                  Sign up
                </Link>
              </span>
            </div>
          </div>
        </div>
        {/* Right: Visual */}
        <div className="hidden md:flex flex-1 items-center justify-center relative bg-gradient-to-tr from-transparent via-[rgba(124,58,237,0.10)] to-[rgba(124,58,237,0.20)]">
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(circle at 60% 40%, #a78bfa33 60%, #c4b5fd99 100%)",
              filter: "blur(0px)",
            }}
          />
          <img
            src={fitnessImg}
            alt="Login Visual"
            className="object-contain relative z-10 max-h-[60vh] drop-shadow-2xl rounded-2xl"
            style={{ filter: "none" }}
          />
        </div>
      </div>
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
      />
    </div>
  );
};

export default Login;
