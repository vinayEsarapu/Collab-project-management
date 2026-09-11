import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(email.trim());

      setMessage(
        response.message ||
          "If an account exists with this email, a password reset link has been sent."
      );

      setSubmitted(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to process your request. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-6 sm:p-8">
          {!submitted ? (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white">
                  Forgot Password?
                </h1>

                <p className="text-gray-400 text-sm mt-2">
                  Enter your registered email address and we&apos;ll send you a
                  password reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className= "w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
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
              <div className="mb-5">
                <h1 className="text-2xl font-bold text-white">
                  Check Your Email
                </h1>

                <p className="text-gray-400 text-sm mt-3 leading-6">
                  {message}
                </p>
              </div>

              <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-sm">
                  The reset link will expire after 15 minutes. If you don&apos;t
                  receive an email, check your spam folder.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;