import { useEffect,  useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";



  const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  const verificationStarted = useRef(false);

  useEffect(() => {
  if (verificationStarted.current) {
    return;
  }

  verificationStarted.current = true;

    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing email verification link.");
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email/${token}`);

        setStatus("success");
        setMessage(
          response.data?.message ||
            "Email changed successfully. Please login again."
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Unable to verify your email. The link may be invalid or expired."
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-6 sm:p-8 text-center">
          {status === "verifying" && (
            <>
              <h1 className="text-2xl font-bold text-white">
                Verifying Email
              </h1>

              <p className="text-gray-400 text-sm mt-3">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <h1 className="text-2xl font-bold text-white">
                Email Changed Successfully
              </h1>

              <p className="text-green-400 text-sm mt-3 leading-6">
                {message}
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Go to Login
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="text-2xl font-bold text-white">
                Verification Failed
              </h1>

              <p className="text-red-400 text-sm mt-3 leading-6">
                {message}
              </p>

              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                Back to Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;