import { useAuth } from "../context/Authcontext";

function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <p>
        Welcome, {user?.name}
      </p>

      <p>
        Email: {user?.email}
      </p>

      <p>
        Role: {user?.role}
      </p>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;