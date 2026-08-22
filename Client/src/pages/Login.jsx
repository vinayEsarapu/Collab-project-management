import { useState } from "react";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/Authcontext";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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
      const response = await loginUser(formData);

      const { user, accessToken } = response.data;

      login(user, accessToken);

      console.log("Login successful");

      // We will connect the actual JWT response here
      // after confirming your backend response structure.
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

    //console.log(formData);
  

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
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

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;