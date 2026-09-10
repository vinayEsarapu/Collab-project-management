import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import PageLoader from "../pages/PageLoader";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;