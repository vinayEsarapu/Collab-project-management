import { useState } from "react";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";


function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();


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

    const response = await loginUser(formData);
    const { user, accessToken } = response.data;

    login(user, accessToken);
    navigate("/dashboard");

  } catch (error) {
    setError(
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      "Login failed. Please check your email and password."
    );
  } finally {
    setLoading(false);
  }
};
    //console.log(formData);
  

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        {error && (
  <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
    {error}
  </div>
)}
        <div>
          <label>Email</label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button 
        type="submit"
        disabled={loading}
    >
       {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;