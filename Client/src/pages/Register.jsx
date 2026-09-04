import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await registerUser(formData);

      // Registration is complete.
      // User must login with the newly created account.
      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top bar */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <NavLink
            to="/"
            className="text-lg font-bold tracking-tight text-white transition-colors duration-200 hover:text-slate-300"
          >
            Collab PM
          </NavLink>
        </div>
      </header>

      {/* Register section */}
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-8 text-center">
            

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Create your account
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Start organizing projects and tracking issues with Collab PM.
            </p>
          </div>

          {/* Register Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-300"
                >
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-white/30 focus:ring-2 focus:ring-white/10"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-white/30 focus:ring-2 focus:ring-white/10"
                />
              </div>

              {/* Password */}
             {/* Password */}
<div>
  <label
    htmlFor="password"
    className="mb-2 block text-sm font-medium text-slate-200"
  >
    Password
  </label>

  <div className="relative">
    <input
      id="password"
      type={showPassword ? "text" : "password"}
      name="password"
      value={formData.password}
      onChange={handleChange}
      placeholder="Create a password"
      autoComplete="new-password"
      required
      className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 pr-12 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-white/30 focus:ring-2 focus:ring-white/10"
    />

    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors duration-200 hover:text-slate-200"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? "🙈" : "👁️"}
    </button>
  </div>
</div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* Login link */}
            <div className="mt-6 border-t border-white/10 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <NavLink
                  to="/login"
                  className="font-medium text-white transition-colors duration-200 hover:text-slate-300"
                >
                  Sign In
                </NavLink>
              </p>
            </div>
          </div>

          {/* Back to home */}
          <div className="absolute top-20 left-10">
            <NavLink
              to="/"
              className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-300"
            >
              ← Back to Collab PM
            </NavLink>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;