import { useState } from "react";
import { registerUser } from "../services/authService";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const response = await registerUser(formData);

    console.log("Registration successful:", response.data);
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
    //console.log(formData);
  

  return (
    <div>
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit}>
        {error && (
  <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
    {error}
  </div>
)}
        <div>
          <label>Name</label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

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
          {loading ? "Creating account..." : "Create Account"}
          Register
          </button>
      </form>
    </div>
  );
}

export default Register;