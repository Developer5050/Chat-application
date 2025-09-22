import React, { useState, useCallback } from "react";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Logo from "../../assets/logo2.jpeg";
import useApiHook from "../../hooks/useApiHook";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    password: false,
    confirmPassword: false,
  });

  const navigate = useNavigate();
  const { loading, error, data, apiCall } = useApiHook();

  // 🔹 Optimized change handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // 🔹 Toggle password visibility
  const togglePassword = useCallback((field) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  // 🔹 Submit handler
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match ❌");
        return;
      }

      // ✅ ConfirmPassword ko exclude karo
      const { confirmPassword, ...payload } = formData;
      console.log("Payload for signup:", payload);

      const response = await apiCall(
        "http://localhost:5000/api/auth/register",
        "POST",
        payload // sirf username, email, password
      );

      if (response) {
        toast.success("Signup successful 🎉 Please login");
        navigate("/");
      }
    },
    [formData, apiCall, navigate]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center p-4 font-ubuntu">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 sm:p-7">
        {/* Header */}
        <div className="text-center mb-3">
          <div className="flex justify-center items-center gap-1 mb-2">
            <div className="w-12 h-12 shadow-md">
              <img src={Logo} alt="Smart Chat Logo" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Sign up</h2>
          </div>
          <p className="text-gray-600 font-ubuntu text-[13px]">
            Chat instantly. Connect globally with Smart Chat
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            {/* Username */}
            <div className="relative">
              <FaUser className="absolute inset-y-0 left-3 mt-3 text-gray-500" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Username"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <FaEnvelope className="absolute inset-y-0 left-3 mt-3 text-gray-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email Address"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FaLock className="absolute inset-y-0 left-3 mt-3 text-gray-500" />
              <input
                type={show.password ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePassword("password")}
              >
                {show.password ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <FaLock className="absolute inset-y-0 left-3 mt-3 text-gray-500" />
              <input
                type={show.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm Password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => togglePassword("confirmPassword")}
              >
                {show.confirmPassword ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </button>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label
              htmlFor="terms"
              className="ml-2 block text-[13px] text-gray-700"
            >
              I agree to the{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full text-[14px] bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 flex items-center justify-center"
            disabled={loading}
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
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {/* Error / Success */}
        {error && <p className="text-red-600 text-center mt-3">{error}</p>}
        {data && (
          <p className="text-green-600 text-center mt-3">{data.message}</p>
        )}

        {/* Sign in link */}
        <div className="mt-6 text-center">
          <p className="text-gray-700 text-[14px]">
            Already have an account?{" "}
            <Link
              to="/"
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition duration-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
