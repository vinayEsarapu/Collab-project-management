import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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