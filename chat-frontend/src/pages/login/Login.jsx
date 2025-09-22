import React, { useState, useCallback } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { SiFacebook } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-hot-toast";
import Logo from "../../assets/logo2.jpeg";
import useApiHook from "../../hooks/useApiHook";

// 🔹 Memoized Social Buttons
const GoogleButton = React.memo(() => (
  <button className="w-full inline-flex items-center justify-center py-2 px-1 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300">
    <FcGoogle className="h-5 w-5" />
    <span className="ml-2">Google</span>
  </button>
));

const FacebookButton = React.memo(() => (
  <button className="w-full inline-flex items-center justify-center py-2 px-1 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300">
    <SiFacebook className="h-5 w-5 text-[#1877F2]" />
    <span className="ml-2">Facebook</span>
  </button>
));

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { loading, error, data, apiCall } = useApiHook();

  // 🔹 Optimized Handlers with useCallback
  const handleChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const response = await apiCall(
        "http://localhost:5000/api/auth/login",
        "POST",
        formData
      );

      if (response) {
        toast.success("Login successful 🎉");
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("userId", response.user.id);
        navigate("/chat-ui");
      } else {
        toast.error("Invalid credentials ❌");
      }
    },
    [formData, apiCall, navigate]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center p-4 font-ubuntu">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 sm:p-7">
        {/* Top Icon and Heading */}
        <div className="text-center mb-3">
          <div className="flex justify-center items-center gap-1 mb-2">
            <div className="w-12 h-12 shadow-md">
              <img src={Logo} alt="Smart Chat Logo" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
          </div>
          <p className="text-gray-600 font-ubuntu text-[13px]">
            Chat. Share. Connect with friends instantly 💬
          </p>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-600 text-center text-sm mb-3">{error}</p>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div className="space-y-5">
            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-500" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                placeholder="Email Address"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300"
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition duration-300"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe((prev) => !prev)}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-1.5 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-500 transition duration-300"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          {/* Submit button with spinner */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-[14px] bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : null}
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Success message */}
        {data && (
          <p className="text-green-600 text-center mt-3">{data.message}</p>
        )}

        {/* Social Login */}
        <div className="mt-5">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-600">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <GoogleButton />
            <FacebookButton />
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-700 text-[14px]">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-700 hover:text-blue-500 hover:underline transition duration-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
