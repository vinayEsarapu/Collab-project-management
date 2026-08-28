import { BrowserRouter, Routes, Route, Outlet, } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/Createprojects";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectDetails from "./pages/Projectdetails";
import Issues from "./pages/issues";
import IssueDetails from "./pages/issueDetails";
import Projects from "./pages/Projects";

function ProtectedLayout() {
  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
        {/* Protected layout */}
          <Route element={<ProtectedLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />

          <Route
          path="/projects"
          element={<Projects />}
          />

            <Route
            path="/projects/new"
            element={<CreateProject />}
           />

          <Route
            path="/projects/:id"
            element={<ProjectDetails />}
          />

           <Route
            path="/projects/:id/issues"
            element={<Issues />}
          />

          <Route
           path="/projects/:id/issues/:issueId"
           element={<IssueDetails />}
          />

          
        </Route>
         </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;