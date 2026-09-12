import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

 const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        `/auth/reset-password/${token}`,
        {
          password,
        }
      );

      setSuccess(
        response.data?.message ||
          "Password reset successful. Please login with your new password."
      );

      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
setShowConfirmPassword(false);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to reset your password. The link may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-6 sm:p-8">
          {!success ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white">
                  Reset Password
                </h1>

                <p className="text-gray-400 text-sm mt-2">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    New Password
                  </label>

                 <div className="relative">
  <input
    id="password"
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Enter new password"
    autoComplete="new-password"
    disabled={loading}
    className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />

  <button
    type="button"
    onClick={() =>
      setShowPassword((previous) => !previous)
    }
    disabled={loading}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition disabled:cursor-not-allowed"
    aria-label={
      showPassword
        ? "Hide password"
        : "Show password"
    }
  >
    {showPassword ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3l18 18"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.58 10.58a2 2 0 002.84 2.84"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.88 4.24A9.77 9.77 0 0112 4c5 0 8.5 4 10 8a16.7 16.7 0 01-4.12 5.36"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.61 6.61C4.92 7.74 3.69 9.4 2 12c1.5 4 5 8 10 8 1.61 0 3.07-.39 4.39-1.09"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  </button>
</div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Confirm New Password
                  </label>

                <div className="relative">
  <input
    id="confirmPassword"
    type={showConfirmPassword ? "text" : "password"}
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    placeholder="Confirm new password"
    autoComplete="new-password"
    disabled={loading}
    className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />

  <button
    type="button"
    onClick={() =>
      setShowConfirmPassword((previous) => !previous)
    }
    disabled={loading}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition disabled:cursor-not-allowed"
    aria-label={
      showConfirmPassword
        ? "Hide password"
        : "Show password"
    }
  >
    {showConfirmPassword ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3l18 18"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.58 10.58a2 2 0 002.84 2.84"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.88 4.24A9.77 9.77 0 0112 4c5 0 8.5 4 10 8a16.7 16.7 0 01-4.12 5.36"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.61 6.61C4.92 7.74 3.69 9.4 2 12c1.5 4 5 8 10 8 1.61 0 3.07-.39 4.39-1.09"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  </button>
</div>
                </div>

                <p className="text-xs text-gray-500">
                  Password must contain at least 8 characters.
                </p>

                {error && (
                  <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full mt-4 text-sm text-gray-400 hover:text-white transition"
              >
                Back to Login
              </button>
            </>
          ) : (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">
                Password Reset Successful
              </h1>

              <p className="text-gray-400 text-sm mt-3 leading-6">
                {success}
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;